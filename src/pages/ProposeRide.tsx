import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Car, CreditCard, ArrowRight, Fuel } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRides, estimateFuelCost, beninDistances } from '@/hooks/useRides';
import LocationPicker from '@/components/LocationPicker';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

const ProposeRide = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { createRide } = useRides();
  
  const [submitting, setSubmitting] = useState(false);
  const [fuelEstimate, setFuelEstimate] = useState<number | null>(null);
  
  const [departureLocation, setDepartureLocation] = useState<Location>({ lat: 0, lng: 0, address: '', city: '' });
  const [arrivalLocation, setArrivalLocation] = useState<Location>({ lat: 0, lng: 0, address: '', city: '' });
  
  const [formData, setFormData] = useState({
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
    // Calculate fuel cost estimation
    const departure = departureLocation.city.toLowerCase().trim();
    const arrival = arrivalLocation.city.toLowerCase().trim();
    
    // Find matching cities
    let distance: number | null = null;
    for (const [city, destinations] of Object.entries(beninDistances)) {
      if (departure.includes(city.toLowerCase())) {
        for (const [dest, dist] of Object.entries(destinations)) {
          if (arrival.includes(dest.toLowerCase())) {
            distance = dist;
            break;
          }
        }
      }
    }
    
    if (distance) {
      setFuelEstimate(estimateFuelCost(distance));
    } else {
      setFuelEstimate(null);
    }
  }, [departureLocation.city, arrivalLocation.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departureLocation.city || !arrivalLocation.city || !formData.departure_date || !formData.departure_time) {
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
      departure_city: departureLocation.city,
      arrival_city: arrivalLocation.city,
      departure_address: departureLocation.address || undefined,
      arrival_address: arrivalLocation.address || undefined,
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
              {/* Route with Map */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Itinéraire
                </h2>
                
                <LocationPicker
                  label="Lieu de départ *"
                  placeholder="Rechercher le lieu de départ..."
                  value={departureLocation}
                  onChange={setDepartureLocation}
                />
                
                <LocationPicker
                  label="Lieu d'arrivée *"
                  placeholder="Rechercher le lieu d'arrivée..."
                  value={arrivalLocation}
                  onChange={setArrivalLocation}
                />
                
                {/* Fuel Estimate */}
                {fuelEstimate && (
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-primary" />
                    <p className="text-sm">
                      <span className="text-muted-foreground">Estimation carburant : </span>
                      <span className="font-semibold text-foreground">{fuelEstimate.toLocaleString()} FCFA</span>
                      <span className="text-muted-foreground"> (à diviser par passager)</span>
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
                        className="pl-10"
                      />
                    </div>
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
    </div>
  );
};

export default ProposeRide;
