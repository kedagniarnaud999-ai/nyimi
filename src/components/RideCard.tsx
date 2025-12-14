import { MapPin, Clock, Users, Star, ArrowRight, User } from 'lucide-react';
import { Button } from './ui/button';

interface RideCardRide {
  id: string;
  driverName: string;
  driverPhoto?: string;
  driverRating: number;
  origin: string;
  destination: string;
  departureTime: string;
  date: string;
  availableSeats: number;
  price: number;
  vehicleType: string;
}

interface RideCardProps {
  ride: RideCardRide;
  onSelect: () => void;
}

const RideCard = ({ ride, onSelect }: RideCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden group">
      <div className="p-4 md:p-5">
        {/* Driver Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-accent">
            {ride.driverPhoto ? (
              <img
                src={ride.driverPhoto}
                alt={ride.driverName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{ride.driverName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-amber text-amber" />
              <span className="font-medium text-foreground">{ride.driverRating.toFixed(1)}</span>
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

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">{ride.price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-1">FCFA</span>
          </div>
          <Button onClick={onSelect} disabled={ride.availableSeats === 0}>
            {ride.availableSeats === 0 ? 'Complet' : 'Réserver'}
            {ride.availableSeats > 0 && (
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideCard;
