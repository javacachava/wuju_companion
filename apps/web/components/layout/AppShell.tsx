"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useSession } from "@/components/auth/SessionContext";
import { CompanionGlobalProvider, useCompanionGlobal } from "@/components/companion/CompanionGlobalContext";
import { CompanionLaunchExperience } from "@/components/companion/CompanionLaunchExperience";
import { Onboarding } from "@/components/companion/Onboarding";
import { useCart } from "@/components/marketplace/CartContext";

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
    completeSelection,
    createCharacter,
    isLauncherOpen,
    openLauncher,
    status,
    updateCharacter,
  } = useCompanionGlobal();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <nav className="flex items-center gap-2 text-sm">
            <NavLink href="/" active={pathname === "/"}>
              Inicio
            </NavLink>
            <NavLink href="/companion" active={pathname.startsWith("/companion")}>
              Companion
            </NavLink>
            <NavLink href="/marketplace" active={pathname.startsWith("/marketplace")}>
              Marketplace
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <CartButton />
            <SessionControls />
            <button
              type="button"
              onClick={openLauncher}
              className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Caja/Mascota
            </button>
          </div>
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
            ) : status === "onboarding" || !character ? (
              <Onboarding onContinue={createCharacter} />
            ) : (
              <CompanionLaunchExperience
                character={character}
                onCharacterChange={updateCharacter}
                onContinue={completeSelection}
                isEmbedded
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function CartButton() {
  const { items } = useCart();

  return (
    <Link
      href="/marketplace?cart=open"
      className="relative rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      aria-label={`Carrito (${items.length})`}
    >
      <ShoppingCart className="h-5 w-5" />
      {items.length > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
          {items.length}
        </span>
      ) : null}
    </Link>
  );
}

function SessionControls() {
  const { user, loading, logout } = useSession();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <UserRound className="h-4 w-4" />
        Ingresar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="hidden max-w-28 truncate text-sm font-medium text-slate-700 sm:block" title={user.email}>
        {user.name}
      </span>
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
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
      className={`rounded-md px-3 py-1.5 transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
