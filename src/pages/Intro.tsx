import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Captions, Check, Mic, Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import hero from "@/assets/portfolio/aaron-hero.png";
import { usePageTitle } from "@/components/studio/parts";

/**
 * A 30-second introduction for the Clipboard Technical Support Engineer application.
 * Aaron's photo, subtitles timed to the script, and a clipboard checklist that fills in as he speaks.
 * Voice: his own recording (record it here while the captions scroll, or the device's speech voice).
 */
type Seg = { text: string; from: number; to: number; ticks: string[] };

const SEGMENTS: Seg[] = [
  { text: "Hello, my name is Aaron Prince, and I'm from Jamaica.", from: 0, to: 4.1, ticks: ["Aaron Prince, Jamaica"] },
  { text: "I have a Bachelor's degree in Computer Science and three years of experience in operational support at Scotiabank.", from: 4.1, to: 11.2, ticks: ["B.Sc. Computer Science", "3 years operational support, Scotiabank"] },
  { text: "My experience has taught me the importance of troubleshooting, clear communication and keeping business operations running smoothly.", from: 11.2, to: 18.3, ticks: ["Troubleshooting", "Clear communication", "Operations running smoothly"] },
  { text: "I enjoy helping people understand and resolve technical problems, and I'm excited about the opportunity to bring my skills and commitment to Clipboard.", from: 18.3, to: 27.6, ticks: ["Explains technical problems clearly", "Committed to Clipboard"] },
  { text: "Thank you for your consideration.", from: 27.6, to: 30, ticks: ["Thank you"] },
];
const TOTAL = 30;
const ALL_TICKS = SEGMENTS.flatMap((s, i) => s.ticks.map((t) => ({ t, seg: i })));

type Voice = "off" | "mine" | "device";

const pickVoice = (): SpeechSynthesisVoice | undefined => {
  const v = window.speechSynthesis.getVoices().filter((x) => x.lang.startsWith("en"));
  return v.find((x) => /(natural|online).*(guy|ryan|davis|brian|christopher|eric|roger|steffan)|(guy|ryan|davis|brian|christopher|eric|roger|steffan)/i.test(x.name)) ?? v.find((x) => /male|david|mark|daniel|james|george/i.test(x.name)) ?? v[0];
};

