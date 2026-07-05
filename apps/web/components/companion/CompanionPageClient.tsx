"use client";

import { useCompanionGlobal } from "./CompanionGlobalContext";
import { InstallationWindow } from "./InstallationWindow";
import { Onboarding } from "./Onboarding";

export function CompanionPageClient() {
  const {
    logout,
    userEmail,
    character,
    login,
    register,
    status,
  } = useCompanionGlobal();

  if (status === "checking") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center p-6">
        <p className="text-sm text-slate-600">Cargando tu experiencia...</p>
      </main>
    );
  }

  if (status === "auth" || !character) {
    return <Onboarding onLogin={login} onRegister={register} />;
  }

  return <InstallationWindow userEmail={userEmail} onLogout={logout} />;
}
