import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Clock, Route } from "lucide-react";
import { getCityCoords } from "@/data/beninCities";
import { getDistance } from "@/hooks/useRides";

// Fix for default marker icons
const createIcon = (color: string) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background: ${color};
    width: 24px;
    height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const departureIcon = createIcon('#16a34a'); // Green
const arrivalIcon = createIcon('#dc2626');   // Red

interface RouteMapDisplayProps {
  departureCity: string;
  arrivalCity: string;
  departureCoords?: { lat: number; lng: number };
  arrivalCoords?: { lat: number; lng: number };
  className?: string;
  showDetails?: boolean;
}

const RouteMapDisplay = ({
  departureCity,
  arrivalCity,
  departureCoords,
  arrivalCoords,
  className = "",
  showDetails = true,
}: RouteMapDisplayProps) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number | null;
    duration: string | null;
  }>({ distance: null, duration: null });

  // Get coordinates from city names if not provided
  const getCoords = (city: string, providedCoords?: { lat: number; lng: number }) => {
    if (providedCoords) return providedCoords;
    return getCityCoords(city);
  };

  const depCoords = getCoords(departureCity, departureCoords);
  const arrCoords = getCoords(arrivalCity, arrivalCoords);

  useEffect(() => {
    if (!mapDivRef.current || !depCoords || !arrCoords) return;

    // Calculate distance
    const distance = getDistance(departureCity, arrivalCity);
    if (distance) {
      // Estimate duration: ~50 km/h average in Benin
      const hours = Math.floor(distance / 50);
      const minutes = Math.round((distance / 50 - hours) * 60);
      const duration = hours > 0 
        ? `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}` 
        : `${minutes} min`;
      setRouteInfo({ distance, duration });
    }

    // Initialize map if not already done
    if (!mapRef.current) {
      const map = L.map(mapDivRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    L.marker([depCoords.lat, depCoords.lng], { icon: departureIcon })
      .addTo(map)
      .bindPopup(`<b>Départ:</b> ${departureCity}`);

    L.marker([arrCoords.lat, arrCoords.lng], { icon: arrivalIcon })
      .addTo(map)
      .bindPopup(`<b>Arrivée:</b> ${arrivalCity}`);

    // Draw route line with animation effect
    const routeLine = L.polyline(
      [[depCoords.lat, depCoords.lng], [arrCoords.lat, arrCoords.lng]],
      {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round',
      }
    ).addTo(map);

    // Fit bounds to show both markers with padding
    const bounds = L.latLngBounds(
      [depCoords.lat, depCoords.lng],
      [arrCoords.lat, arrCoords.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      // Cleanup on unmount
    };
  }, [depCoords?.lat, depCoords?.lng, arrCoords?.lat, arrCoords?.lng, departureCity, arrivalCity]);

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!depCoords || !arrCoords) {
    return (
      <div className={`bg-muted rounded-xl p-4 text-center text-muted-foreground ${className}`}>
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Impossible d'afficher l'itinéraire</p>
        <p className="text-xs">Coordonnées non disponibles pour ces villes</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Map */}
      <div ref={mapDivRef} className="h-48 md:h-64 w-full" />
      
      {/* Route details */}
      {showDetails && routeInfo.distance && (
        <div className="bg-card p-3 flex items-center justify-around border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Route className="w-4 h-4 text-primary" />
            <span className="font-medium">{routeInfo.distance} km</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">≈ {routeInfo.duration}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">→</span>
              <div className="w-3 h-3 rounded-full bg-destructive" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMapDisplay;
