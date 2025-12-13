import { MapPin, Calendar, Search, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/rides?origin=${origin}&destination=${destination}&date=${date}`);
  };

  const popularRoutes = [
    { from: 'Cotonou', to: 'Porto-Novo' },
    { from: 'Cotonou', to: 'Abomey-Calavi' },
    { from: 'Parakou', to: 'Natitingou' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="bg-card rounded-2xl shadow-card p-4 md:p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Origin */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <Input
              placeholder="Départ (ex: Cotonou)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Destination */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <Input
              placeholder="Destination (ex: Porto-Novo)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-12"
          />
        </div>

        {/* Search Button */}
        <Button type="submit" variant="hero" className="w-full">
          <Search className="w-5 h-5" />
          Rechercher un trajet
        </Button>
      </form>

      {/* Popular Routes */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">Trajets populaires</p>
        <div className="flex flex-wrap justify-center gap-2">
          {popularRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => {
                setOrigin(route.from);
                setDestination(route.to);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent text-sm font-medium text-accent-foreground hover:bg-muted transition-colors"
            >
              {route.from}
              <ArrowRight className="w-3 h-3" />
              {route.to}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
