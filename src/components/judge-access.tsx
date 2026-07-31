import { PlayCircle } from "lucide-react";
import { enterJudgeWorkspace } from "@/app/auth/actions";

export function JudgeAccess() {
  return (
    <form action={enterJudgeWorkspace}>
      <button className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#55e8cf]/18 bg-[#55e8cf]/6 text-xs font-medium text-[#8cf6e3] transition hover:bg-[#55e8cf]/10">
        <PlayCircle className="h-3.5 w-3.5" />
        Enter persistent judge workspace
      </button>
    </form>
  );
}

