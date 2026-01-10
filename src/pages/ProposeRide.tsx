import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Car, CreditCard, ArrowRight, Fuel, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRides, getDistance, suggestPricePerSeat, validatePrice, calculateDistanceFromCoords, getCityCoordinates } from '@/hooks/useRides';
import LocationMapPicker from '@/components/LocationMapPicker';
import CityAutocomplete from '@/components/CityAutocomplete';
import { findCity } from '@/data/beninCities';

const ProposeRide = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { createRide } = useRides();
  
  const [submitting, setSubmitting] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<{
    min: number;
    suggested: number;
    max: number;
    zemPrice: number;
    distance: number;
    commission: { rate: number; amount: number };
  } | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [showDepartureMap, setShowDepartureMap] = useState(false);
  const [showArrivalMap, setShowArrivalMap] = useState(false);
  const [departureCoords, setDepartureCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const [formData, setFormData] = useState({
    departure_city: '',
    arrival_city: '',
    departure_address: '',
    arrival_address: '',
    departure_date: '',
    departure_time: '',
    total_seats: '',
    price: '',
    description: '',
    allows_luggage: true,
    allows_smoking: false,
  });

  // Configuration des places max selon le type de véhicule
  const vehicleSeatsConfig = {
    moto: { max: 1, default: 1 },
    voiture: { max: 4, default: 3 },
    minibus: { max: 8, default: 6 },
  };

  const vehicleType = profile?.vehicle_type;
  const maxSeats = vehicleType ? vehicleSeatsConfig[vehicleType].max : 4;
  const defaultSeats = vehicleType ? vehicleSeatsConfig[vehicleType].default : 3;

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Vous devez être connecté pour proposer un trajet');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-définir le nombre de places selon le type de véhicule
  useEffect(() => {
    if (profile?.vehicle_type && !formData.total_seats) {
      const seats = vehicleSeatsConfig[profile.vehicle_type].default;
      setFormData(prev => ({ ...prev, total_seats: seats.toString() }));
    }
  }, [profile?.vehicle_type]);

  useEffect(() => {
    // Try to get distance from predefined cities first (with normalization)
    let distance = getDistance(formData.departure_city, formData.arrival_city);
    
    // If not found via predefined, try with stored coords
    if (!distance && departureCoords && arrivalCoords) {
      distance = calculateDistanceFromCoords(
        departureCoords.lat, departureCoords.lng,
        arrivalCoords.lat, arrivalCoords.lng
      );
    }
    
    // If still no distance, try to get coords from city names (fallback GPS)
    if (!distance && formData.departure_city && formData.arrival_city) {
      const depCoords = getCityCoordinates(formData.departure_city);
      const arrCoords = getCityCoordinates(formData.arrival_city);
      if (depCoords && arrCoords) {
        distance = calculateDistanceFromCoords(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng);
        // Mettre à jour les coords pour les futures utilisations
        if (!departureCoords) setDepartureCoords(depCoords);
        if (!arrivalCoords) setArrivalCoords(arrCoords);
      }
    }
    
    const seats = parseInt(formData.total_seats) || 4;
    
    if (distance && distance > 0) {
      const prices = suggestPricePerSeat(distance, seats);
      setPriceEstimate({
        min: prices.min,
        suggested: prices.suggested,
        max: prices.max,
        zemPrice: prices.zemPrice,
        distance,
        commission: prices.commission,
      });
    } else {
      setPriceEstimate(null);
    }
  }, [formData.departure_city, formData.arrival_city, formData.total_seats, departureCoords, arrivalCoords]);

  // Validate price when it changes
  useEffect(() => {
    if (priceEstimate && formData.price) {
      const price = parseInt(formData.price);
      const { warning } = validatePrice(price, priceEstimate.max);
      setPriceWarning(warning);
    } else {
      setPriceWarning(null);
    }
  }, [formData.price, priceEstimate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Conditions de blocage du formulaire
  const isPriceExceeded = priceEstimate && parseInt(formData.price) > priceEstimate.max;
  const isVehicleNotConfigured = profile?.is_driver && !profile?.vehicle_type;
  const isDriverModeOff = !profile?.is_driver;
  const isFormBlocked = isPriceExceeded || isVehicleNotConfigured || isDriverModeOff || submitting;

  // Calcul des gains nets (prix - commission)
  const netEarnings = priceEstimate && formData.price
    ? parseInt(formData.price) - Math.round(parseInt(formData.price) * priceEstimate.commission.rate)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departure_city || !formData.arrival_city || !formData.departure_date || !formData.departure_time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.total_seats || parseInt(formData.total_seats) < 1) {
      toast.error('Veuillez indiquer le nombre de places');
      return;
    }

    if (!formData.price || parseInt(formData.price) < 0) {
      toast.error('Veuillez indiquer un prix valide');
      return;
    }

    // Validation du plafond Nyì mì
    if (isPriceExceeded) {
      toast.error(`Prix trop élevé ! Le plafond Nyì mì est de ${priceEstimate!.max.toLocaleString()} FCFA`);
      return;
    }

    if (isDriverModeOff) {
      toast.error('Vous devez activer le mode conducteur dans votre profil');
      navigate('/profile');
      return;
    }

    if (isVehicleNotConfigured) {
      toast.error('Vous devez configurer votre type de véhicule dans votre profil');
      navigate('/profile');
      return;
    }

    setSubmitting(true);
    
    const result = await createRide({
      departure_city: formData.departure_city,
      arrival_city: formData.arrival_city,
      departure_address: formData.departure_address || undefined,
      arrival_address: formData.arrival_address || undefined,
      departure_date: formData.departure_date,
      departure_time: formData.departure_time,
      total_seats: parseInt(formData.total_seats),
      price: parseInt(formData.price),
      description: formData.description || undefined,
      allows_luggage: formData.allows_luggage,
      allows_smoking: formData.allows_smoking,
    });

    setSubmitting(false);
    
    if (result.success) {
      navigate('/rides');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Proposer un trajet
              </h1>
              <p className="text-muted-foreground">
                Partagez votre trajet et vos frais de carburant avec d'autres voyageurs
              </p>
            </div>

            {!profile?.is_driver && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-sm">
                  ⚠️ Vous devez d'abord activer le mode conducteur et ajouter votre véhicule dans{' '}
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="underline font-medium"
                  >
                    votre profil
                  </button>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
              {/* Route */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Itinéraire
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_city">Ville de départ *</Label>
                    <CityAutocomplete
                      value={formData.departure_city}
                      onChange={(value, coords) => {
                        setFormData(prev => ({ ...prev, departure_city: value }));
                        if (coords) setDepartureCoords(coords);
                      }}
                      onMapClick={() => setShowDepartureMap(true)}
                      placeholder="Ex: Cotonou"
                      icon="primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrival_city">Ville d'arrivée *</Label>
                    <CityAutocomplete
                      value={formData.arrival_city}
                      onChange={(value, coords) => {
                        setFormData(prev => ({ ...prev, arrival_city: value }));
                        if (coords) setArrivalCoords(coords);
                      }}
                      onMapClick={() => setShowArrivalMap(true)}
                      placeholder="Ex: Porto-Novo"
                      icon="secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure_address">Adresse de départ (optionnel)</Label>
                    <Input
                      id="departure_address"
                      name="departure_address"
                      placeholder="Quartier, point de repère..."
                      value={formData.departure_address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrival_address">Adresse d'arrivée (optionnel)</Label>
                    <Input
                      id="arrival_address"
                      name="arrival_address"
                      placeholder="Quartier, point de repère..."
                      value={formData.arrival_address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Price Estimate */}
                {priceEstimate && (
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Fuel className="w-4 h-4 text-primary" />
                        Estimation pour {priceEstimate.distance} km
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Prix zem : {priceEstimate.zemPrice.toLocaleString()} FCFA
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {priceEstimate.distance <= 10 ? 'Trajet court (≤10 km) : max 66% du zem' : 'Trajet long (>10 km) : max 50% du zem'}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        Prix max autorisé : {priceEstimate.max.toLocaleString()} FCFA
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-background rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Minimum</p>
                        <p className="font-semibold text-foreground">{priceEstimate.min.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">FCFA</p>
                      </div>
                      <div 
                        className="bg-primary/10 border border-primary/20 rounded-lg p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => setFormData(prev => ({ ...prev, price: priceEstimate.suggested.toString() }))}
                        title="Cliquer pour appliquer ce prix"
                      >
                        <p className="text-xs text-primary">Suggéré</p>
                        <p className="font-bold text-primary">{priceEstimate.suggested.toLocaleString()}</p>
                        <p className="text-xs text-primary">FCFA</p>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setFormData(prev => ({ ...prev, price: priceEstimate.suggested.toString() }))}
                    >
                      Appliquer le prix suggéré ({priceEstimate.suggested.toLocaleString()} FCFA)
                    </Button>
                    
                    <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        💡 Commission Nyì mì : {(priceEstimate.commission.rate * 100).toFixed(0)}% prélevée après le trajet
                      </p>
                      {netEarnings && (
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-sm font-medium text-foreground">Vous recevrez :</span>
                          <span className="text-lg font-bold text-green-600">
                            {netEarnings.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Date et heure de départ
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_date">Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="date"
                        id="departure_date"
                        name="departure_date"
                        value={formData.departure_date}
                        onChange={handleChange}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure_time">Heure *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="time"
                        id="departure_time"
                        name="departure_time"
                        value={formData.departure_time}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Seats */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Places et préférences
                </h2>
                
                {/* Affichage du type de véhicule */}
                {vehicleType && (
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                    <span className="text-2xl">
                      {vehicleType === 'moto' ? '🏍️' : vehicleType === 'voiture' ? '🚗' : '🚐'}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {vehicleType === 'moto' ? 'Moto' : vehicleType === 'voiture' ? 'Voiture' : 'Minibus'}
                        {profile?.vehicle_brand && profile?.vehicle_model && (
                          <span className="text-muted-foreground font-normal">
                            {' '}— {profile.vehicle_brand} {profile.vehicle_model}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {maxSeats} place{maxSeats > 1 ? 's' : ''} maximum disponible{maxSeats > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
                
                {!vehicleType && profile?.is_driver && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      ⚠️ Veuillez définir votre type de véhicule dans{' '}
                      <button onClick={() => navigate('/profile')} className="underline font-medium">
                        votre profil
                      </button>
                    </p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_seats">
                      Nombre de places *
                      {vehicleType === 'moto' && (
                        <span className="text-xs text-muted-foreground ml-2">(fixé à 1 pour moto)</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        id="total_seats"
                        name="total_seats"
                        min="1"
                        max={maxSeats}
                        placeholder={`1-${maxSeats}`}
                        value={formData.total_seats}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val <= maxSeats) {
                            setFormData(prev => ({ ...prev, total_seats: e.target.value }));
                          } else {
                            setFormData(prev => ({ ...prev, total_seats: maxSeats.toString() }));
                            toast.info(`Maximum ${maxSeats} place${maxSeats > 1 ? 's' : ''} pour ce type de véhicule`);
                          }
                        }}
                        className="pl-10"
                        disabled={vehicleType === 'moto'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix par passager (FCFA) *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        placeholder="Ex: 500"
                        value={formData.price}
                        onChange={handleChange}
                        className={`pl-10 ${isPriceExceeded ? 'border-destructive focus-visible:ring-destructive' : priceWarning ? 'border-amber-500 focus-visible:ring-amber-500' : ''}`}
                      />
                    </div>
                    {isPriceExceeded && (
                      <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                        🚫 Prix trop élevé ! Maximum {priceEstimate?.max.toLocaleString()} FCFA
                      </p>
                    )}
                    {priceWarning && !isPriceExceeded && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        ⚠️ {priceWarning}
                      </p>
                    )}
                    {netEarnings && !isPriceExceeded && (
                      <p className="text-xs text-green-600 font-medium">
                        💰 Gains nets : {netEarnings.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="allows_luggage"
                      checked={formData.allows_luggage}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, allows_luggage: checked })
                      }
                    />
                    <Label htmlFor="allows_luggage">Bagages autorisés</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="allows_smoking"
                      checked={formData.allows_smoking}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, allows_smoking: checked })
                      }
                    />
                    <Label htmlFor="allows_smoking">Fumeur autorisé</Label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Précisions sur le trajet, points d'arrêt..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="pt-4 space-y-4">
                {/* Alertes de blocage */}
                {isVehicleNotConfigured && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2">
                      🚗 Configurez votre type de véhicule dans{' '}
                      <button onClick={() => navigate('/profile')} className="underline">
                        votre profil
                      </button>
                    </p>
                  </div>
                )}
                
                {isPriceExceeded && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">
                      🚫 Le prix dépasse le plafond autorisé ({priceEstimate?.max.toLocaleString()} FCFA)
                    </p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className={`w-full ${isFormBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  size="lg"
                  disabled={isFormBlocked}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Publication...
                    </>
                  ) : isFormBlocked ? (
                    <>
                      🚫 Publication bloquée
                    </>
                  ) : (
                    <>
                      Publier mon trajet
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                {profile?.vehicle_type && (
                  <p className="text-center text-sm text-muted-foreground">
                    {profile.vehicle_type === 'moto' ? '🏍️' : profile.vehicle_type === 'voiture' ? '🚗' : '🚐'}{' '}
                    {profile?.vehicle_brand} {profile?.vehicle_model}
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      {/* Map Pickers */}
      {showDepartureMap && (
        <LocationMapPicker
          title="Sélectionner le point de départ"
          onSelectLocation={(location) => {
            const cityName = location.name.split(',')[0];
            setFormData(prev => ({
              ...prev,
              departure_city: cityName,
              departure_address: location.name
            }));
            setDepartureCoords({ lat: location.lat, lng: location.lng });
            setShowDepartureMap(false);
          }}
          onClose={() => setShowDepartureMap(false)}
        />
      )}

      {showArrivalMap && (
        <LocationMapPicker
          title="Sélectionner le point d'arrivée"
          onSelectLocation={(location) => {
            const cityName = location.name.split(',')[0];
            setFormData(prev => ({
              ...prev,
              arrival_city: cityName,
              arrival_address: location.name
            }));
            setArrivalCoords({ lat: location.lat, lng: location.lng });
            setShowArrivalMap(false);
          }}
          onClose={() => setShowArrivalMap(false)}
        />
      )}
    </div>
  );
};

export default ProposeRide;
