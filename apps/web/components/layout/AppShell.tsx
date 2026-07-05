"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CompanionGlobalProvider,
  useCompanionGlobal,
} from "@/components/companion/CompanionGlobalContext";
import { InstallationWindow } from "@/components/companion/InstallationWindow";
import { Onboarding } from "@/components/companion/Onboarding";

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
  const {
    character,
    closeLauncher,
    isLauncherOpen,
    login,
    openLauncher,
    logout,
    register,
    status,
    userEmail,
  } = useCompanionGlobal();

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-[92rem] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center" aria-label="Wuju Companion">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo provisto por el equipo */}
            <img
              src="/brand/logo-wuju.png"
              alt="Wuju Companion"
              className="h-14 w-auto object-contain"
            />
          </Link>

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

          <button
            type="button"
            onClick={openLauncher}
            className="rounded-md bg-[#06162b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2342]"
          >
            Comenzar
          </button>
        </div>
      </header>

      {children}

      <FloatingPet onOpenLauncher={openLauncher} />

      {isLauncherOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/55 p-3 sm:p-6">
          <div className="absolute right-5 top-5">
            <button
              type="button"
              onClick={closeLauncher}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            >
              Cerrar
            </button>
          </div>

          <div className="h-full overflow-auto">
            {status === "checking" ? (
              <main className="mx-auto flex min-h-full max-w-4xl items-center justify-center">
                <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
                  Cargando tu personaje...
                </p>
              </main>
            ) : status === "auth" || !character ? (
              <Onboarding onLogin={login} onRegister={register} />
            ) : (
              <InstallationWindow userEmail={userEmail} onLogout={logout} />
            )}
          </div>
        </div>
      ) : null}
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

  if (!assistant) return null;

  return (
    <button
      type="button"
      onClick={onOpenLauncher}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-lg transition hover:shadow-xl"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-blue-50 text-xs font-semibold text-blue-700">
        {assistant.avatar}
      </span>
      <span className="pr-1 text-left">
        <span className="block text-xs text-slate-500">Mascota activa</span>
        <span className="block text-sm font-semibold text-slate-900">{assistant.name}</span>
      </span>
    </button>
  );
}
