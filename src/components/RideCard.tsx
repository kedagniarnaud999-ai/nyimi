import { MapPin, Clock, Users, Star, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Ride } from '@/types/ride';

interface RideCardProps {
  ride: Ride;
  onSelect: (ride: Ride) => void;
}

const RideCard = ({ ride, onSelect }: RideCardProps) => {
  const paymentBadges = {
    MTN: 'bg-amber-100 text-amber-800',
    Moov: 'bg-blue-100 text-blue-800',
    Espèces: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden group">
      <div className="p-4 md:p-5">
        {/* Driver Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={ride.driverPhoto}
            alt={ride.driverName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-accent"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{ride.driverName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-amber text-amber" />
              <span className="font-medium text-foreground">{ride.driverRating}</span>
              <span>• {ride.vehicleType}</span>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 h-8 bg-border" />
            <div className="w-3 h-3 rounded-full bg-secondary" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{ride.origin}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{ride.destination}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{ride.departureTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{ride.availableSeats} place{ride.availableSeats > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ride.paymentMethods.map((method) => (
            <span
              key={method}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadges[method]}`}
            >
              {method}
            </span>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">{ride.price}</span>
            <span className="text-sm text-muted-foreground ml-1">FCFA</span>
          </div>
          <Button onClick={() => onSelect(ride)} className="group-hover:bg-amber-dark">
            Réserver
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideCard;
