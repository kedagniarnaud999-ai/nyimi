import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-earth text-cream">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Nyì<span className="text-amber-light"> mì</span>
              </span>
            </div>
            <p className="text-cream/80 text-sm leading-relaxed max-w-sm">
              Plateforme de covoiturage solidaire au Bénin. Partagez vos trajets, 
              économisez sur le carburant et créez des liens communautaires.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link to="/" className="hover:text-amber-light transition-colors">Accueil</Link></li>
              <li><Link to="/rides" className="hover:text-amber-light transition-colors">Trouver un trajet</Link></li>
              <li><Link to="/propose" className="hover:text-amber-light transition-colors">Proposer un trajet</Link></li>
              <li><a href="#" className="hover:text-amber-light transition-colors">Comment ça marche</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-light" />
                +229 97 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-light" />
                contact@nyimi.bj
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-light" />
                Cotonou, Bénin
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-cream/60">
            © 2024 Nyì mì. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-sm text-cream/60">
            <a href="#" className="hover:text-amber-light transition-colors">Conditions</a>
            <a href="#" className="hover:text-amber-light transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
