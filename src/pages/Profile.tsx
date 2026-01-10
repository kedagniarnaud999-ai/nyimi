import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Phone, Car, Save, Star, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    bio: '',
    is_driver: false,
    vehicle_type: '' as '' | 'moto' | 'voiture' | 'minibus',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_color: '',
    license_plate: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        bio: profile.bio || '',
        is_driver: profile.is_driver || false,
        vehicle_type: (profile.vehicle_type as '' | 'moto' | 'voiture' | 'minibus') || '',
        vehicle_brand: profile.vehicle_brand || '',
        vehicle_model: profile.vehicle_model || '',
        vehicle_color: profile.vehicle_color || '',
        license_plate: profile.license_plate || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erreur lors du téléversement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          bio: formData.bio,
          is_driver: formData.is_driver,
          vehicle_type: formData.is_driver ? formData.vehicle_type || null : null,
          vehicle_brand: formData.is_driver ? formData.vehicle_brand : null,
          vehicle_model: formData.is_driver ? formData.vehicle_model : null,
          vehicle_color: formData.is_driver ? formData.vehicle_color : null,
          license_plate: formData.is_driver ? formData.license_plate : null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Mon profil
            </h1>
            <p className="text-muted-foreground mb-8">
              Gérez vos informations personnelles et vos préférences
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {profile?.full_name || 'Nouveau membre'}
                    </h2>
                    {profile && (
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Star className="w-4 h-4 fill-amber text-amber" />
                        <span>{profile.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{profile.total_rides} trajet{profile.total_rides > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {uploading && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Téléversement en cours...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informations personnelles
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="+229 XX XX XX XX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">À propos de moi</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Parlez un peu de vous..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Driver Section */}
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Mode conducteur
                  </h2>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="is_driver" className="text-muted-foreground">
                      {formData.is_driver ? 'Activé' : 'Désactivé'}
                    </Label>
                    <Switch
                      id="is_driver"
                      checked={formData.is_driver}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_driver: checked })
                      }
                    />
                  </div>
                </div>

                {formData.is_driver && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Ajoutez les informations de votre véhicule pour proposer des trajets
                    </p>
                    
                    {/* Type de véhicule */}
                    <div className="space-y-3">
                      <Label>Type de véhicule *</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'moto', label: 'Moto', seats: 1, icon: '🏍️' },
                          { value: 'voiture', label: 'Voiture', seats: 4, icon: '🚗' },
                          { value: 'minibus', label: 'Minibus', seats: 8, icon: '🚐' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, vehicle_type: type.value as 'moto' | 'voiture' | 'minibus' })}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                              formData.vehicle_type === type.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{type.icon}</span>
                            <span className="font-medium text-sm">{type.label}</span>
                            <span className="text-xs text-muted-foreground block">
                              {type.seats} place{type.seats > 1 ? 's' : ''} max
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_brand">Marque</Label>
                        <Input
                          id="vehicle_brand"
                          name="vehicle_brand"
                          value={formData.vehicle_brand}
                          onChange={handleChange}
                          placeholder="Toyota, Renault..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_model">Modèle</Label>
                        <Input
                          id="vehicle_model"
                          name="vehicle_model"
                          value={formData.vehicle_model}
                          onChange={handleChange}
                          placeholder="Corolla, Logan..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_color">Couleur</Label>
                        <Input
                          id="vehicle_color"
                          name="vehicle_color"
                          value={formData.vehicle_color}
                          onChange={handleChange}
                          placeholder="Blanc, Noir..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license_plate">Plaque d'immatriculation</Label>
                        <Input
                          id="license_plate"
                          name="license_plate"
                          value={formData.license_plate}
                          onChange={handleChange}
                          placeholder="AA 0000 RB"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" disabled={saving} className="w-full" size="lg">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
