import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

interface LocationPickerProps {
  value?: Location;
  onChange: (location: Location) => void;
  placeholder?: string;
  label?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Rechercher une adresse...",
  label
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Default center: Bénin (Cotonou)
  const defaultCenter: [number, number] = [6.3654, 2.4183];
  const mapCenter: [number, number] = value ? [value.lat, value.lng] : defaultCenter;

  // Dynamically import map component only on client side
  useEffect(() => {
    if (showMap && !MapComponent) {
      import('./MapComponent').then((mod) => {
        setMapComponent(() => mod.default);
      });
    }
  }, [showMap, MapComponent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=bj&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr',
          },
        }
      );
      const data: SearchResult[] = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr',
          },
        }
      );
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Inconnu';
      onChange({
        lat,
        lng,
        address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city,
      });
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      onChange({
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: 'Inconnu',
      });
    }
  };

  const selectResult = (result: SearchResult) => {
    const city = result.address?.city || result.address?.town || result.address?.village || result.address?.municipality || 'Inconnu';
    onChange({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
      city,
    });
    setSearchQuery(result.display_name);
    setShowResults(false);
    setShowMap(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  const clearSelection = () => {
    onChange({ lat: 0, lng: 0, address: '', city: '' });
    setSearchQuery('');
    setShowMap(false);
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      {/* Search input */}
      <div ref={searchRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
              placeholder={placeholder}
              className="pl-10"
            />
          </div>
          <Button type="button" onClick={searchAddress} disabled={isSearching} variant="secondary">
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </Button>
          <Button 
            type="button" 
            onClick={() => setShowMap(!showMap)} 
            variant="outline"
            size="icon"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0"
              >
                <p className="text-sm text-foreground line-clamp-2">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected location display */}
      {value && value.address && (
        <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{value.city}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{value.address}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearSelection}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="relative h-64 rounded-lg overflow-hidden border border-border">
          {MapComponent ? (
            <MapComponent
              center={mapCenter}
              zoom={value ? 15 : 8}
              markerPosition={value && value.lat !== 0 ? [value.lat, value.lng] : null}
              onLocationSelect={handleMapClick}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Chargement de la carte...</span>
            </div>
          )}
          <p className="absolute bottom-2 left-2 text-xs bg-background/90 px-2 py-1 rounded text-muted-foreground">
            Cliquez sur la carte pour sélectionner un emplacement
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
