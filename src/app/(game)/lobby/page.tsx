import React from "react";
import MarbleSetup from "@/components/game/MarbleSetup";
import { NeonText } from "@/components/ui/NeonText";

/**
 * Server Component representing the race setup lobby.
 * Injects static SEO tags and description wrappers before mounting client forms.
 */
export default function LobbyPage() {
  return (
    <div className="w-full flex flex-col items-center py-4">
      <div className="text-center mb-6">
        <NeonText as="h2" color="cyan" glitch className="text-3xl md:text-4xl font-black mb-2 select-none">
          RACE LOBBY
        </NeonText>
        <p className="text-[#6b6b8a] text-xs uppercase font-bold tracking-widest select-none">
          Assemble your runners, trigger configurations, and step into the arena
        </p>
      </div>

      <MarbleSetup />
    </div>
  );
}
