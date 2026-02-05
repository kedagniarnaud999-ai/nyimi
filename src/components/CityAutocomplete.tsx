import { useState, useRef, useEffect } from 'react';
import { MapPin, Map, Navigation } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { searchCities, findCity, BeninCity } from '@/data/beninCities';
import { cn } from '@/lib/utils';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  onMapClick?: () => void;
  placeholder?: string;
  icon?: 'primary' | 'secondary';
  className?: string;
}

const CityAutocomplete = ({
  value,
  onChange,
  onMapClick,
  placeholder = 'Ville',
  icon = 'primary',
  className,
}: CityAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<BeninCity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche de suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    if (inputValue.length >= 1) {
      const results = searchCities(inputValue, 6);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // Sélection d'une suggestion
  const handleSelect = (city: BeninCity) => {
    onChange(city.name, { lat: city.lat, lng: city.lng });
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Géolocalisation automatique avec meilleure gestion d'erreurs
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      import('sonner').then(({ toast }) => {
        toast.error('Géolocalisation non supportée', {
          description: 'Votre navigateur ne supporte pas la géolocalisation'
        });
      });
      return;
    }

    setIsLocating(true);
    
    // Afficher un toast de chargement
    import('sonner').then(({ toast }) => {
      toast.loading('Localisation en cours...', { id: 'geoloc' });
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding avec Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=fr`,
            { headers: { 'User-Agent': 'NyiMi-App/1.0' } }
          );
          
          if (!response.ok) throw new Error('Erreur réseau');
          
          const data = await response.json();
          
          // Extraire le nom de la ville avec plus de fallbacks
          const cityName = data.address?.city || 
                          data.address?.town || 
                          data.address?.village || 
                          data.address?.municipality ||
                          data.address?.suburb ||
                          data.address?.county ||
                          data.name?.split(',')[0] || 
                          '';
          
          // Vérifier si c'est une ville connue du Bénin
          const knownCity = findCity(cityName);
          
          import('sonner').then(({ toast }) => {
            toast.dismiss('geoloc');
            if (knownCity) {
              onChange(knownCity.name, { lat: knownCity.lat, lng: knownCity.lng });
              toast.success(`📍 ${knownCity.name}`, {
                description: `${knownCity.department}, Bénin`
              });
            } else if (cityName) {
              onChange(cityName, { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
              });
              toast.success(`📍 ${cityName}`, {
                description: 'Position détectée'
              });
            } else {
              toast.warning('Position imprécise', {
                description: 'Impossible de déterminer votre ville'
              });
            }
          });
        } catch (error) {
          console.error('Erreur de géocodage:', error);
          import('sonner').then(({ toast }) => {
            toast.dismiss('geoloc');
            toast.error('Erreur de géocodage', {
              description: 'Impossible de trouver votre adresse'
            });
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setIsLocating(false);
        
        import('sonner').then(({ toast }) => {
          toast.dismiss('geoloc');
          
          let message = 'Erreur inconnue';
          let description = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Accès refusé';
              description = 'Autorisez la géolocalisation dans votre navigateur';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Position indisponible';
              description = 'Vérifiez votre connexion GPS';
              break;
            case error.TIMEOUT:
              message = 'Délai dépassé';
              description = 'La localisation a pris trop de temps';
              break;
          }
          
          toast.error(message, { description });
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 60000 // Cache position for 1 minute
      }
    );
  };

  // Valider à la perte de focus (trouver la ville et récupérer les coords)
  const handleBlur = () => {
    setTimeout(() => {
      if (value && !isOpen) {
        const city = findCity(value);
        if (city) {
          onChange(city.name, { lat: city.lat, lng: city.lng });
        }
      }
    }, 200);
  };

  const iconColor = icon === 'primary' ? 'text-primary' : 'text-secondary';

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className={cn('absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5', iconColor)} />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => value.length >= 1 && suggestions.length > 0 && setIsOpen(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="pl-12"
            autoComplete="off"
          />
        </div>
        
        {/* Bouton géolocalisation */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGeolocate}
          disabled={isLocating}
          title="Ma position"
        >
          <Navigation className={cn('w-4 h-4', isLocating && 'animate-pulse')} />
        </Button>
        
        {/* Bouton carte */}
        {onMapClick && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMapClick}
            title="Choisir sur la carte"
          >
            <Map className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Liste des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((city, index) => (
            <button
              key={city.name}
              type="button"
              className={cn(
                'w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3',
                index === selectedIndex && 'bg-muted'
              )}
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">{city.name}</div>
                <div className="text-xs text-muted-foreground">{city.department}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
