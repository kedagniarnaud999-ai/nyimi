import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Calendar, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RideCard from '@/components/RideCard';
import ReservationDialog from '@/components/ReservationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRides } from '@/hooks/useRides';

interface SelectedRide {
  id: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  departure_time: string;
  price: number;
  available_seats: number;
  driver: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const Rides = () => {
  const [searchParams] = useSearchParams();
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [selectedRide, setSelectedRide] = useState<SelectedRide | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { rides, loading, fetchRides } = useRides();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRides({
        origin: origin || undefined,
        destination: destination || undefined,
        date: date || undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [origin, destination, date]);

  const handleSelectRide = (ride: SelectedRide) => {
    setSelectedRide(ride);
    setDialogOpen(true);
  };

  const handleReservationSuccess = () => {
    fetchRides({
      origin: origin || undefined,
      destination: destination || undefined,
      date: date || undefined,
    });
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
              <Button 
                variant="outline" 
                className="md:w-auto"
                onClick={() => {
                  setOrigin('');
                  setDestination('');
                  setDate('');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
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
                {loading ? 'Chargement...' : `${rides.length} trajet${rides.length > 1 ? 's' : ''} trouvé${rides.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rides.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride) => (
                <RideCard 
                  key={ride.id} 
                  ride={{
                    id: ride.id,
                    driverName: ride.driver?.full_name || 'Conducteur',
                    driverPhoto: ride.driver?.avatar_url || undefined,
                    driverRating: ride.driver?.rating || 5,
                    origin: ride.departure_city,
                    destination: ride.arrival_city,
                    departureTime: ride.departure_time.slice(0, 5),
                    date: ride.departure_date,
                    availableSeats: ride.available_seats,
                    price: ride.price,
                    vehicleType: ride.driver?.vehicle_brand && ride.driver?.vehicle_model 
                      ? `${ride.driver.vehicle_brand} ${ride.driver.vehicle_model}`
                      : 'Non spécifié',
                  }}
                  onSelect={() => handleSelectRide({
                    id: ride.id,
                    departure_city: ride.departure_city,
                    arrival_city: ride.arrival_city,
                    departure_date: ride.departure_date,
                    departure_time: ride.departure_time,
                    price: ride.price,
                    available_seats: ride.available_seats,
                    driver: ride.driver,
                  })}
                />
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

      <ReservationDialog
        ride={selectedRide}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleReservationSuccess}
      />

      <Footer />
    </div>
  );
};

export default Rides;
