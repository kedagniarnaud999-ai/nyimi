import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Minus, Plus, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useReservations } from '@/hooks/useReservations';
import RouteMapDisplay from './RouteMapDisplay';

interface RideInfo {
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

interface ReservationDialogProps {
  ride: RideInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type PaymentMethod = 'mtn_momo' | 'moov_money' | 'cash';

const ReservationDialog = ({ ride, open, onOpenChange, onSuccess }: ReservationDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReservation, loading } = useReservations();
  
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');

  const paymentOptions: { id: PaymentMethod; label: string; color: string }[] = [
    { id: 'mtn_momo', label: 'MTN MoMo', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { id: 'moov_money', label: 'Moov Money', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 'cash', label: 'Espèces', color: 'bg-green-100 text-green-800 border-green-300' },
  ];

  const handleReserve = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!ride) return;

    const result = await createReservation({
      ride_id: ride.id,
      seats_booked: seats,
      total_price: ride.price * seats,
      payment_method: paymentMethod,
    });

    if (result.success) {
      onOpenChange(false);
      setSeats(1);
      onSuccess?.();
    }
  };

  if (!ride) return null;

  const totalPrice = ride.price * seats;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Réserver ce trajet
          </DialogTitle>
          <DialogDescription>
            {ride.departure_city} → {ride.arrival_city}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Route Map */}
          <RouteMapDisplay
            departureCity={ride.departure_city}
            arrivalCity={ride.arrival_city}
            showDetails={true}
          />

          {/* Seats Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nombre de places
            </Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-3xl font-bold text-foreground w-12 text-center">
                {seats}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSeats(Math.min(ride.available_seats, seats + 1))}
                disabled={seats >= ride.available_seats}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {ride.available_seats} place{ride.available_seats > 1 ? 's' : ''} disponible{ride.available_seats > 1 ? 's' : ''}
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Mode de paiement
            </Label>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    paymentMethod === option.id
                      ? option.color + ' border-current'
                      : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total à payer</span>
              <div>
                <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">FCFA</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {seats} place{seats > 1 ? 's' : ''} × {ride.price.toLocaleString()} FCFA
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleReserve} disabled={loading} className="flex-1">
            {loading ? 'Réservation...' : 'Confirmer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
