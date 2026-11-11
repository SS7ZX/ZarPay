"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { createClient } from "@/src/lib/supabase/client";

interface LandingAccountActionsProps {
  enabled: boolean;
}

export function LandingAccountActions({
  enabled,
}: LandingAccountActionsProps) {
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const client = createClient();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session?.user));
    });

    void client.auth.getSession().then(
      ({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          console.error("Failed to load landing auth state:", sessionError.message);
          setError("Status akun gagal dimuat.");
          return;
        }
        setSignedIn(Boolean(data.session?.user));
      },
      (sessionError: unknown) => {
        if (!active) return;
        console.error("Failed to load landing auth state:", sessionError);
        setError("Status akun gagal dimuat.");
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [enabled]);

  return (
    <div className="landing-nav-actions">
      {signedIn ? (
        <>
          <Link className="landing-login-link landing-profile-link" href="/profile">
            Profil
          </Link>
          <Link className="button button-primary landing-nav-cta" href="/dashboard">
            Dashboard
          </Link>
          <SignOutButton
            className="landing-logout-button"
            onSuccess={() => setSignedIn(false)}
          />
        </>
      ) : (
        <>
          <Link className="landing-login-link" href="/login">Masuk</Link>
          <Link className="button button-primary landing-nav-cta" href="/login">
            Mulai simulasi
          </Link>
        </>
      )}
      {error && <span className="landing-auth-error" role="status">{error}</span>}
    </div>
  );
}