const Intro = () => {
  usePageTitle("Introduction");
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState<Voice>("off");
  const [captions, setCaptions] = useState(true);
  const [mineUrl, setMineUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const canRecord = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

  const seg = Math.max(0, SEGMENTS.findIndex((s) => t >= s.from && t < s.to));
  const current = SEGMENTS[t >= TOTAL ? SEGMENTS.length - 1 : seg];

  const stopRecording = useCallback(() => {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
    stream.current?.getTracks().forEach((x) => x.stop());
    setRecording(false);
  }, []);

  // Clock
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((v) => {
        if (v + 0.05 >= TOTAL) {
          setPlaying(false);
          return TOTAL;
        }
        return v + 0.05;
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [playing]);

  // Recording ends with the video.
  useEffect(() => {
    if (t >= TOTAL && recording) stopRecording();
  }, [t, recording, stopRecording]);

  // Own recording follows play, pause and seeking.
  useEffect(() => {
    const a = audio.current;
    if (!a || voice !== "mine") return;
    if (playing) {
      if (Math.abs(a.currentTime - t) > 0.4) a.currentTime = t;
      void a.play().catch(() => undefined);
    } else a.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, voice]);

  // Device voice: speak each segment as it starts.
  useEffect(() => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    if (!playing || voice !== "device" || t >= TOTAL) return;
    const s = SEGMENTS[seg];
    const u = new SpeechSynthesisUtterance(s.text);
    u.lang = "en-US";
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = Math.min(1.25, Math.max(0.85, s.text.split(/\s+/).length / ((s.to - s.from) * 2.4)));
    window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seg, playing, voice]);

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((x) => x.stop());
      if (canSpeak) window.speechSynthesis.cancel();
    },
    [canSpeak]
  );

  const seek = (to: number) => {
    setT(to);
    if (audio.current) audio.current.currentTime = to;
  };
  const toggle = () => {
    if (t >= TOTAL) seek(0);
    setPlaying((p) => !p);
  };

  const startRecording = async () => {
    setMicError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const chunks: Blob[] = [];
      const r = new MediaRecorder(s);
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunks, { type: r.mimeType || "audio/webm" }));
        setMineUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
        setVoice("mine");
        setPlaying(false);
      };
      recorder.current = r;
      setVoice("off");
      seek(0);
      r.start();
      setRecording(true);
      setPlaying(true);
    } catch {
      setMicError("Could not use the microphone. Allow it for this site, or choose the device voice.");
    }
  };

  const words = current.text.split(" ");
  const span = current.to - current.from;
  const spoken = Math.max(0, Math.min(words.length, Math.floor(((t - current.from) / span) * words.length * 1.08)));

  const ticksShown = useMemo(() => ALL_TICKS.filter((x) => x.seg < seg || (x.seg === seg && t >= SEGMENTS[x.seg].from + 0.5)), [seg, t]);
  const done = t >= TOTAL;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-28">
      <p className="text-sm font-bold uppercase tracking-widest text-violet-light">Application for Clipboard</p>
      <h1 className="mt-1 text-3xl font-extrabold md:text-5xl">Technical Support Engineer: a 30-second introduction</h1>

      <div className="relative mt-6 aspect-video overflow-hidden rounded-3xl bg-[#0f1020] shadow-2xl" role="region" aria-label="Introduction video, 30 seconds, with subtitles">
        <motion.img
          src={hero}
          alt="Aaron Prince in a bright office, looking at the camera"
          className="absolute inset-0 h-full w-full object-cover object-[50%_28%]"
          animate={reduced || !playing ? undefined : { scale: [1, 1.07], x: [0, -8] }}
          transition={{ duration: TOTAL, ease: "linear" }}
          style={{ originX: 0.55, originY: 0.3 }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

        {/* Clipboard checklist */}
        <div className="absolute right-3 top-3 w-[46%] max-w-xs sm:right-6 sm:top-6" aria-label="Checklist that fills in as Aaron speaks">
          <div className="relative rounded-2xl bg-[#3b2f2a] p-2 pt-5 shadow-xl">
            <span aria-hidden="true" className="absolute left-1/2 top-0 h-4 w-16 -translate-x-1/2 -translate-y-1 rounded-md bg-gradient-to-b from-zinc-300 to-zinc-500 shadow" />
            <div className="min-h-[7.5rem] rounded-lg bg-[#fbfaf5] px-3 py-2 text-ink">
              <p className="border-b border-zinc-300 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 sm:text-xs">Candidate: Aaron Prince</p>
              <ul className="mt-1.5 space-y-1">
                {ticksShown.map((x) => (
                  <motion.li key={x.t} initial={reduced ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-1.5 text-[11px] font-semibold leading-tight sm:text-sm">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 sm:h-4 sm:w-4" aria-hidden="true" /> {x.t}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lower third */}
        <div className="absolute bottom-16 left-3 sm:bottom-20 sm:left-6">
          <p className="rounded-md bg-violet px-3 py-1 text-sm font-extrabold text-white sm:text-lg">Aaron Prince</p>
          <p className="mt-0.5 inline-block rounded-md bg-black/70 px-3 py-0.5 text-xs text-white sm:text-sm">Technical Support Engineer applicant · Jamaica</p>
        </div>

        {/* Subtitles */}
        {captions && (
          <p aria-live="off" className="absolute inset-x-3 bottom-12 mx-auto max-w-3xl text-center text-sm font-bold leading-snug text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.9)] sm:inset-x-8 sm:bottom-14 sm:text-xl">
            {done ? (
              "Thank you for your consideration."
            ) : (
              words.map((w, i) => (
                <span key={i} className={i < spoken ? "text-white" : "text-white/55"}>
                  {w}{" "}
                </span>
              ))
            )}
          </p>
        )}

        {recording && <p className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white sm:left-6 sm:top-6"><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Recording your voice</p>}

        {/* Controls */}
        <div className="absolute inset-x-3 bottom-2 flex items-center gap-2 sm:inset-x-6 sm:bottom-3">
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : done ? "Replay" : "Play"} className="rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30">
            {playing ? <Pause className="h-4 w-4" /> : done ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <input type="range" min={0} max={TOTAL} step={0.1} value={t} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" disabled={recording} className="h-1 flex-1 accent-white" />
          <span className="w-12 text-right font-mono text-xs text-white">{Math.floor(t)}s / {TOTAL}s</span>
        </div>
      </div>

      {!playing && t === 0 && <p className="mt-3 text-sm text-soft">Press play. The page makes no sound until you choose a voice below.</p>}
      <audio ref={audio} src={mineUrl ?? undefined} preload="auto" />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="flex items-center gap-2 font-bold"><Volume2 className="h-4 w-4 text-violet-light" aria-hidden="true" /> Voice</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {([
              ["off", "Subtitles only"],
              ["mine", mineUrl ? "My recording" : "My recording (record first)"],
              ["device", canSpeak ? "Device voice (quality varies)" : "Device voice (not supported here)"],
            ] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2">
                <input type="radio" name="voice" checked={voice === k} disabled={(k === "mine" && !mineUrl) || (k === "device" && !canSpeak) || recording} onChange={() => { setPlaying(false); setVoice(k); }} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5 md:col-span-2">
          <p className="flex items-center gap-2 font-bold"><Mic className="h-4 w-4 text-violet-light" aria-hidden="true" /> Use your own voice</p>
          <p className="mt-2 text-sm text-soft">For a real application your own voice is the best choice. Press record, read the captions as they highlight, and it replays with the video. The recording stays in this browser and is never uploaded.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {recording ? (
              <button type="button" onClick={stopRecording} className="btn-primary"><Square className="h-4 w-4" aria-hidden="true" /> Stop</button>
            ) : (
              <button type="button" onClick={() => void startRecording()} disabled={!canRecord} className="btn-primary disabled:opacity-50"><Mic className="h-4 w-4" aria-hidden="true" /> {mineUrl ? "Record again" : "Record my voice"}</button>
            )}
            {mineUrl && <a href={mineUrl} download="aaron-intro-voice.webm" className="btn-ghost">Download my recording</a>}
            <button type="button" onClick={() => setCaptions((c) => !c)} aria-pressed={captions} className="btn-ghost"><Captions className="h-4 w-4" aria-hidden="true" /> Subtitles {captions ? "on" : "off"}</button>
          </div>
          {micError && <p role="alert" className="mt-2 text-sm text-red-400">{micError}</p>}
        </div>
      </div>

      <details className="mt-6 rounded-2xl border border-line bg-panel p-5">
        <summary className="cursor-pointer font-bold">Read the full script</summary>
        <p className="mt-3 whitespace-pre-line text-soft">{SEGMENTS.map((s) => s.text).join("\n\n")}</p>
      </details>
      <p className="mt-6 text-sm text-soft">To send it as a file, record this page with Windows Game Bar (Win + G) or your phone&rsquo;s screen recorder while it plays.</p>
    </div>
  );
};

export default Intro;
