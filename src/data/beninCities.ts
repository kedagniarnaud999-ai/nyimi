// Liste normalisée des villes du Bénin avec variantes et coordonnées GPS
export interface BeninCity {
  name: string;          // Nom officiel/normalisé
  variants: string[];    // Variantes d'orthographe (accents, tirets, etc.)
  lat: number;
  lng: number;
  department: string;
}

export const beninCities: BeninCity[] = [
  // Atlantique
  { name: 'Cotonou', variants: ['cotonou', 'cotono', 'kotonou'], lat: 6.3654, lng: 2.4183, department: 'Littoral' },
  { name: 'Abomey-Calavi', variants: ['abomey calavi', 'abomey-calavi', 'abomeycalavi', 'calavi', 'abomey calavi'], lat: 6.4485, lng: 2.3558, department: 'Atlantique' },
  { name: 'Ouidah', variants: ['ouidah', 'whydah', 'ouida'], lat: 6.3631, lng: 2.0853, department: 'Atlantique' },
  { name: 'Allada', variants: ['allada', 'alada'], lat: 6.6667, lng: 2.1500, department: 'Atlantique' },
  { name: 'Tori-Bossito', variants: ['tori-bossito', 'tori bossito', 'toribossito', 'tori'], lat: 6.5000, lng: 2.1333, department: 'Atlantique' },
  { name: 'Zè', variants: ['ze', 'zè', 'zé'], lat: 6.6000, lng: 2.2167, department: 'Atlantique' },
  
  // Ouémé
  { name: 'Porto-Novo', variants: ['porto novo', 'porto-novo', 'portonovo', 'portono'], lat: 6.4969, lng: 2.6289, department: 'Ouémé' },
  { name: 'Sèmè-Kpodji', variants: ['seme kpodji', 'sème-kpodji', 'semekpodji', 'seme-kpodji', 'seme', 'sème'], lat: 6.3833, lng: 2.6167, department: 'Ouémé' },
  { name: 'Adjarra', variants: ['adjarra', 'adja', 'adjara'], lat: 6.5333, lng: 2.6833, department: 'Ouémé' },
  { name: 'Avrankou', variants: ['avrankou', 'avrankour'], lat: 6.5500, lng: 2.6500, department: 'Ouémé' },
  
  // Plateau
  { name: 'Pobè', variants: ['pobe', 'pobè', 'pobé'], lat: 6.9667, lng: 2.6667, department: 'Plateau' },
  { name: 'Kétou', variants: ['ketou', 'kétou', 'ketu'], lat: 7.3500, lng: 2.6000, department: 'Plateau' },
  { name: 'Sakété', variants: ['sakete', 'sakété', 'sakèté'], lat: 6.7333, lng: 2.6500, department: 'Plateau' },
  
  // Zou
  { name: 'Bohicon', variants: ['bohicon', 'bohikɔn'], lat: 7.1667, lng: 2.0667, department: 'Zou' },
  { name: 'Abomey', variants: ['abomey', 'abome', 'abomè'], lat: 7.1833, lng: 1.9833, department: 'Zou' },
  { name: 'Covè', variants: ['cove', 'covè', 'cové', 'kove'], lat: 7.2167, lng: 2.3333, department: 'Zou' },
  { name: 'Zagnanado', variants: ['zagnanado', 'zagnando'], lat: 7.2500, lng: 2.3333, department: 'Zou' },
  { name: 'Djidja', variants: ['djidja', 'djija'], lat: 7.3333, lng: 1.9333, department: 'Zou' },
  
  // Collines
  { name: 'Dassa-Zoumé', variants: ['dassa zoume', 'dassa-zoumé', 'dassazoume', 'dassa', 'dassa-zoumè'], lat: 7.7500, lng: 2.1833, department: 'Collines' },
  { name: 'Savalou', variants: ['savalou', 'savalu'], lat: 7.9333, lng: 1.9833, department: 'Collines' },
  { name: 'Glazoué', variants: ['glazoue', 'glazoué', 'glazouè'], lat: 7.9667, lng: 2.2333, department: 'Collines' },
  { name: 'Bantè', variants: ['bante', 'bantè', 'banté'], lat: 8.4167, lng: 1.8833, department: 'Collines' },
  { name: 'Ouèssè', variants: ['ouesse', 'ouèssè', 'ouessé'], lat: 8.4833, lng: 2.3833, department: 'Collines' },
  
  // Borgou
  { name: 'Parakou', variants: ['parakou', 'paraku'], lat: 9.3372, lng: 2.6303, department: 'Borgou' },
  { name: 'Tchaourou', variants: ['tchaourou', 'tchaorou', 'chaourou'], lat: 8.8833, lng: 2.6000, department: 'Borgou' },
  { name: 'Nikki', variants: ['nikki', 'niki'], lat: 9.9333, lng: 3.2000, department: 'Borgou' },
  { name: 'Bembèrèkè', variants: ['bembereke', 'bembèrèkè', 'bemberékè', 'bembe'], lat: 10.2167, lng: 2.6667, department: 'Borgou' },
  { name: "N'Dali", variants: ['ndali', "n'dali", 'n dali'], lat: 9.8500, lng: 2.7167, department: 'Borgou' },
  { name: 'Pèrèrè', variants: ['perere', 'pèrèrè', 'péréré'], lat: 9.9667, lng: 3.0000, department: 'Borgou' },
  { name: 'Kalalé', variants: ['kalale', 'kalalé', 'kalalè'], lat: 10.2833, lng: 3.3667, department: 'Borgou' },
  { name: 'Sinendé', variants: ['sinende', 'sinendé', 'sinendè'], lat: 10.3333, lng: 2.3833, department: 'Borgou' },
  
  // Alibori
  { name: 'Kandi', variants: ['kandi', 'candi'], lat: 11.1333, lng: 2.9333, department: 'Alibori' },
  { name: 'Malanville', variants: ['malanville', 'malanvil'], lat: 11.8667, lng: 3.3833, department: 'Alibori' },
  { name: 'Banikoara', variants: ['banikoara', 'banikoura'], lat: 11.3000, lng: 2.4333, department: 'Alibori' },
  { name: 'Gogounou', variants: ['gogounou', 'gogonou'], lat: 10.8333, lng: 2.8333, department: 'Alibori' },
  { name: 'Ségbana', variants: ['segbana', 'ségbana', 'sègbana'], lat: 10.9333, lng: 3.6833, department: 'Alibori' },
  { name: 'Karimama', variants: ['karimama', 'karimana'], lat: 12.0667, lng: 3.1833, department: 'Alibori' },
  
  // Atacora
  { name: 'Natitingou', variants: ['natitingou', 'natitigou', 'natitingu'], lat: 10.3000, lng: 1.3833, department: 'Atacora' },
  { name: 'Tanguiéta', variants: ['tanguieta', 'tanguiéta', 'tanguièta'], lat: 10.6167, lng: 1.2667, department: 'Atacora' },
  { name: 'Boukoumbé', variants: ['boukoumbe', 'boukoumbé', 'boukoumbè'], lat: 10.1833, lng: 1.1000, department: 'Atacora' },
  { name: 'Kouandé', variants: ['kouande', 'kouandé', 'kouandè', 'couandé'], lat: 10.3333, lng: 1.6833, department: 'Atacora' },
  { name: 'Cobly', variants: ['cobly', 'kobly'], lat: 10.4667, lng: 1.0000, department: 'Atacora' },
  { name: 'Matéri', variants: ['materi', 'matéri', 'matèri'], lat: 10.7000, lng: 0.9833, department: 'Atacora' },
  { name: 'Péhunco', variants: ['pehunco', 'péhunco', 'pèhunco'], lat: 10.2333, lng: 2.0000, department: 'Atacora' },
  { name: 'Kérou', variants: ['kerou', 'kérou', 'kèrou'], lat: 10.8333, lng: 2.1167, department: 'Atacora' },
  
  // Donga
  { name: 'Djougou', variants: ['djougou', 'djugu', 'djougou'], lat: 9.7000, lng: 1.6667, department: 'Donga' },
  { name: 'Bassila', variants: ['bassila', 'basila'], lat: 9.0000, lng: 1.6667, department: 'Donga' },
  { name: 'Copargo', variants: ['copargo', 'kopargo'], lat: 9.8500, lng: 1.5333, department: 'Donga' },
  { name: 'Ouaké', variants: ['ouake', 'ouaké', 'ouakè', 'wake'], lat: 9.6667, lng: 1.3833, department: 'Donga' },
  
  // Mono
  { name: 'Lokossa', variants: ['lokossa', 'lokosa'], lat: 6.6333, lng: 1.7167, department: 'Mono' },
  { name: 'Athiémé', variants: ['athieme', 'athiémé', 'athièmè'], lat: 6.5667, lng: 1.6667, department: 'Mono' },
  { name: 'Comé', variants: ['come', 'comé', 'comè', 'kome'], lat: 6.4000, lng: 1.8833, department: 'Mono' },
  { name: 'Grand-Popo', variants: ['grand popo', 'grand-popo', 'grandpopo', 'gd popo'], lat: 6.2833, lng: 1.8333, department: 'Mono' },
  { name: 'Bopa', variants: ['bopa'], lat: 6.5500, lng: 1.9833, department: 'Mono' },
  { name: 'Houéyogbé', variants: ['houeyogbe', 'houéyogbé', 'houeyogbè'], lat: 6.5167, lng: 1.7833, department: 'Mono' },
  
  // Couffo
  { name: 'Aplahoué', variants: ['aplahoue', 'aplahoué', 'aplahouè'], lat: 6.9333, lng: 1.6833, department: 'Couffo' },
  { name: 'Dogbo', variants: ['dogbo', 'dogbo-tota'], lat: 6.8000, lng: 1.7833, department: 'Couffo' },
  { name: 'Djakotomey', variants: ['djakotomey', 'djakotome'], lat: 6.9000, lng: 1.7167, department: 'Couffo' },
  { name: 'Klouékanmè', variants: ['klouekanme', 'klouékanmè', 'klouekanmé'], lat: 7.0333, lng: 1.7833, department: 'Couffo' },
  { name: 'Lalo', variants: ['lalo'], lat: 6.9167, lng: 1.8667, department: 'Couffo' },
  { name: 'Toviklin', variants: ['toviklin', 'toviklin'], lat: 6.8833, lng: 1.6167, department: 'Couffo' },
];

