"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+12px)] z-[80] mx-auto flex max-w-[398px] items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-soft">
      <WifiOff size={17} className="text-amber-300" />
      ネットワークに接続できません
    </div>
  );
}
