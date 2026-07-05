"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { useSession } from "@/components/auth/SessionContext";
import { CompanionGlobalProvider, useCompanionGlobal } from "@/components/companion/CompanionGlobalContext";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <CompanionGlobalProvider>
      <AppShellInner>{children}</AppShellInner>
    </CompanionGlobalProvider>
  );
}

function AppShellInner({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSession();
  // En la app de escritorio (Tauri) escondemos el chrome de marketing para que
  // se sienta una app, no la web. Detectamos window.__TAURI__ en el cliente.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const w = window as unknown as { __TAURI__?: unknown };
    setIsDesktop(Boolean(w.__TAURI__));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push(isDesktop ? "/companion" : "/");
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-[92rem] items-center justify-between px-5 sm:px-8">
          <Link
            href={isDesktop ? "/companion" : "/"}
            className="inline-flex items-center"
            aria-label="Wuju Companion"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- logo provisto por el equipo */}
            <img
              src="/brand/logo-wuju.png"
              alt="Wuju Companion"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {isDesktop ? null : (
            <nav className="hidden items-center gap-12 text-sm font-semibold md:flex">
              <NavLink href="/" active={pathname === "/"}>
                Inicio
              </NavLink>
              <NavLink href="/marketplace" active={pathname.startsWith("/marketplace")}>
                Marketplace
              </NavLink>
              <NavLink href="/#creadores" active={false}>
                Creadores
              </NavLink>
              <NavLink href="/#funcionamiento" active={false}>
                Funcionamiento
              </NavLink>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 sm:flex">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#06162b] text-sm font-semibold uppercase text-white">
                    {user.email.charAt(0)}
                  </span>
                  <span className="max-w-[160px] truncate text-sm font-medium text-slate-700">
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  aria-label="Cerrar sesión"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/companion")}
                  className="rounded-md bg-[#06162b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2342]"
                >
                  Mi compañero
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Ingresar
                </Link>
                <button
                  type="button"
                  onClick={() => router.push("/companion")}
                  className="rounded-md bg-[#06162b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2342]"
                >
                  Comenzar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <FloatingPet onOpenLauncher={() => router.push("/companion")} />
    </>
  );
}

type NavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`relative px-1 py-2 transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:rounded-full after:transition-all ${
        active
          ? "text-slate-950 after:w-9 after:bg-blue-600"
          : "text-slate-900 after:w-0 after:bg-blue-600 hover:text-blue-700 hover:after:w-9"
      }`}
    >
      {children}
    </Link>
  );
}

type FloatingPetProps = {
  onOpenLauncher: () => void;
};

function FloatingPet({ onOpenLauncher }: FloatingPetProps) {
  const { character } = useCompanionGlobal();
  const assistant = character?.assistant;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(
      typeof window !== "undefined" && localStorage.getItem("pet-hidden") === "1",
    );
  }, []);

  if (!assistant) return null;

  const petImage = character?.avatar?.image ?? "/marketplace/characters/policia.png";

  const hide = () => {
    setHidden(true);
    if (typeof window !== "undefined") localStorage.setItem("pet-hidden", "1");
  };

  // Oculta: solo una burbujita chica para traerla de vuelta.
  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => {
          setHidden(false);
          if (typeof window !== "undefined") localStorage.removeItem("pet-hidden");
        }}
        aria-label="Mostrar mascota"
        className="fixed bottom-20 right-4 z-40 inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-lg transition hover:shadow-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- avatar local */}
        <img src={petImage} alt="" className="h-9 w-9 object-contain" draggable={false} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-lg">
      <button
        type="button"
        onClick={onOpenLauncher}
        className="flex items-center gap-2 rounded-full pr-1 transition hover:opacity-80"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar local */}
          <img src={petImage} alt="" className="h-9 w-9 object-contain" draggable={false} />
        </span>
        <span className="text-left">
          <span className="block text-xs text-slate-500">Mascota activa</span>
          <span className="block text-sm font-semibold text-slate-900">{assistant.name}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={hide}
        aria-label="Ocultar mascota"
        className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
