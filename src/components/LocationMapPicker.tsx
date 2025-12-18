import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, X } from "lucide-react";
import { Button } from "./ui/button";

// Fix for default marker icon (Leaflet + Vite)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapPickerProps {
  onSelectLocation: (location: { name: string; lat: number; lng: number }) => void;
  onClose: () => void;
  initialCenter?: [number, number];
  title: string;
}

const LocationMapPicker = ({
  onSelectLocation,
  onClose,
  initialCenter,
  title,
}: LocationMapPickerProps) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Center on Benin by default
  const center: [number, number] = initialCenter || [6.3703, 2.3158];

  const handleLocationSelect = async (lat: number, lng: number) => {
    setIsGeocoding(true);

    try {
      // Use Nominatim (OpenStreetMap) for reverse geocoding - free, no API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`,
      );
      const data = await response.json();
      const placeName = data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      setSelectedLocation({ name: placeName, lat, lng });
    } catch {
      setSelectedLocation({ name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center,
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      void handleLocationSelect(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If initialCenter changes (rare), recenter map
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, mapRef.current.getZoom());
  }, [center[0], center[1]]);

  const handleConfirm = () => {
    if (selectedLocation) onSelectLocation(selectedLocation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Map container */}
        <div className="relative h-[400px]">
          <div ref={mapDivRef} className="h-full w-full" />
        </div>

        {/* Selected location & actions */}
        <div className="p-4 border-t border-border space-y-3">
          {isGeocoding ? (
            <p className="text-sm text-muted-foreground">Chargement de l'adresse...</p>
          ) : selectedLocation ? (
            <p className="text-sm text-muted-foreground truncate">
              <span className="font-medium text-foreground">Sélectionné:</span> {selectedLocation.name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Cliquez sur la carte pour sélectionner un emplacement</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedLocation || isGeocoding} className="flex-1">
              Confirmer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapPicker;
