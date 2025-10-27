// NEW: Admin page for user management
"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus } from "lucide-react";

// FIX: Correct casing for Button import
import { Button } from "@/components/ui/Button";
// FIX: Correct casing for Card import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddUserModal from "@/components/AddUserModal";
import { getUsers } from "@/data/api";
import { UserProfile } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError("Impossible de charger les utilisateurs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "employee":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
            <p className="mt-2 text-muted-foreground">
                Ajoutez, visualisez et gérez les utilisateurs de la plateforme.
            </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent>
          {loading && <p className="p-4 text-center">Chargement...</p>}
          {error && <p className="p-4 text-center text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={() => {
            fetchUsers(); // Re-fetch users after a new one is added
        }}
      />
    </div>
  );
}