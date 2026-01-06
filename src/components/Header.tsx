import { Car, Menu, User, X, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/rides', label: 'Trajets' },
    { href: '/propose', label: 'Proposer' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Nyì<span className="text-primary"> mì</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1.5 h-auto rounded-lg hover:bg-accent transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(profile?.full_name || user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground max-w-[120px] truncate">
                      {profile?.full_name || 'Utilisateur'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  <User className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>Inscription</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'bg-accent text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(profile?.full_name || user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{profile?.full_name || 'Utilisateur'}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mon profil
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Connexion
                    </Button>
                    <Button
                      className="justify-center"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      Inscription
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
