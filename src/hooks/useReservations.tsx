import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CreateReservationData {
  ride_id: string;
  seats_booked: number;
  total_price: number;
  payment_method?: 'mtn_momo' | 'moov_money' | 'cash';
}

export const useReservations = () => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const createReservation = async (data: CreateReservationData) => {
    if (!profile) {
      toast.error('Vous devez être connecté pour réserver');
      return { success: false };
    }

    setLoading(true);
    try {
      // First check if seats are still available
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('available_seats, driver_id')
        .eq('id', data.ride_id)
        .single();

      if (rideError) throw rideError;

      if (ride.available_seats < data.seats_booked) {
        toast.error('Pas assez de places disponibles');
        return { success: false };
      }

      if (ride.driver_id === profile.id) {
        toast.error('Vous ne pouvez pas réserver votre propre trajet');
        return { success: false };
      }

      // Create the reservation
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          ride_id: data.ride_id,
          passenger_id: profile.id,
          seats_booked: data.seats_booked,
          total_price: data.total_price,
          payment_method: data.payment_method as "cash" | "moov_money" | "mtn_momo" | undefined,
          status: 'pending' as const,
        }]);

      if (reservationError) throw reservationError;

      // Update available seats
      const { error: updateError } = await supabase
        .from('rides')
        .update({ 
          available_seats: ride.available_seats - data.seats_booked 
        })
        .eq('id', data.ride_id);

      if (updateError) throw updateError;

      toast.success(
        <div>
          <p className="font-semibold">Réservation confirmée !</p>
          <p className="text-sm">Le conducteur a été notifié</p>
        </div>
      );

      return { success: true };
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Erreur lors de la réservation');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getUserReservations = async () => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          ride:rides(
            *,
            driver:profiles!rides_driver_id_fkey(
              full_name,
              avatar_url,
              phone_number
            )
          )
        `)
        .eq('passenger_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  };

  const getDriverReservations = async () => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          ride:rides!inner(
            *
          ),
          passenger:profiles!reservations_passenger_id_fkey(
            full_name,
            avatar_url,
            phone_number
          )
        `)
        .eq('ride.driver_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching driver reservations:', error);
      return [];
    }
  };

  const updateReservationStatus = async (
    reservationId: string, 
    status: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId);

      if (error) throw error;

      toast.success(`Réservation ${status === 'confirmed' ? 'confirmée' : status === 'cancelled' ? 'annulée' : 'complétée'}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Erreur lors de la mise à jour');
      return { success: false };
    }
  };

  return {
    loading,
    createReservation,
    getUserReservations,
    getDriverReservations,
    updateReservationStatus,
  };
};
