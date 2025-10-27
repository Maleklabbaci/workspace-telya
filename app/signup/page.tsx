"use client";

// FIX: Correct casing for Button import
import { Button } from "@/components/ui/Button";
// FIX: Correct casing for Input import
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    // Le rôle est maintenant géré côté serveur dans la logique d'authentification pour la sécurité
    const { error: signUpError } = await signUp(fullName, email, password);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage("Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.");
      // Optionnellement, rediriger après un délai
      // setTimeout(() => router.push('/login'), 5000);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Créer un compte client
        </h2>
        {message ? (
          <p className="text-center text-green-400">{message}</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-muted-foreground">
                Nom complet
              </label>
              <Input id="fullName" name="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-muted-foreground">
                Adresse e-mail
              </label>
              <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-muted-foreground">
                Mot de passe
              </label>
              <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création en cours..." : "S'inscrire"}
              </Button>
            </div>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}