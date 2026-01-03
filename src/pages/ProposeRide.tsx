import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Car, CreditCard, ArrowRight, Fuel, Map } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRides, getDistance, estimateFuelCost, suggestPricePerSeat, validatePrice } from '@/hooks/useRides';
import LocationMapPicker from '@/components/LocationMapPicker';

const ProposeRide = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { createRide } = useRides();
  
  const [submitting, setSubmitting] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<{
    fuelCost: number;
    min: number;
    suggested: number;
    max: number;
    distance: number;
  } | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [showDepartureMap, setShowDepartureMap] = useState(false);
  const [showArrivalMap, setShowArrivalMap] = useState(false);
  
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

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Vous devez être connecté pour proposer un trajet');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const distance = getDistance(formData.departure_city, formData.arrival_city);
    const seats = parseInt(formData.total_seats) || 4;
    
    if (distance) {
      const fuelCost = estimateFuelCost(distance);
      const prices = suggestPricePerSeat(distance, seats);
      setPriceEstimate({
        fuelCost,
        ...prices,
        distance,
      });
    } else {
      setPriceEstimate(null);
    }
  }, [formData.departure_city, formData.arrival_city, formData.total_seats]);

  // Validate price when it changes
  useEffect(() => {
    if (priceEstimate && formData.price) {
      const price = parseInt(formData.price);
      const { warning } = validatePrice(price, priceEstimate.suggested);
      setPriceWarning(warning);
    } else {
      setPriceWarning(null);
    }
  }, [formData.price, priceEstimate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

    if (!profile?.is_driver) {
      toast.error('Vous devez activer le mode conducteur dans votre profil');
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
                    <div className="flex gap-2">
                      <Input
                        id="departure_city"
                        name="departure_city"
                        placeholder="Ex: Cotonou"
                        value={formData.departure_city}
                        onChange={handleChange}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowDepartureMap(true)}
                        title="Sélectionner sur la carte"
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrival_city">Ville d'arrivée *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="arrival_city"
                        name="arrival_city"
                        placeholder="Ex: Porto-Novo"
                        value={formData.arrival_city}
                        onChange={handleChange}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowArrivalMap(true)}
                        title="Sélectionner sur la carte"
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    </div>
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
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Fuel className="w-4 h-4 text-primary" />
                      Estimation pour {priceEstimate.distance} km
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
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
                      <div className="bg-background rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Maximum</p>
                        <p className="font-semibold text-foreground">{priceEstimate.max.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">FCFA</p>
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
                    <p className="text-xs text-muted-foreground text-center">
                      Coût total estimé : {priceEstimate.fuelCost.toLocaleString()} FCFA (carburant + usure + péages) — partagé entre les passagers
                    </p>
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_seats">Nombre de places *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        id="total_seats"
                        name="total_seats"
                        min="1"
                        max="8"
                        placeholder="Ex: 3"
                        value={formData.total_seats}
                        onChange={handleChange}
                        className="pl-10"
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
                        className={`pl-10 ${priceWarning ? 'border-amber-500 focus-visible:ring-amber-500' : ''}`}
                      />
                    </div>
                    {priceWarning && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        ⚠️ {priceWarning}
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
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitting || !profile?.is_driver}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Publication...
                    </>
                  ) : (
                    <>
                      Publier mon trajet
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Votre véhicule : {profile?.vehicle_brand} {profile?.vehicle_model || 'Non configuré'}
                </p>
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
            setShowArrivalMap(false);
          }}
          onClose={() => setShowArrivalMap(false)}
        />
      )}
    </div>
  );
};

export default ProposeRide;
