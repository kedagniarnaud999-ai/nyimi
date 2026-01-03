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

// Constants for price calculation
const FUEL_PRICE_PER_LITER = 650; // FCFA per liter in Benin (2024)
const AVERAGE_CONSUMPTION = 8; // liters per 100km for typical car
const VEHICLE_WEAR_PER_KM = 15; // FCFA per km (maintenance, tires, etc.)
const TOLL_FEE_PER_100KM = 200; // FCFA average toll cost

// Fuel cost estimation based on distance
export const estimateFuelCost = (distanceKm: number): number => {
  const litersNeeded = (distanceKm * AVERAGE_CONSUMPTION) / 100;
  return Math.round(litersNeeded * FUEL_PRICE_PER_LITER);
};

// Full cost estimation (fuel + wear + tolls)
export const estimateTotalCost = (distanceKm: number): number => {
  const fuelCost = estimateFuelCost(distanceKm);
  const wearCost = distanceKm * VEHICLE_WEAR_PER_KM;
  const tollCost = (distanceKm / 100) * TOLL_FEE_PER_100KM;
  return Math.round(fuelCost + wearCost + tollCost);
};

// Suggested price per seat
// Le coût total du trajet est FIXE et partagé équitablement entre les passagers
// Plus il y a de passagers, moins chacun paie (économie de partage)
export const suggestPricePerSeat = (distanceKm: number, totalSeats: number = 4): { min: number; suggested: number; max: number; totalCost: number } => {
  const totalCost = estimateTotalCost(distanceKm);
  
  // Prix basé sur un remplissage moyen (2 passagers en moyenne)
  // Cela donne un prix équilibré qui couvre les frais même si pas complet
  const averagePassengers = Math.max(2, Math.floor(totalSeats / 2));
  const pricePerSeat = totalCost / averagePassengers;
  
  // Min = prix si toutes les places sont remplies (meilleur prix pour passagers)
  const minPricePerSeat = totalCost / totalSeats;
  
  // Max = prix si seulement 1 passager (couvre tous les frais)
  const maxPricePerSeat = totalCost;
  
  // Round to nearest 100 FCFA for cleaner prices
  const roundTo100 = (n: number) => Math.round(n / 100) * 100;
  
  return {
    min: roundTo100(minPricePerSeat),
    suggested: roundTo100(pricePerSeat),
    max: roundTo100(maxPricePerSeat * 0.8), // 80% du max pour rester compétitif
    totalCost,
  };
};

// Estimate price from coordinates distance (Haversine formula)
export const calculateDistanceFromCoords = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by 1.3 to account for road distance (not straight line)
  return Math.round(R * c * 1.3);
};

// Check if a price is within acceptable range
export const validatePrice = (price: number, suggested: number): { isValid: boolean; warning: string | null } => {
  const deviation = Math.abs(price - suggested) / suggested;
  
  if (price < suggested * 0.5) {
    return { isValid: true, warning: 'Prix très bas - vous risquez de ne pas couvrir vos frais' };
  }
  if (price > suggested * 2) {
    return { isValid: true, warning: 'Prix élevé - les passagers pourraient préférer d\'autres trajets' };
  }
  if (deviation > 0.3) {
    return { isValid: true, warning: 'Prix différent du suggéré - vérifiez que c\'est intentionnel' };
  }
  return { isValid: true, warning: null };
};

// Get distance between two cities (bidirectional lookup)
export const getDistance = (from: string, to: string): number | null => {
  const normalizedFrom = from.trim();
  const normalizedTo = to.trim();
  
  // Direct lookup
  if (beninDistances[normalizedFrom]?.[normalizedTo]) {
    return beninDistances[normalizedFrom][normalizedTo];
  }
  
  // Reverse lookup
  if (beninDistances[normalizedTo]?.[normalizedFrom]) {
    return beninDistances[normalizedTo][normalizedFrom];
  }
  
  return null;
};

// Comprehensive distances in Benin (in km) - major routes
export const beninDistances: Record<string, Record<string, number>> = {
  'Cotonou': {
    'Porto-Novo': 35,
    'Abomey-Calavi': 18,
    'Ouidah': 42,
    'Bohicon': 120,
    'Abomey': 135,
    'Parakou': 415,
    'Natitingou': 560,
    'Sèmè-Kpodji': 15,
    'Lokossa': 105,
    'Djougou': 460,
    'Kandi': 570,
    'Malanville': 680,
    'Savalou': 210,
    'Dassa-Zoumé': 200,
    'Glazoué': 230,
    'Tchaourou': 350,
    'Allada': 55,
    'Comé': 70,
    'Grand-Popo': 85,
  },
  'Porto-Novo': {
    'Abomey-Calavi': 50,
    'Sèmè-Kpodji': 25,
    'Adjarra': 10,
    'Pobè': 45,
    'Kétou': 85,
  },
  'Parakou': {
    'Natitingou': 150,
    'Bohicon': 295,
    'Djougou': 135,
    'Kandi': 160,
    'Tchaourou': 65,
    'Nikki': 90,
    'Bembèrèkè': 70,
    'N\'Dali': 25,
  },
  'Bohicon': {
    'Abomey': 8,
    'Lokossa': 75,
    'Savalou': 90,
    'Dassa-Zoumé': 80,
    'Covè': 25,
    'Zagnanado': 45,
  },
  'Natitingou': {
    'Djougou': 85,
    'Tanguiéta': 55,
    'Boukoumbé': 45,
    'Kouandé': 35,
  },
  'Lokossa': {
    'Comé': 40,
    'Grand-Popo': 55,
    'Athiémé': 15,
    'Aplahoué': 30,
    'Dogbo': 20,
  },
  'Djougou': {
    'Bassila': 65,
    'Copargo': 25,
    'Ouaké': 40,
  },
  'Kandi': {
    'Malanville': 110,
    'Banikoara': 50,
    'Gogounou': 35,
    'Ségbana': 85,
  },
  'Ouidah': {
    'Grand-Popo': 45,
    'Comé': 30,
    'Allada': 35,
  },
  'Abomey-Calavi': {
    'Allada': 25,
    'Tori-Bossito': 35,
    'Zè': 30,
  },
};
