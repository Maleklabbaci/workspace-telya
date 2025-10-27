import { createClient } from '@supabase/supabase-js';

// Utilisation de valeurs factices pour empêcher le plantage des routes API si les variables d'environnement ne sont pas définies.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.M-to2_2M8x9d_jq3VunoS_uD8UNL-n2h87b_PjZ6s1w";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('URL Supabase ou Clé de Service non définies pour le client admin. Utilisation de valeurs factices.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);