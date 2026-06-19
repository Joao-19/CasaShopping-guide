"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Monitor, Play, Save, Smartphone } from "lucide-react";
import { EditorPanel } from "./components/EditorPanel";
import { NewsletterModal } from "./components/NewsletterModal";
import { Button } from "./_ui/button";
import { Switch } from "./_ui/switch";
import type { NewsletterConfig } from "./types";

type SimPhase = "idle" | "waiting" | "visible" | "closed";
type Device = "desktop" | "mobile";

interface NewsletterBuilderProps {
  config: NewsletterConfig;
  setConfig: React.Dispatch<React.SetStateAction<NewsletterConfig>>;
  onSave: () => void;
  saving: boolean;
}

export function NewsletterBuilder({
  config,
  setConfig,
  onSave,
  saving,
}: NewsletterBuilderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");

  const [phase, setPhase] = useState<SimPhase>("idle");
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = <K extends keyof NewsletterConfig>(
    key: K,
    value: NewsletterConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const safeIndex = Math.min(activeIndex, config.sections.length - 1);

  const stopSim = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  };

  useEffect(() => stopSim, []);

  const startCountdown = (seconds: number, onDone: () => void) => {
    setCountdown(seconds);
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          onDone();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const runSimulation = () => {
    stopSim();
    const { appearDelay, autoClose, autoCloseDelay } = config.behavior;

    const showPopup = () => {
      setPhase("visible");
      if (autoClose) {
        startCountdown(autoCloseDelay, () => {
          setPhase("closed");
          timeoutRef.current = setTimeout(() => setPhase("idle"), 2000);
        });
      } else {
        timeoutRef.current = setTimeout(() => setPhase("idle"), 2500);
      }
    };

    if (appearDelay > 0) {
      setPhase("waiting");
      startCountdown(appearDelay, showPopup);
    } else {
      showPopup();
    }
  };

  const modalVisible = phase === "idle" || phase === "visible";
  const simulating = phase !== "idle";

  const previewContent = (
    <AnimatePresence mode="wait">
      {modalVisible ? (
        <motion.div
          key="modal"
          className="relative w-full"
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
        >
          {phase === "visible" && config.behavior.autoClose && (
            <div className="absolute -top-9 left-1/2 z-30 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium whitespace-nowrap text-white shadow">
              Fecha em {countdown}s
            </div>
          )}
          <NewsletterModal
            config={config}
            activeIndex={safeIndex}
            onActiveChange={setActiveIndex}
          />
        </motion.div>
      ) : (
        <motion.div
          key="placeholder"
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white/70 px-8 py-12 text-center"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          {phase === "waiting" ? (
            <>
              <div className="flex size-14 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700">
                {countdown}
              </div>
              <p className="text-sm font-medium text-gray-900">
                O pop-up aparece em {countdown}s
              </p>
              <p className="text-xs text-gray-500">
                Simulando o atraso após abrir a página.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">
                Pop-up fechado automaticamente
              </p>
              <p className="text-xs text-gray-500">Voltando ao preview...</p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-50 text-gray-900">
      <EditorPanel
        config={config}
        update={update}
        activeIndex={safeIndex}
        setActiveIndex={setActiveIndex}
      />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white/70 px-8 py-4 backdrop-blur">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Live preview</p>
              <p className="text-xs text-gray-500">
                Arraste o pop-up para navegar entre as seções.
              </p>
            </div>
            <label className="ml-2 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => update("enabled", v)}
              />
              <span className="text-sm font-medium text-gray-700">
                Exibir na home
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                aria-label="Preview desktop"
                onClick={() => setDevice("desktop")}
                className={`flex size-8 items-center justify-center rounded-md transition ${
                  device === "desktop"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Monitor className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Preview mobile"
                onClick={() => setDevice("mobile")}
                className={`flex size-8 items-center justify-center rounded-md transition ${
                  device === "mobile"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Smartphone className="size-4" />
              </button>
            </div>

            <Button variant="outline" onClick={runSimulation} disabled={simulating}>
              <Play className="size-4" />
              {simulating ? "Simulando..." : "Testar comportamento"}
            </Button>

            <Button onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </header>

        <div
          className="scrollbar-minimal flex flex-1 items-center justify-center overflow-auto p-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        >
          {device === "desktop" ? (
            <div className="w-full max-w-[820px]">{previewContent}</div>
          ) : (
            <div className="flex h-[740px] w-[380px] flex-col rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl">
              <div className="relative flex-1 overflow-hidden rounded-[1.8rem] bg-gray-100">
                <div className="absolute top-0 left-1/2 z-30 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900" />
                <div className="scrollbar-minimal flex h-full items-center justify-center overflow-y-auto px-4 py-12">
                  {previewContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
