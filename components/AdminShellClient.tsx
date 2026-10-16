"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { ROLE_ADMIN } from "@/lib/roles";

const SITE_URL = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface NavItem {
  href: string;
  label: string;
  external?: boolean;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

function Icon({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      className="w-5 h-5 shrink-0"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      {d2 && <path strokeLinecap="round" strokeLinejoin="round" d={d2} />}
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: "/posts/new", label: "Crear noticia", icon: <Icon d="M12 4v16m8-8H4" /> },
  {
    href: SITE_URL,
    label: "Sitio web",
    external: true,
    icon: (
      <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
    ),
  },
  {
    href: "/posts",
    label: "Noticias generales",
    icon: <Icon d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />,
  },
  {
    href: "/posts/mine",
    label: "Mis noticias",
    icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
  {
    href: "/categories",
    label: "Categorías",
    icon: (
      <Icon
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
        d2="M6 6h.008v.008H6V6z"
      />
    ),
  },
  {
    href: "/gallery",
    label: "Imágenes",
    icon: <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    href: "/customers",
    label: "Clientes",
    icon: <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
  },
  {
    href: "/advertising",
    label: "Publicidad",
    icon: <Icon d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />,
  },
  {
    href: "/users",
    label: "Usuarios",
    adminOnly: true,
    icon: <Icon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  },
  {
    href: "/sitemaps",
    label: "Sitemaps",
    adminOnly: true,
    icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  },
];

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = !item.external && (pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-md text-[15px] font-medium transition-colors ${
        isActive
          ? "bg-[var(--color-sidebar-raised)] text-[var(--color-sidebar-text-active)]"
          : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-raised)] hover:text-[var(--color-sidebar-text-active)]"
      }`}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-[var(--color-cta)]"
          aria-hidden="true"
        />
      )}
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarContent({
  userEmail,
  roles,
  onNavigate,
}: {
  userEmail?: string;
  roles: string[];
  onNavigate?: () => void;
}) {
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || roles.includes(ROLE_ADMIN));

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bajanews-logo.jpg" alt="BajaNews.mx" className="h-5 w-auto" />
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => (
            <li key={item.href + item.label}>
              <NavLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        {userEmail && (
          <p className="text-sm text-[var(--color-sidebar-text)] truncate mb-3" title={userEmail}>
            {userEmail}
          </p>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}

export default function AdminShellClient({
  userEmail,
  roles,
  children,
}: {
  userEmail?: string;
  roles: string[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const titleId = useId();

  // Cerrar el drawer cada vez que cambia la ruta (navegación por teclado o click).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape para cerrar, bloqueo de scroll del fondo, y foco al primer link al abrir.
  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstLink = drawerRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        openButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      {/* Sidebar fija — visible desde lg (1024px) hacia arriba */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[var(--color-sidebar)]">
        <SidebarContent userEmail={userEmail} roles={roles} />
      </div>

      {/* Barra superior — solo hasta lg, con el botón de abrir el menú */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-[var(--color-sidebar)] px-4 py-3">
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
          aria-label="Abrir menú de navegación"
          className="p-2 -ml-2 rounded-md text-white hover:bg-[var(--color-sidebar-raised)] cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bajanews-logo.jpg" alt="BajaNews.mx" className="h-5 w-auto" />
        <div className="w-10" aria-hidden="true" />
      </header>

      {/* Drawer móvil */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            id="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--color-sidebar)] shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-end px-3 py-3 border-b border-white/10">
              <span id={titleId} className="sr-only">
                Menú de navegación
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 rounded-md text-white hover:bg-[var(--color-sidebar-raised)] cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent userEmail={userEmail} roles={roles} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main id="contenido" className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
