"use client";

import React, { PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { TelyaLogo } from "./TelyaLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

type AppLayoutProps = PropsWithChildren<{
  navItems: NavItem[];
}>;

const AvatarFallback = ({ name }: { name: string }) => {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
        </div>
    );
};

export default function AppLayout({ navItems, children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <TelyaLogo className="h-6 w-6" />
          <span>{process.env.NEXT_PUBLIC_APP_NAME || 'Telya'}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-accent text-primary"
            )}
            onClick={() => setIsSidebarOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
                user && <AvatarFallback name={user.name} />
            )}
            <div className="overflow-hidden">
                <p className="truncate font-semibold text-sm">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto rounded-md p-2 hover:bg-accent">
                <LogOut className="h-4 w-4"/>
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-background lg:block">
        <SidebarContent />
      </aside>
      
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-background" onClick={(e) => e.stopPropagation()}>
                <SidebarContent/>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 rounded-full p-2">
                    <X className="h-6 w-6"/>
                </button>
            </div>
        </div>
      )}

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-6 w-6"/>
            </button>
            <div className="flex-1">
                <Link href="/" className="flex items-center gap-2 font-semibold w-min mx-auto">
                    <TelyaLogo className="h-6 w-6" />
                </Link>
            </div>
            <div className="w-6"/>
        </header>
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}