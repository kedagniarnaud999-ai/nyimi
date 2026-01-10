-- Ajouter le type de véhicule au profil
ALTER TABLE public.profiles 
ADD COLUMN vehicle_type text CHECK (vehicle_type IN ('moto', 'voiture', 'minibus')) DEFAULT NULL;