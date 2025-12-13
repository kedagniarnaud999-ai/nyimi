import { Shield, Wallet, Users, Smartphone, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import FeatureCard from '@/components/FeatureCard';
import RideCard from '@/components/RideCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { mockRides } from '@/data/mockRides';
import { useNavigate } from 'react-router-dom';
import { Ride } from '@/types/ride';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const featuredRides = mockRides.slice(0, 3);

  const handleSelectRide = (ride: Ride) => {
    toast.success(`Trajet sélectionné : ${ride.origin} → ${ride.destination}`);
  };

  const features = [
    {
      icon: Wallet,
      title: 'Prix carburant uniquement',
      description: 'Partagez les frais de carburant. Pas de profit, juste la solidarité entre voyageurs.',
      color: 'primary' as const,
    },
    {
      icon: Smartphone,
      title: 'Mobile Money',
      description: 'Payez facilement via MTN Mobile Money ou Moov Money. Simple et sécurisé.',
      color: 'secondary' as const,
    },
    {
      icon: Shield,
      title: 'Communauté vérifiée',
      description: 'Conducteurs et passagers vérifiés. Voyagez en toute confiance.',
      color: 'amber' as const,
    },
    {
      icon: Users,
      title: 'Solidarité locale',
      description: 'Créez des liens avec votre communauté. Ensemble, on va plus loin.',
      color: 'primary' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-sm font-medium text-accent-foreground mb-4 animate-fade-in">
              🚗 Covoiturage solidaire au Bénin
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 animate-slide-up">
              Partagez la route,{' '}
              <span className="text-gradient">partagez les coûts</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in">
              Nyì mì connecte conducteurs et passagers pour des trajets économiques 
              et solidaires à travers tout le Bénin.
            </p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi choisir <span className="text-primary">Nyì mì</span> ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution de transport adaptée aux réalités béninoises, 
              accessible à tous et respectueuse de l'environnement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rides Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Trajets disponibles
              </h2>
              <p className="text-muted-foreground">
                Découvrez les prochains départs près de chez vous
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/rides')}>
              Voir tous les trajets
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRides.map((ride, index) => (
              <div key={ride.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <RideCard ride={ride} onSelect={handleSelectRide} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vous êtes conducteur ?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
            Proposez vos trajets et partagez vos frais de carburant avec des passagers. 
            Gagnez du temps et de l'argent tout en aidant votre communauté.
          </p>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => navigate('/propose')}
            className="bg-card text-foreground hover:bg-accent"
          >
            Proposer un trajet
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Recherchez', desc: 'Entrez votre trajet et trouvez un conducteur' },
              { step: '2', title: 'Réservez', desc: 'Contactez le conducteur et confirmez votre place' },
              { step: '3', title: 'Voyagez', desc: 'Partagez le trajet et les frais de carburant' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-elevated">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
