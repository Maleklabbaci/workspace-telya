import AppLayout from "@/components/AppLayout";
import { LayoutDashboard, FileText, MessageSquare } from "lucide-react";
import React from "react";

const clientNavItems = [
  { href: "/client/dashboard", icon: LayoutDashboard, label: "Aperçu" },
  { href: "/client/invoices", icon: FileText, label: "Factures" },
  { href: "/client/support", icon: MessageSquare, label: "Support" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout navItems={clientNavItems}>{children}</AppLayout>;
}
