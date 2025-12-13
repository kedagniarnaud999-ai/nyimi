import { useState } from 'react';
import { MapPin, Calendar, Clock, Users, Car, CreditCard, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ProposeRide = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    seats: '',
    price: '',
    vehicle: '',
    paymentMethods: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePayment = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination || !formData.date || !formData.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    toast.success(
      <div>
        <p className="font-semibold">Trajet publié avec succès !</p>
        <p className="text-sm">{formData.origin} → {formData.destination}</p>
        <p className="text-sm">Les passagers peuvent maintenant vous contacter</p>
      </div>
    );
    
    navigate('/rides');
  };

  const paymentOptions = [
    { id: 'MTN', label: 'MTN Mobile Money', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { id: 'Moov', label: 'Moov Money', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 'Espèces', label: 'Espèces', color: 'bg-green-100 text-green-800 border-green-300' },
  ];

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

            <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
              {/* Route */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Itinéraire
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      name="origin"
                      placeholder="Ville de départ *"
                      value={formData.origin}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      name="destination"
                      placeholder="Ville d'arrivée *"
                      value={formData.destination}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Date et heure de départ
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Seats */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Véhicule
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="vehicle"
                    placeholder="Type de véhicule (ex: Toyota Corolla)"
                    value={formData.vehicle}
                    onChange={handleChange}
                  />
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      name="seats"
                      min="1"
                      max="8"
                      placeholder="Places disponibles"
                      value={formData.seats}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Prix par passager
                </h2>
                <div className="relative max-w-xs">
                  <Input
                    type="number"
                    name="price"
                    placeholder="Prix (FCFA)"
                    value={formData.price}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    FCFA
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  💡 Conseil : calculez le coût du carburant divisé par le nombre de passagers
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Modes de paiement acceptés
                </h2>
                <div className="flex flex-wrap gap-3">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => togglePayment(option.id)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        formData.paymentMethods.includes(option.id)
                          ? option.color + ' border-current'
                          : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" variant="hero" className="w-full">
                  Publier mon trajet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Commission Nyì mì : 5-10% sur chaque réservation
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
