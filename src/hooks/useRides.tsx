import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface RideWithDriver {
  id: string;
  departure_city: string;
  arrival_city: string;
  departure_address: string | null;
  arrival_address: string | null;
  departure_date: string;
  departure_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  allows_luggage: boolean;
  allows_smoking: boolean;
  description: string | null;
  status: string;
  driver: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    vehicle_brand: string | null;
    vehicle_model: string | null;
    vehicle_color: string | null;
  } | null;
}

interface CreateRideData {
  departure_city: string;
  arrival_city: string;
  departure_address?: string;
  arrival_address?: string;
  departure_date: string;
  departure_time: string;
  price: number;
  total_seats: number;
  allows_luggage?: boolean;
  allows_smoking?: boolean;
  description?: string;
}

export const useRides = () => {
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchRides = async (filters?: {
    origin?: string;
    destination?: string;
    date?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(
            id,
            full_name,
            avatar_url,
            rating,
            vehicle_brand,
            vehicle_model,
            vehicle_color
          )
        `)
        .eq('status', 'active')
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true });

      if (filters?.origin) {
        query = query.ilike('departure_city', `%${filters.origin}%`);
      }
      if (filters?.destination) {
        query = query.ilike('arrival_city', `%${filters.destination}%`);
      }
      if (filters?.date) {
        query = query.eq('departure_date', filters.date);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRides(data as RideWithDriver[]);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Erreur lors du chargement des trajets');
    } finally {
      setLoading(false);
    }
  };

  const createRide = async (rideData: CreateRideData) => {
    if (!profile) {
      toast.error('Vous devez être connecté');
      return { success: false };
    }

    try {
      const { error } = await supabase.from('rides').insert({
        driver_id: profile.id,
        departure_city: rideData.departure_city,
        arrival_city: rideData.arrival_city,
        departure_address: rideData.departure_address,
        arrival_address: rideData.arrival_address,
        departure_date: rideData.departure_date,
        departure_time: rideData.departure_time,
        price: rideData.price,
        total_seats: rideData.total_seats,
        available_seats: rideData.total_seats,
        allows_luggage: rideData.allows_luggage ?? true,
        allows_smoking: rideData.allows_smoking ?? false,
        description: rideData.description,
      });

      if (error) throw error;

      toast.success('Trajet publié avec succès !');
      return { success: true };
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Erreur lors de la création du trajet');
      return { success: false };
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return {
    rides,
    loading,
    fetchRides,
    createRide,
  };
};

// Fuel cost estimation based on distance
export const estimateFuelCost = (distanceKm: number): number => {
  const fuelPricePerLiter = 650; // FCFA per liter in Benin
  const averageConsumption = 8; // liters per 100km
  const litersNeeded = (distanceKm * averageConsumption) / 100;
  return Math.round(litersNeeded * fuelPricePerLiter);
};

// Common distances in Benin (in km)
export const beninDistances: Record<string, Record<string, number>> = {
  'Cotonou': {
    'Porto-Novo': 35,
    'Abomey-Calavi': 18,
    'Ouidah': 42,
    'Bohicon': 120,
    'Parakou': 415,
    'Natitingou': 560,
    'Sèmè-Kpodji': 15,
  },
  'Porto-Novo': {
    'Cotonou': 35,
    'Abomey-Calavi': 50,
    'Sèmè-Kpodji': 25,
  },
  'Parakou': {
    'Cotonou': 415,
    'Natitingou': 150,
    'Bohicon': 295,
  },
};
