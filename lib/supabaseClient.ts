import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

// --- ATTENTION: SÉCURITÉ ---
// Vos clés d'API Supabase sont des informations sensibles.
// NE LES PARTAGEZ JAMAIS publiquement ou dans le code client dans un environnement de production.
// Utilisez des variables d'environnement pour une sécurité maximale.
// J'ai inséré vos clés ici comme demandé, mais veuillez les sécuriser dès que possible.
const supabaseUrl = process.env.SUPABASE_URL || 'https://oqdbjtudexpznldtjeed.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZGJqdHVkZXhwem5sZHRqZWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjI5ODUsImV4cCI6MjA3Njk5ODk4NX0.qbrds9ZRddxf3ajD5gL3RZ5MSIR_NzQHIQoMFzFg-Eo';

// L'avertissement ci-dessous peut encore s'afficher si les variables d'environnement ne sont pas définies,
// mais l'application utilisera les clés que vous avez fournies.
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn("Supabase client is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables for production.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Récupère le profil utilisateur local stocké après la connexion.
 * Dans une application plus complexe, cela pourrait provenir d'un contexte React.
 */
export const getLocalUser = (): User | null => {
    const userStr = localStorage.getItem('telya_user');
    return userStr ? JSON.parse(userStr) : null;
};
