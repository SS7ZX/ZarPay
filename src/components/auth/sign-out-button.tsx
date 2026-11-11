"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

interface SignOutButtonProps {
  className: string;
  onSuccess?: () => void;
}

export function SignOutButton({
  className,
  onSuccess,
}: SignOutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const { error: signOutError } = await createClient().auth.signOut({
        scope: "local",
      });
      if (signOutError) throw signOutError;
      onSuccess?.();
      router.replace("/");
      router.refresh();
    } catch (caughtError) {
      console.error(
        "Failed to sign out:",
        caughtError instanceof Error ? caughtError.message : caughtError,
      );
      setError("Keluar gagal. Silakan coba kembali.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="signout-control">
      <button
        className={className}
        disabled={busy}
        onClick={signOut}
        type="button"
      >
        {busy ? "Memproses..." : "Keluar"}
      </button>
      {error && <span className="signout-error" role="alert">{error}</span>}
    </span>
  );
}
