export interface Ride {
  id: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  origin: string;
  destination: string;
  departureTime: string;
  date: string;
  availableSeats: number;
  price: number;
  vehicleType: string;
  paymentMethods: ('MTN' | 'Moov' | 'Espèces')[];
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
}
