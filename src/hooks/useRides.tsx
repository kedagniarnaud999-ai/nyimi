import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { findCity, getCityCoords, normalizeString } from '@/data/beninCities';
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

// ============================================
// MODÈLE DE PRIX NYÌ MÌ
// ============================================
// Le prix Nyì mì est basé sur le prix moyen d'un zem (moto-taxi)
// - Distance ≤ 10 km : prix max = 66% du prix zem
// - Distance > 10 km : prix max = 50% du prix zem
// - Arrondi au multiple de 10 le plus proche
// - Commission de 5-10% appliquée après le trajet

// Prix zem moyen au Bénin (FCFA par km) - tarif 2024
const ZEM_PRICE_PER_KM = 100; // Prix moyen zem par km
const ZEM_BASE_PRICE = 150; // Prix minimum pour une course zem

// Calcul du prix zem pour une distance donnée
export const calculateZemPrice = (distanceKm: number): number => {
  if (distanceKm <= 0) return 0;
  // Prix zem = base + distance * tarif/km
  const rawPrice = ZEM_BASE_PRICE + (distanceKm * ZEM_PRICE_PER_KM);
  return roundToNearest10(rawPrice);
};

// Arrondir au multiple de 10 le plus proche
const roundToNearest10 = (n: number): number => Math.round(n / 10) * 10;

// Prix maximum Nyì mì autorisé selon la distance
export const calculateMaxNyimiPrice = (distanceKm: number): number => {
  const zemPrice = calculateZemPrice(distanceKm);
  // ≤ 10 km : 66% du zem, > 10 km : 50% du zem
  const percentage = distanceKm <= 10 ? 0.66 : 0.50;
  return roundToNearest10(zemPrice * percentage);
};

// Prix suggéré Nyì mì (un peu en dessous du max pour être attractif)
export const suggestNyimiPrice = (distanceKm: number): number => {
  const maxPrice = calculateMaxNyimiPrice(distanceKm);
  // Suggérer 85% du prix max pour être compétitif
  return roundToNearest10(maxPrice * 0.85);
};

// Prix minimum viable (pour couvrir un minimum de frais)
export const calculateMinNyimiPrice = (distanceKm: number): number => {
  const maxPrice = calculateMaxNyimiPrice(distanceKm);
  // Minimum = 40% du prix max
  return roundToNearest10(Math.max(100, maxPrice * 0.40));
};

// Calcul de la commission Nyì mì (5-10%)
export const calculateCommission = (price: number, distanceKm: number): { rate: number; amount: number } => {
  // 5% pour trajets > 20 km, 10% pour trajets courts
  const rate = distanceKm > 20 ? 0.05 : 0.10;
  const amount = roundToNearest10(price * rate);
  return { rate, amount };
};

// Suggested price per seat avec modèle Nyì mì
export const suggestPricePerSeat = (distanceKm: number, _totalSeats: number = 4): { 
  min: number; 
  suggested: number; 
  max: number; 
  zemPrice: number;
  totalCost: number;
  commission: { rate: number; amount: number };
} => {
  const zemPrice = calculateZemPrice(distanceKm);
  const maxPrice = calculateMaxNyimiPrice(distanceKm);
  const suggested = suggestNyimiPrice(distanceKm);
  const min = calculateMinNyimiPrice(distanceKm);
  const commission = calculateCommission(suggested, distanceKm);
  
  return {
    min,
    suggested,
    max: maxPrice,
    zemPrice,
    totalCost: zemPrice, // Pour affichage comparatif
    commission,
  };
};

// Fuel cost estimation (gardé pour référence)
const FUEL_PRICE_PER_LITER = 650;
const AVERAGE_CONSUMPTION = 8;

export const estimateFuelCost = (distanceKm: number): number => {
  const litersNeeded = (distanceKm * AVERAGE_CONSUMPTION) / 100;
  return Math.round(litersNeeded * FUEL_PRICE_PER_LITER);
};

// Estimate price from coordinates distance (Haversine formula)
export const calculateDistanceFromCoords = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3);
};

// Validate price - vérifier que le prix ne dépasse pas le plafond
export const validatePrice = (price: number, maxPrice: number): { isValid: boolean; warning: string | null } => {
  if (price > maxPrice) {
    return { 
      isValid: false, 
      warning: `Prix trop élevé ! Le plafond Nyì mì est de ${maxPrice.toLocaleString()} FCFA` 
    };
  }
  if (price < 100) {
    return { isValid: true, warning: 'Prix très bas - assurez-vous de couvrir vos frais' };
  }
  return { isValid: true, warning: null };
};

// Get distance between two cities (bidirectional lookup with normalization)
export const getDistance = (from: string, to: string): number | null => {
  // D'abord, chercher dans les villes normalisées
  const fromCity = findCity(from);
  const toCity = findCity(to);
  
  // Si les deux villes sont connues, chercher la distance prédéfinie
  const normalizedFrom = fromCity?.name || from.trim();
  const normalizedTo = toCity?.name || to.trim();
  
  // Direct lookup
  if (beninDistances[normalizedFrom]?.[normalizedTo]) {
    return beninDistances[normalizedFrom][normalizedTo];
  }
  
  // Reverse lookup
  if (beninDistances[normalizedTo]?.[normalizedFrom]) {
    return beninDistances[normalizedTo][normalizedFrom];
  }
  
  // Si les deux villes sont connues mais pas de distance prédéfinie, calculer via GPS
  if (fromCity && toCity) {
    return calculateDistanceFromCoords(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
  }
  
  return null;
};

// Get coordinates for a city (fallback GPS)
export const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
  return getCityCoords(cityName);
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
