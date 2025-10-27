import { createClient } from '@supabase/supabase-js'

// Utilisation de valeurs factices pour empêcher le plantage de l'application si les variables d'environnement ne sont pas définies.
// L'environnement d'exécution doit fournir les valeurs correctes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeo7oYxTTv_2SgePE9TCALYHKdPkGkmIpw"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // Au lieu de lancer une erreur, on affiche un avertissement.
  console.warn('URL Supabase ou Clé Anonyme non définies. Utilisation de valeurs factices.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);