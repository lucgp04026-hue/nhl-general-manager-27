# NHL General Manager 27 — prototype Web

Prototype indépendant de jeu de gestion de hockey, en français. Stack : React + TypeScript + Vite + Supabase.

## Fonctions incluses
- Interface responsive (téléphone / ordinateur)
- Création de compte et connexion par courriel via Supabase Auth
- Sauvegarde de franchise dans PostgreSQL (table `franchise_saves`)
- Effectif, marché d'échanges, contrats, finances et simulation de saison
- Mode aperçu sans Supabase (pas de comptes ni sauvegardes cloud)

## 1. Prérequis
- Node.js 20+
- Un compte Supabase
- Un compte GitHub et Vercel pour le déploiement

## 2. Installation locale
```bash
npm install
cp .env.example .env
npm run dev
```
Renseigne ensuite `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env`.

## 3. Configurer Supabase
1. Crée un projet sur https://supabase.com.
2. Ouvre SQL Editor et exécute `supabase/schema.sql`.
3. Dans Project Settings > API, copie Project URL et la clé anon/public.
4. Colle-les dans `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Dans Authentication > URL Configuration, ajoute l'URL locale et l'URL de production dans les URL autorisées.

Les politiques RLS limitent chaque sauvegarde à son propriétaire. Ne mets jamais la clé `service_role` dans le code client.

## 4. Déployer publiquement avec Vercel
1. Pousse le dossier sur un dépôt GitHub.
2. Dans Vercel, importe le dépôt.
3. Framework preset : Vite ; Build command : `npm run build` ; Output directory : `dist`.
4. Ajoute les deux variables d'environnement Supabase dans Vercel.
5. Déploie, puis ajoute l'URL de production dans Supabase Auth > URL Configuration.

## 5. Avant une vraie ouverture publique
Ce dépôt est un prototype jouable, pas encore un jeu multijoueur complet ni une base de données officielle LNH. Avant une mise en ligne à grande échelle :
- Déplacer la logique de transactions, contrats et résultats dans des fonctions serveur vérifiées.
- Ajouter validation serveur, limites de requêtes, journal d'audit et protection anti-triche.
- Ajouter tests automatisés et sauvegardes PostgreSQL.
- Concevoir une vraie base de données joueurs/équipes/saisons, plutôt que stocker tout le jeu dans un seul JSON.
- Ajouter réinitialisation de mot de passe, confirmation d'adresse courriel, conditions d'utilisation et politique de confidentialité.
- Remplacer les noms/données indicatives par des données licenciées ou originales. Ne pas utiliser logos, marques, photos ou données NHL protégés sans autorisation.

## 6. Modèle de données cible (prochaine version)
- profiles(user_id, display_name, created_at)
- leagues(id, name, owner_id, visibility, season_id)
- franchises(id, league_id, owner_id, nhl_team_code, name)
- players(id, name, position, birth_date, overall, potential)
- contracts(id, player_id, franchise_id, cap_hit, years_left, clauses)
- rosters(id, franchise_id, player_id, roster_status)
- seasons(id, league_id, year, status)
- games(id, season_id, home_franchise_id, away_franchise_id, score, played_at)
- transactions(id, league_id, from_franchise_id, to_franchise_id, payload, status, created_at)
- draft_picks(id, season_id, franchise_id, round, original_team_id)
- franchise_saves(user_id, save_data, updated_at)

## Licence et marque
Ce projet est un prototype indépendant. « NHL », les équipes, leurs logos et leurs marques appartiennent à leurs détenteurs respectifs. Une diffusion publique ou commerciale utilisant ces éléments peut nécessiter des licences. Le nom de travail peut être remplacé par une marque originale.
