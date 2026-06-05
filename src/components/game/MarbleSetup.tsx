"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { NeonText } from "../ui/NeonText";

/**
 * Lobby setup panel. Allows player creation, CPU bot filling, Chaos Mode toggling,
 * and starts the countdown layout once criteria are met.
 */
export const MarbleSetup: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const marbles = useGameStore((state) => state.marbles);
  const addMarble = useGameStore((state) => state.addMarble);
  const removeMarble = useGameStore((state) => state.removeMarble);
  const populateBots = useGameStore((state) => state.populateBots);
  const chaosMode = useGameStore((state) => state.chaosMode);
  const toggleChaosMode = useGameStore((state) => state.toggleChaosMode);
  const startRace = useGameStore((state) => state.startRace);

  const handleStartRace = () => {
    startRace();
    router.push("/race");
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMarble(name.trim(), imageUrl.trim() || undefined);
    setName("");
    setImageUrl("");
  };

  const handleAddBot = () => {
    populateBots(1);
  };

  const fillRemainingBots = () => {
    const spaceLeft = 8 - marbles.length;
    if (spaceLeft > 0) {
      populateBots(spaceLeft);
    }
  };

  const clearAll = () => {
    useGameStore.setState({ marbles: [] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl mx-auto my-4 px-4 select-none">
      <div className="lg:col-span-5 flex flex-col gap-6">
        <Card glowColor="pink" className="border-[#ff2d78]/25 p-5">
          <NeonText as="h3" color="pink" className="text-base mb-4">
            ADD RUNNER
          </NeonText>
          <form onSubmit={handleAddPlayer} className="flex flex-col gap-4">
            <Input
              label="MARBLE NAME"
              placeholder="e.g. Rizzler, Sigma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              neonColor="pink"
              required
            />
            <Input
              label="IMAGE URL (OPTIONAL)"
              placeholder="https://example.com/avatar.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              neonColor="pink"
            />
            <div className="flex gap-3 mt-1">
              <Button type="submit" variant="neon" neonColor="pink" className="flex-1 py-2 text-xs">
                ADD PLAYER
              </Button>
              <Button type="button" variant="outline" neonColor="pink" onClick={handleAddBot} className="py-2 text-xs">
                + BOT
              </Button>
            </div>
          </form>
        </Card>

        <Card glowColor="purple" className="border-[#bf5fff]/25 p-5">
          <NeonText as="h3" color="purple" className="text-base mb-4">
            RACE CONFIG
          </NeonText>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div>
                <h4 className="font-bold text-xs text-white">CHAOS MODE</h4>
                <p className="text-[10px] text-white/50 mt-0.5">Increases traps and debuffs chance to 60%</p>
              </div>
              <Button
                variant={mounted && chaosMode ? "neon" : "outline"}
                neonColor={mounted && chaosMode ? "yellow" : "purple"}
                onClick={toggleChaosMode}
                className="py-1 px-3 text-[10px]"
              >
                {mounted && chaosMode ? "ACTIVE 🔥" : "DISABLED"}
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="default" className="flex-1 text-[10px] py-2" onClick={fillRemainingBots}>
                FILL BOTS TO 8
              </Button>
              <Button variant="ghost" className="text-[10px] py-2 text-red-400 hover:text-red-300" onClick={clearAll}>
                CLEAR ALL
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card glowColor="cyan" className="lg:col-span-7 border-[#00f5ff]/25 p-5 flex flex-col h-full min-h-[420px]">
        <div className="flex justify-between items-center mb-5">
          <NeonText as="h3" color="cyan" className="text-base">
            REGISTERED RUNNERS ({marbles.length})
          </NeonText>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 flex flex-col gap-2.5">
          {marbles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-xl text-white/40">
              <span className="text-xs font-bold">LOBBY VACANT</span>
              <span className="text-[10px] mt-1">Register at least 2 marbles (or auto-fill bots) to launch.</span>
            </div>
          ) : (
            marbles.map((marble) => (
              <div
                key={marble.id}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2.5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={marble.imageUrl}
                    alt={marble.name}
                    size="sm"
                    fallbackColor={marble.color}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      {marble.name}
                      {marble.isBot && (
                        <span className="text-[8px] bg-white/10 border border-white/10 rounded px-1 py-0.5 text-white/50 leading-none">
                          CPU
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-white/30 font-mono mt-0.5">ID: {marble.id.slice(0, 8)}...</span>
                  </div>
                </div>
                
                <button
                  onClick={() => removeMarble(marble.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4 flex flex-col gap-2.5">
          <Button
            variant="neon"
            neonColor="cyan"
            size="lg"
            className="w-full text-base font-black tracking-widest py-3"
            disabled={marbles.length < 2}
            onClick={handleStartRace}
          >
            START MAYHEM 🎮
          </Button>
          {marbles.length < 2 && (
            <span className="text-center text-[10px] text-[#6b6b8a] block font-semibold">
              Ready 2 runners to unlock. CPU players will complete setup requirements automatically.
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MarbleSetup;
