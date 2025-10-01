import { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { MapPin, Sparkles, Calendar, ExternalLink, Plus } from 'lucide-react';

interface Idea {
  name: string;
  description: string;
  category: 'sightseeing' | 'food' | 'shopping' | 'activities' | 'other';
  estimatedCost?: string;
  bestTime?: string;
  link?: string;
}

const IDEAS_BY_DESTINATION: Record<string, Idea[]> = {
  'Pékin': [
    { name: 'Cité Interdite', description: 'Palais impérial avec 980 bâtiments, arriver tôt pour éviter la foule', category: 'sightseeing', estimatedCost: '60 CNY', bestTime: 'Matin (8h-10h)' },
    { name: 'Grande Muraille de Mutianyu', description: 'Section moins touristique avec téléphérique et toboggan', category: 'sightseeing', estimatedCost: '45 CNY + transport', bestTime: 'Toute la journée' },
    { name: 'Temple du Ciel', description: 'Architecture parfaite et parcs où les locaux font du tai-chi', category: 'sightseeing', estimatedCost: '15 CNY', bestTime: 'Matin (6h-9h)' },
    { name: 'Palais d\'Été', description: 'Jardin impérial avec lac, ponts et pavillons', category: 'sightseeing', estimatedCost: '30 CNY', bestTime: 'Après-midi' },
    { name: 'Hutongs en vélo', description: 'Ruelles traditionnelles autour du lac Houhai', category: 'activities', estimatedCost: '100-200 CNY', bestTime: 'Après-midi/soirée' },
    { name: 'Quartier Niujie (牛街)', description: 'Quartier musulman historique avec la plus grande mosquée de Pékin, street food halal', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Jubao Yuan (聚宝源)', description: 'Hot pot halal très populaire à Niujie, viande de qualité', category: 'food', estimatedCost: '80-150 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Niujie Halal Man Heng Ji', description: 'Restaurant Michelin Bib Gourmand, spécialité mouton bouilli au charbon', category: 'food', estimatedCost: '100-200 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Hong Bin Lou (halal)', description: 'Cuisine halal de Pékin incluant canard laqué halal et hot pot', category: 'food', estimatedCost: '150-300 CNY', bestTime: 'Dîner' },
    { name: 'Afunti (restaurant ouïghour)', description: 'Plus grand resto ouïghour de Pékin : brochettes, naan, cuisine d\'Asie centrale', category: 'food', estimatedCost: '80-150 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Niujie Snack Street', description: 'Street food halal : buns au bœuf, pain sésame, pancakes haricots rouges', category: 'food', estimatedCost: '30-60 CNY', bestTime: 'Déjeuner/goûter' },
    { name: 'Canard laqué de Pékin', description: 'Restaurant Quanjude ou Dadong pour le plat emblématique', category: 'food', estimatedCost: '200-400 CNY', bestTime: 'Dîner' },
    { name: 'Marché de nuit Wangfujing', description: 'Street food exotique : scorpions, étoiles de mer, brochettes', category: 'food', estimatedCost: '50-100 CNY', bestTime: 'Soir (18h-22h)' },
    { name: '798 Art District', description: 'Zone artistique avec galeries et cafés branchés', category: 'activities', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Sanlitun', description: 'Quartier branché pour bars, restaurants et vie nocturne', category: 'activities', estimatedCost: 'Variable', bestTime: 'Soir' }
  ],
  'Chongqing': [
    { name: 'Jiefangbei (解放碑)', description: 'Centre commercial animé avec street food, hot pot et brochettes', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi/soir' },
    { name: 'Hongya Cave (洪崖洞)', description: 'Architecture traditionnelle sur falaise inspirée du Voyage de Chihiro + street food', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Nuit (illuminé)' },
    { name: 'Chaotianmen (朝天门)', description: 'Confluence des deux fleuves, restaurants au bord de l\'eau', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Coucher de soleil' },
    { name: 'Zhaoer Hot Pot', description: 'Hot pot ultra-épicé recommandé par Lonely Planet, ambiance locale authentique', category: 'food', estimatedCost: '80-150 CNY', bestTime: 'Dîner' },
    { name: 'Yuwei Xiaoyu Hot Pot', description: 'Atmosphère "terre-à-terre" pour expérience hot pot authentique', category: 'food', estimatedCost: '70-130 CNY', bestTime: 'Dîner' },
    { name: 'General Ba (Quanba)', description: 'Marque historique de hot pot (300 ans d\'histoire)', category: 'food', estimatedCost: '100-180 CNY', bestTime: 'Dîner' },
    { name: 'Liuyishou Hot Pot', description: 'Chaîne célèbre (1200+ restos mondiaux), style national et moderne', category: 'food', estimatedCost: '90-160 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Yinghua Crossing', description: 'Hot pot avec vue panoramique sur la ville de nuit (Changjia Hui recommandé)', category: 'food', estimatedCost: '120-200 CNY', bestTime: 'Dîner (vue nocturne)' },
    { name: 'Nanshan Mountain Hot Pot Street', description: 'Rue dédiée au hot pot en montagne, plusieurs restos historiques', category: 'food', estimatedCost: '80-150 CNY', bestTime: 'Dîner' },
    { name: 'Ciqikou (Vieille ville)', description: 'Village ancien avec boutiques traditionnelles et street food', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Croisière sur le Yangtsé', description: 'Vue sur la ville illuminée depuis le fleuve', category: 'activities', estimatedCost: '100-200 CNY', bestTime: 'Soir (19h-21h)' },
    { name: 'Grotte de Dazu', description: 'Sculptures bouddhistes classées UNESCO (excursion journée)', category: 'sightseeing', estimatedCost: '120 CNY + transport', bestTime: 'Journée complète' },
    { name: 'Monorail ligne 2', description: 'Traverse les immeubles, vue spectaculaire sur la ville', category: 'activities', estimatedCost: '2-5 CNY', bestTime: 'Toute la journée' }
  ],
  'Zhangjiajie': [
    { name: 'Tianzi Mountain', description: 'Montagnes flottantes qui ont inspiré Avatar', category: 'sightseeing', estimatedCost: '248 CNY (pass 4 jours)', bestTime: 'Matin (moins de brouillard)' },
    { name: 'Zhangjiajie Glass Bridge', description: 'Pont de verre suspendu le plus long du monde (430m)', category: 'activities', estimatedCost: '138 CNY', bestTime: 'Toute la journée' },
    { name: 'Bailong Elevator', description: 'Ascenseur extérieur le plus haut du monde (326m)', category: 'activities', estimatedCost: '72 CNY', bestTime: 'Matin/après-midi' },
    { name: 'Golden Whip Stream', description: 'Randonnée facile dans une gorge avec ruisseau', category: 'activities', estimatedCost: 'Inclus dans le pass', bestTime: 'Matin' },
    { name: 'Tianmen Mountain', description: 'Téléphérique 7km + escaliers vers la porte du ciel', category: 'sightseeing', estimatedCost: '278 CNY', bestTime: 'Journée complète' },
    { name: 'Hourong Street', description: 'Plus grand marché de nuit avec 100+ vendeurs, cuisine de toute la Chine', category: 'food', estimatedCost: '40-80 CNY', bestTime: 'Soir (18h-23h)' },
    { name: 'Xibu Street (Wulingyuan)', description: 'Rue piétonne célèbre avec cuisines du Hunan', category: 'food', estimatedCost: '50-100 CNY', bestTime: 'Soir' },
    { name: 'Nanmenkou', description: 'Street food authentique du Hunan : plats de Changsha et barbecue Yueyang', category: 'food', estimatedCost: '30-70 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Mr. Tang Tujia Restaurant', description: 'Favori des touristes occidentaux : grandes portions, service rapide, choix piment', category: 'food', estimatedCost: '60-100 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Le Kou Fu Homestyle', description: 'Spécialités locales Zhangjiajie, service attentionné', category: 'food', estimatedCost: '50-90 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Tang Master\'s Tujia (Wulingyuan)', description: 'Restaurant ancien, signature : Poisson en soupe aigre', category: 'food', estimatedCost: '60-110 CNY', bestTime: 'Déjeuner/dîner' }
  ],
  'Shanghai': [
    { name: 'The Bund', description: 'Promenade emblématique face aux gratte-ciels de Pudong', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Coucher de soleil et nuit' },
    { name: 'Shanghai Tower', description: 'Plus haut building de Chine (632m), observatoire 546m', category: 'sightseeing', estimatedCost: '180 CNY', bestTime: 'Fin d\'après-midi' },
    { name: 'Jardin Yuyuan', description: 'Jardin classique Ming avec pavillons et étangs', category: 'sightseeing', estimatedCost: '40 CNY', bestTime: 'Matin' },
    { name: 'Nanjing Road', description: 'Rue commerçante la plus célèbre, 5km de boutiques', category: 'shopping', estimatedCost: 'Variable', bestTime: 'Après-midi/soir' },
    { name: 'French Concession', description: 'Quartier historique avec villas coloniales et cafés chics', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Tianzifang', description: 'Ruelles artistiques avec boutiques, galeries et cafés', category: 'shopping', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Quartier Huxi Mosque (Changning)', description: 'Zone avec mosquée historique et commerces musulmans', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Guan Guan Ji (GGJ)', description: 'Restaurant halal populaire, spécialité aliments déchirés à la main', category: 'food', estimatedCost: '60-100 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'Hongchangxing (près Bund)', description: 'Restaurant halal depuis 1891, célèbre hot pot au mouton frais', category: 'food', estimatedCost: '80-150 CNY', bestTime: 'Déjeuner/dîner' },
    { name: 'A Thousand & One Night', description: 'Restaurant musulman luxueux dans quartier prestigieux', category: 'food', estimatedCost: '120-200 CNY', bestTime: 'Dîner' },
    { name: 'Xiaolongbao chez Jia Jia Tang Bao', description: 'Les meilleurs raviolis vapeur de Shanghai', category: 'food', estimatedCost: '30-50 CNY', bestTime: 'Déjeuner (file d\'attente!)' },
    { name: 'Croisière nocturne Huangpu', description: 'Voir Shanghai illuminée depuis le fleuve', category: 'activities', estimatedCost: '100-200 CNY', bestTime: 'Nuit (19h-21h)' },
    { name: 'Musée de Shanghai', description: 'Art et histoire chinoise, collection exceptionnelle', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Matin/après-midi' },
    { name: 'Marché de Fuxing', description: 'Marché local authentique pour produits frais', category: 'food', estimatedCost: '20-50 CNY', bestTime: 'Matin' }
  ],
  'Tokyo': [
    { name: 'Senso-ji (Asakusa)', description: 'Temple le plus ancien de Tokyo avec porte Kaminarimon', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Matin (7h-9h)' },
    { name: 'Shibuya Crossing', description: 'Carrefour le plus fréquenté au monde, vue depuis Starbucks', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Soir (18h-20h)' },
    { name: 'Quartier Shibuya', description: 'Quartier des jeunes très vivant, shopping et restaurants (options halal disponibles)', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi/soir' },
    { name: 'Quartier Shinjuku', description: 'Zone commerciale et affaires avec zones diverses (options halal)', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Toute la journée' },
    { name: 'Daikanyama & Shimokitazawa', description: 'Quartiers moins touristiques, ambiance locale authentique', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'HALAL WAGYU RAMEN (Shibuya)', description: 'Ramen Wagyu A5 halal certifié + espace prière et Wudu (5 min de Shibuya)', category: 'food', estimatedCost: '1500-2200 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'GYUMON YAKINIKU (Shibuya)', description: 'Premier yakiniku halal Wagyu du Japon (depuis 2007), viande A5', category: 'food', estimatedCost: '3000-5000 JPY', bestTime: 'Dîner' },
    { name: 'Malay Asian Cuisine (Shibuya)', description: 'Cuisine malaisienne halal à Shibuya', category: 'food', estimatedCost: '1200-2000 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'HALAL WAGYU RAMEN (Shinjuku)', description: 'Ramen Wagyu A5 100% halal près de Shinjuku Station', category: 'food', estimatedCost: '1500-2200 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'MADEENA NAAN & Restos turcs', description: 'USKUDAR, BOSPHORUS HASAN, CANKAYA - options turques halal à Shinjuku', category: 'food', estimatedCost: '1500-2500 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'TeamLab Borderless ou Planets', description: 'Musée d\'art numérique immersif, réserver en avance', category: 'activities', estimatedCost: '3200-3800 JPY', bestTime: 'Fin d\'après-midi', link: 'https://www.teamlab.art/' },
    { name: 'Meiji Jingu', description: 'Sanctuaire shinto dans une forêt en plein Tokyo', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Matin' },
    { name: 'Akihabara', description: 'Quartier électronique et otaku, arcades et maid cafés', category: 'shopping', estimatedCost: 'Variable', bestTime: 'Après-midi/soir' },
    { name: 'Tsukiji Outer Market', description: 'Marché aux poissons et street food sushi frais', category: 'food', estimatedCost: '1000-2000 JPY', bestTime: 'Matin (6h-10h)' },
    { name: 'Tokyo Skytree', description: 'Tour de 634m avec observatoire et aquarium', category: 'sightseeing', estimatedCost: '2100-3100 JPY', bestTime: 'Coucher de soleil' },
    { name: 'Harajuku & Takeshita Street', description: 'Mode kawaii, crêpes et boutiques excentriques', category: 'shopping', estimatedCost: 'Variable', bestTime: 'Après-midi' },
    { name: 'Shinjuku Gyoen', description: 'Grand jardin avec cerisiers et style japonais/français/anglais (mai: verdure)', category: 'sightseeing', estimatedCost: '500 JPY', bestTime: 'Après-midi' },
    { name: 'Golden Gai', description: 'Ruelles avec 200 mini-bars à l\'ambiance unique', category: 'activities', estimatedCost: '1000-3000 JPY', bestTime: 'Nuit (20h-minuit)' },
    { name: 'Odaiba', description: 'Île artificielle avec Gundam géant, centre commercial et vue sur Rainbow Bridge', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi/soir' }
  ],
  'Nikko': [
    { name: 'Toshogu Shrine', description: 'Sanctuaire doré classé UNESCO, mausolée de Tokugawa', category: 'sightseeing', estimatedCost: '1300 JPY', bestTime: 'Matin' },
    { name: 'Lac Chuzenji', description: 'Lac de cratère avec vue sur montagnes, location de vélos', category: 'sightseeing', estimatedCost: 'Gratuit (+ location vélo)', bestTime: 'Après-midi' },
    { name: 'Cascades de Kegon', description: 'Chute d\'eau de 97m, une des plus belles du Japon', category: 'sightseeing', estimatedCost: '570 JPY (ascenseur)', bestTime: 'Matin/après-midi' },
    { name: 'Pont Shinkyo', description: 'Pont sacré rouge emblématique, parfait pour photos', category: 'sightseeing', estimatedCost: '300 JPY (traversée)', bestTime: 'Matin' },
    { name: 'Kanmangafuchi Abyss', description: 'Promenade avec 70 statues Jizo le long d\'une gorge', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Yuba (tofu de Nikko)', description: 'Spécialité locale à essayer dans un restaurant traditionnel', category: 'food', estimatedCost: '1500-3000 JPY', bestTime: 'Déjeuner' }
  ],
  'Takaragawa & Ikaho': [
    { name: 'Takaragawa Onsen', description: 'Onsen en plein air au bord de la rivière, mixte et naturel', category: 'activities', estimatedCost: '1500-2000 JPY (journée)', bestTime: 'Journée/soir' },
    { name: 'Ikaho Onsen Stone Steps', description: '365 marches avec boutiques et source d\'eau dorée', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Ikaho Ropeway', description: 'Téléphérique vers le Mont Monokiki avec vue panoramique', category: 'activities', estimatedCost: '830 JPY', bestTime: 'Après-midi' },
    { name: 'Ryokan avec kaiseki', description: 'Expérience complète avec repas traditionnel multi-plats', category: 'food', estimatedCost: 'Inclus hébergement', bestTime: 'Dîner' },
    { name: 'Onsen Rotation (9 bains publics)', description: 'Tour des 9 onsen publics d\'Ikaho avec pass', category: 'activities', estimatedCost: '1800 JPY (pass)', bestTime: 'Journée' }
  ],
  'Kyoto': [
    { name: 'Fushimi Inari Taisha', description: '10000 torii vermillon sur sentier de montagne', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Très tôt (6h-8h) ou soir' },
    { name: 'Kinkaku-ji (Pavillon d\'Or)', description: 'Temple recouvert de feuilles d\'or au bord d\'un étang', category: 'sightseeing', estimatedCost: '500 JPY', bestTime: 'Matin (9h-10h)' },
    { name: 'Arashiyama Bamboo Grove', description: 'Forêt de bambous géants, ambiance zen', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Tôt le matin (7h-9h)' },
    { name: 'Gion', description: 'Quartier très typique avec multiples petits restaurants traditionnels', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Soir (18h-19h)' },
    { name: 'Higashiyama', description: 'Zone historique développée pendant l\'ère Kamakura', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Chemin de la Philosophie', description: 'Promenade de 2km le long d\'un canal (verdure en mai)', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi' },
    { name: 'Kiyomizu-dera', description: 'Temple sur pilotis avec vue sur Kyoto et cerisiers (mai: verdure)', category: 'sightseeing', estimatedCost: '400 JPY', bestTime: 'Après-midi' },
    { name: 'Ayam-Ya Karasuma', description: 'Ramen halal certifié (chaîne présente à Tokyo, Kyoto, Osaka)', category: 'food', estimatedCost: '1000-1500 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'Honke Tankuma Honten', description: 'Kaiseki halal étoilé Michelin certifié par Kyoto Halal Council', category: 'food', estimatedCost: '8000-15000 JPY', bestTime: 'Dîner (réserver!)' },
    { name: 'Yoshiya Arashiyama', description: 'Cuisine japonaise authentique halal à Arashiyama + espace prière', category: 'food', estimatedCost: '2000-4000 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'Halal Yakiniku Naritaya', description: 'Premier yakiniku 100% halal de Kyoto (JAKIM Malaisie), près Shijō', category: 'food', estimatedCost: '3000-5000 JPY', bestTime: 'Dîner' },
    { name: 'Nishiki Market', description: 'Marché couvert avec 100+ boutiques de nourriture', category: 'food', estimatedCost: '500-1500 JPY', bestTime: 'Matin/midi' },
    { name: 'Kawa Café', description: 'Au bord de la rivière Kamogawa dans une jolie Machiya', category: 'food', estimatedCost: '800-1500 JPY', bestTime: 'Après-midi' },
    { name: 'Pontocho Alley', description: 'Ruelle étroite avec restaurants traditionnels sur la rivière', category: 'food', estimatedCost: 'Variable', bestTime: 'Dîner/soir' }
  ],
  'Osaka': [
    { name: 'Dotonbori', description: 'Rue emblématique avec néons géants et street food, quartier très animé', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Nuit (19h-23h)' },
    { name: 'Minami-ku', description: 'Quartier le plus dynamique et coloré d\'Osaka', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi/soir' },
    { name: 'Shinsaibashi & Amerikamura', description: 'Lieux de rendez-vous branchés avec Yoroppamura', category: 'shopping', estimatedCost: 'Variable', bestTime: 'Après-midi' },
    { name: 'Sites Hundertwasser', description: 'Architecture unique : Kodomo no Machi, Maishima Sludge Center, Incineration Plant', category: 'sightseeing', estimatedCost: 'Variable', bestTime: 'Après-midi' },
    { name: 'Halal Ramen Honolu (Namba)', description: 'Ramen halal certifié : poulet, nouilles et sauce soja halal', category: 'food', estimatedCost: '1000-1500 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'Chibo Okonomiyaki (Dotonbori)', description: 'Okonomiyaki historique (50+ ans), branche Muslim-friendly au 7e étage', category: 'food', estimatedCost: '1200-1800 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'WASHOKU KADEN (Hotel Plaza)', description: 'Kaiseki halal-friendly, 5 min d\'Osaka Umeda en train', category: 'food', estimatedCost: '3000-6000 JPY', bestTime: 'Dîner' },
    { name: 'Le Marrakech', description: 'Restaurant halal-friendly près JR Osaka Station (2 min d\'Umeda Sky Building)', category: 'food', estimatedCost: '2000-3500 JPY', bestTime: 'Déjeuner/dîner' },
    { name: 'Château d\'Osaka', description: 'Château historique avec parc et musée', category: 'sightseeing', estimatedCost: '600 JPY', bestTime: 'Matin/après-midi' },
    { name: 'Kuromon Ichiba Market', description: 'Marché couvert pour fruits de mer et street food', category: 'food', estimatedCost: '1000-2000 JPY', bestTime: 'Matin/midi' },
    { name: 'Shinsekai', description: 'Quartier rétro avec tour Tsutenkaku et kushikatsu', category: 'sightseeing', estimatedCost: 'Gratuit', bestTime: 'Après-midi/soir' },
    { name: 'Umeda Sky Building', description: 'Tour moderne avec observatoire à 173m', category: 'sightseeing', estimatedCost: '1500 JPY', bestTime: 'Coucher de soleil' }
  ]
};

const SEASONAL_TIPS: { [key: number]: { title: string; tips: string[] } } = {
  5: {
    title: 'Mai au Japon & Chine',
    tips: [
      'Climat agréable (20-25°C) mais début de saison des pluies au Japon',
      'Golden Week au Japon (29 avril-5 mai) = foules et prix élevés, à éviter',
      'Cerisiers finis mais azalées et glycines en fleur',
      'Parfait pour les onsen en montagne',
      'Festival Sanja Matsuri à Tokyo (mi-mai)',
      'Réserver hébergements Kyoto/Tokyo 2-3 mois en avance'
    ]
  }
};

export default function IdeasToVisit() {
  const { tripData } = useTrip();
  const [selectedDestination, setSelectedDestination] = useState(tripData.destinations[0]?.name || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedDestinationData = tripData.destinations.find(d => d.name === selectedDestination);
  const ideas = IDEAS_BY_DESTINATION[selectedDestination] || [];
  const filteredIdeas = filterCategory === 'all'
    ? ideas
    : ideas.filter(idea => idea.category === filterCategory);

  const month = selectedDestinationData?.startDate.getMonth();
  const seasonalInfo = month !== undefined ? SEASONAL_TIPS[month + 1] : null;

  const handleAddToActivities = (idea: Idea) => {
    if (!selectedDestinationData) return;

    const confirmed = window.confirm(`Ajouter "${idea.name}" aux activités pour ${selectedDestination}?`);
    if (confirmed) {
      // Cette fonctionnalité sera implémentée avec le context
      alert('Fonctionnalité à implémenter : ajouter aux activités');
    }
  };

  const categoryIcons = {
    sightseeing: '🏯',
    food: '🍜',
    shopping: '🛍️',
    activities: '🎯',
    other: '✨'
  };

  return (
    <div className="p-4 pb-24 sm:pb-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Idées à visiter
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Suggestions personnalisées selon vos destinations et la période
        </p>
      </div>

      {/* Seasonal Tips */}
      {seasonalInfo && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">{seasonalInfo.title}</h2>
          </div>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {seasonalInfo.tips.map((tip:any, idx:any) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Destination selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destination
          </label>
          <div className="flex flex-wrap gap-2">
            {tripData.destinations.map(dest => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest.name)}
                className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  selectedDestination === dest.name
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{dest.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catégorie
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Tout
            </button>
            {Object.entries(categoryIcons).map(([cat, icon]) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {cat === 'sightseeing' && 'Sites'}
                {cat === 'food' && 'Cuisine'}
                {cat === 'shopping' && 'Shopping'}
                {cat === 'activities' && 'Activités'}
                {cat === 'other' && 'Autres'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredIdeas.map((idea, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{categoryIcons[idea.category]}</span>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2">
                    {idea.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {idea.description}
              </p>

              {/* Details */}
              <div className="space-y-1 mb-3 text-xs sm:text-sm">
                {idea.estimatedCost && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">💰</span>
                    <span className="truncate">{idea.estimatedCost}</span>
                  </div>
                )}
                {idea.bestTime && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">⏰</span>
                    <span className="truncate">{idea.bestTime}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToActivities(idea)}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Ajouter</span>
                </button>
                {idea.link && (
                  <a
                    href={idea.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Aucune suggestion disponible pour cette catégorie
          </p>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          💡 <strong>Astuce :</strong> Ces suggestions sont basées sur les lieux incontournables et les meilleures périodes.
          Pensez à réserver en avance pour les attractions populaires (TeamLab, restaurants étoilés, ryokan).
        </p>
      </div>
    </div>
  );
}
