# Telya Platform

Plateforme web professionnelle avec des interfaces pour Administrateurs, Employés et Clients, construite avec Next.js, TypeScript et Supabase.

## 🚀 Démarrage Rapide

1.  **Cloner le projet**
    ```bash
    git clone <repository-url>
    cd telya-platform
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configurer Supabase**

    Cette application nécessite un projet Supabase pour la base de données et l'authentification.
    
    a. Allez sur [supabase.com](https://supabase.com/) et créez un nouveau projet.
    
    b. Récupérez votre **URL de projet** et votre **clé `anon` publique**.
    
    c. Créez un fichier `.env.local` en copiant le fichier d'exemple `.env.example`.
    ```bash
    cp .env.example .env.local
    ```
    
    d. Remplissez les variables d'environnement dans votre nouveau fichier `.env.local` avec les clés de votre projet Supabase.
    
    e. Allez dans l'éditeur SQL de votre projet Supabase (`SQL Editor` > `New query`) et exécutez les scripts suivants pour configurer la base de données.

4.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000). Vous pouvez maintenant créer un compte et vous connecter.

---

## 📜 Configuration de la base de données Supabase

Exécutez les requêtes SQL suivantes dans l'éditeur SQL de votre projet Supabase.

### 1. Table des profils utilisateurs

Cette table stockera les données publiques des utilisateurs, comme leur nom et leur rôle.

```sql
-- Créer la table pour les profils publics
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL,
  PRIMARY KEY (id)
);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques de sécurité pour la table des profils
CREATE POLICY "Les profils publics sont visibles par tous."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );
```

### 2. Création automatique des profils

Cette fonction et ce déclencheur (trigger) créeront automatiquement un profil pour chaque nouvel utilisateur qui s'inscrit.

```sql
-- Fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après la création d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 3. Tables de l'application (Projets, Tâches)

Ajoutez ici les tables pour vos projets, tâches, etc., ainsi que leurs politiques RLS.
*Exemple (à étendre) :*
```sql
-- Table des projets
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  client_id uuid REFERENCES public.profiles,
  status text NOT NULL DEFAULT 'À venir',
  progress integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les admins voient tous les projets." ON public.projects FOR SELECT TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Les clients voient leurs propres projets." ON public.projects FOR SELECT TO authenticated USING (client_id = auth.uid());
-- Ajoutez des politiques pour les employés (ex: via une table de jointure project_members)

-- Table des tâches
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects,
  assignee_id uuid REFERENCES public.profiles,
  status text NOT NULL DEFAULT 'À faire',
  priority text NOT NULL DEFAULT 'Moyenne',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
-- Ajoutez ici les politiques RLS pour les tâches (similaires aux projets)

```

## Scripts NPM Disponibles

- `npm run dev`: Lance l'application en mode développement.
- `npm run build`: Construit l'application pour la production.
- `npm run start`: Démarre un serveur de production.
- `npm run lint`: Lance ESLint pour analyser le code.