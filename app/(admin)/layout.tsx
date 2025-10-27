import AppLayout from "@/components/AppLayout";
import { LayoutDashboard, Users, Folders, Settings } from "lucide-react";
import React from "react";

const adminNavItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/projects", icon: Folders, label: "Projets" },
  { href: "/admin/settings", icon: Settings, label: "Réglages" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout navItems={adminNavItems}>{children}</AppLayout>;
}
