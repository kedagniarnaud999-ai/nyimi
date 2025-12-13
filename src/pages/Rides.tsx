import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RideCard from '@/components/RideCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockRides } from '@/data/mockRides';
import { Ride } from '@/types/ride';
import { toast } from 'sonner';

const Rides = () => {
  const [searchParams] = useSearchParams();
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');

  const filteredRides = useMemo(() => {
    return mockRides.filter((ride) => {
      const matchOrigin = !origin || ride.origin.toLowerCase().includes(origin.toLowerCase());
      const matchDestination = !destination || ride.destination.toLowerCase().includes(destination.toLowerCase());
      const matchDate = !date || ride.date === date;
      return matchOrigin && matchDestination && matchDate;
    });
  }, [origin, destination, date]);

  const handleSelectRide = (ride: Ride) => {
    toast.success(
      <div>
        <p className="font-semibold">Trajet sélectionné !</p>
        <p className="text-sm">{ride.origin} → {ride.destination}</p>
        <p className="text-sm">Contactez {ride.driverName} pour confirmer</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Search Filters */}
        <section className="bg-card border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  placeholder="Ville de départ"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <Input
                  placeholder="Ville d'arrivée"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative md:w-48">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="soft" className="md:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Trajets disponibles
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredRides.length} trajet{filteredRides.length > 1 ? 's' : ''} trouvé{filteredRides.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredRides.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} onSelect={handleSelectRide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Aucun trajet trouvé
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou consultez les trajets populaires.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setOrigin('');
                  setDestination('');
                  setDate('');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Rides;
