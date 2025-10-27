import AppLayout from "@/components/AppLayout";
import { CheckCircle, Folders, User } from "lucide-react";
import React from "react";

const employeeNavItems = [
  { href: "/employee/dashboard", icon: CheckCircle, label: "Mes Tâches" },
  { href: "/employee/projects", icon: Folders, label: "Projets" },
  { href: "/employee/profile", icon: User, label: "Profil" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout navItems={employeeNavItems}>{children}</AppLayout>;
}
