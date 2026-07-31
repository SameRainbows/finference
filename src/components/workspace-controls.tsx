"use client";

import { LogOut, RotateCcw } from "lucide-react";
import { signOut } from "@/app/auth/actions";

export function WorkspaceControls({
  email,
  allowReset,
}: {
  email: string;
  allowReset: boolean;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      {allowReset && (
        <button
          onClick={async () => {
            const response = await fetch("/api/app/reset", { method: "POST" });
            if (response.ok) window.location.reload();
          }}
          className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-[#11171a]/90 px-4 text-[10px] text-white/45 shadow-xl backdrop-blur-xl transition hover:text-white/75"
          title="Restore the repeatable judge scenario"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset judge workspace
        </button>
      )}
      <form action={signOut}>
        <button
          className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-[#11171a]/90 px-4 text-[10px] text-white/45 shadow-xl backdrop-blur-xl transition hover:text-white/75"
          title={`Signed in as ${email}`}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </form>
    </div>
  );
}