// Normaliser une chaîne pour la recherche (supprime accents, met en minuscule, supprime tirets)
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[-']/g, ' ')           // Remplace tirets/apostrophes par espaces
    .replace(/\s+/g, ' ')            // Normalise les espaces
    .trim();
};

// Trouver une ville par son nom (recherche avec variantes)
export const findCity = (input: string): BeninCity | null => {
  const normalizedInput = normalizeString(input);
  
  for (const city of beninCities) {
    // Vérifier le nom principal
    if (normalizeString(city.name) === normalizedInput) {
      return city;
    }
    // Vérifier les variantes
    for (const variant of city.variants) {
      if (normalizeString(variant) === normalizedInput) {
        return city;
      }
    }
  }
  
  return null;
};

// Recherche par préfixe pour autocomplétion
export const searchCities = (query: string, limit: number = 10): BeninCity[] => {
  if (!query || query.length < 1) return [];
  
  const normalizedQuery = normalizeString(query);
  const results: { city: BeninCity; score: number }[] = [];
  
  for (const city of beninCities) {
    const normalizedName = normalizeString(city.name);
    
    // Match exact au début = score élevé
    if (normalizedName.startsWith(normalizedQuery)) {
      results.push({ city, score: 100 - normalizedName.length });
      continue;
    }
    
    // Match partiel = score moyen
    if (normalizedName.includes(normalizedQuery)) {
      results.push({ city, score: 50 - normalizedName.length });
      continue;
    }
    
    // Vérifier les variantes
    for (const variant of city.variants) {
      const normalizedVariant = normalizeString(variant);
      if (normalizedVariant.startsWith(normalizedQuery)) {
        results.push({ city, score: 80 - normalizedVariant.length });
        break;
      }
      if (normalizedVariant.includes(normalizedQuery)) {
        results.push({ city, score: 30 - normalizedVariant.length });
        break;
      }
    }
  }
  
  // Trier par score et retourner les meilleurs résultats
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.city);
};

// Obtenir les coordonnées d'une ville (pour fallback GPS)
export const getCityCoords = (cityName: string): { lat: number; lng: number } | null => {
  const city = findCity(cityName);
  return city ? { lat: city.lat, lng: city.lng } : null;
};
