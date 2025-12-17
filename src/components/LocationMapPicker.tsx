import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

interface LocationMapPickerProps {
  onSelectLocation: (location: { name: string; lat: number; lng: number }) => void;
  onClose: () => void;
  initialCenter?: [number, number];
  title: string;
}

const LocationMapPicker = ({ onSelectLocation, onClose, initialCenter, title }: LocationMapPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token from edge function
        const { data, error: fetchError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (fetchError || !data?.token) {
          setError('Impossible de charger la carte. Vérifiez la configuration Mapbox.');
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = data.token;

        // Center on Benin by default
        const center: [number, number] = initialCenter || [2.3158, 6.3703];

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: 7,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add click handler
        map.current.on('click', async (e) => {
          const { lng, lat } = e.lngLat;
          
          // Update or create marker
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          } else {
            marker.current = new mapboxgl.Marker({ color: '#22c55e' })
              .setLngLat([lng, lat])
              .addTo(map.current!);
          }

          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${data.token}&language=fr`
            );
            const geoData = await response.json();
            const placeName = geoData.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            setSelectedLocation({
              name: placeName,
              lat,
              lng
            });
          } catch {
            setSelectedLocation({
              name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              lat,
              lng
            });
          }
        });

        map.current.on('load', () => {
          setLoading(false);
        });

      } catch (err) {
        setError('Erreur lors du chargement de la carte');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [initialCenter]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
    }
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
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-destructive text-center px-4">{error}</p>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        {/* Selected location & actions */}
        <div className="p-4 border-t border-border space-y-3">
          {selectedLocation ? (
            <p className="text-sm text-muted-foreground truncate">
              <span className="font-medium text-foreground">Sélectionné:</span> {selectedLocation.name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cliquez sur la carte pour sélectionner un emplacement
            </p>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedLocation}
              className="flex-1"
            >
              Confirmer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapPicker;
