import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Mic, Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import hero from "@/assets/portfolio/aaron-hero.png";
import { usePageTitle } from "@/components/studio/parts";

/**
 * Makes the 30-second Clipboard application video as a downloadable file.
 * You record your own voice while reading the lines, the clipboard ticks off as you present, and the page
 * renders photo + clipboard + subtitles + your audio into one video file, all inside this browser.
 */
const W = 1280;
const H = 720;

// One line per row: what is said | what gets ticked off on the clipboard (separate with ;)
const DEFAULT_SCRIPT = `Hello, my name is Aaron Prince, and I'm from Jamaica. | Aaron Prince, Jamaica
I have a Bachelor's degree in Computer Science and three years of experience in operational support at Scotiabank. I also completed a web development internship with Larvation Web. | B.Sc. Computer Science; 3 years operational support, Scotiabank; Web dev intern, Larvation Web
My experience has taught me the importance of troubleshooting, clear communication and keeping business operations running smoothly. | Troubleshooting; Clear communication; Operations running smoothly
I enjoy helping people understand and resolve technical problems, and I'm excited about the opportunity to bring my skills and commitment to Clipboard. | Explains technical problems clearly; Committed to Clipboard
Thank you for your consideration.`;

type Seg = { text: string; ticks: string[] };
const parse = (s: string): Seg[] =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [text, ticks = ""] = l.split("|");
      return { text: text.trim(), ticks: ticks.split(";").map((x) => x.trim()).filter(Boolean) };
    })
    .filter((s) => s.text);

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Start and end of every line: your own taps if you made them, otherwise shared out by word count. */
const timeline = (segs: Seg[], duration: number, marks: number[] | null) => {
  if (marks && marks.length === segs.length) return segs.map((_, i) => ({ from: marks[i], to: i + 1 < segs.length ? marks[i + 1] : duration }));
  const total = segs.reduce((n, s) => n + wordCount(s.text), 0) || 1;
  let acc = 0;
  return segs.map((s) => {
    const from = acc;
    acc += (wordCount(s.text) / total) * duration;
    return { from, to: acc };
  });
};

const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
};

const Intro = () => {
  usePageTitle("Introduction video");
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [duration, setDuration] = useState(30);
  const [marks, setMarks] = useState<number[] | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [recLine, setRecLine] = useState(0);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const segs = useMemo(() => parse(script), [script]);
  const times = useMemo(() => timeline(segs, duration, marks), [segs, duration, marks]);

  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const tRef = useRef(0);
  const playRef = useRef(false);
  const startedAt = useRef(0);
  const live = useRef({ segs, times, duration, recLine: 0, recording: false });
  const mic = useRef<{ rec: MediaRecorder; stream: MediaStream; chunks: Blob[]; t0: number; marks: number[] } | null>(null);
  const exportRec = useRef<{ rec: MediaRecorder; chunks: Blob[]; mime: string } | null>(null);
  const exportCtx = useRef<AudioContext | null>(null);

  live.current = { segs, times, duration, recLine, recording };

  // ---------- drawing ----------
  const draw = useCallback((time: number) => {
    const c = canvas.current?.getContext("2d");
    const im = img.current;
    if (!c || !im || !im.complete) return;
    const { segs: S, times: T, duration: D, recLine: rl, recording: rec } = live.current;
    c.clearRect(0, 0, W, H);

    // photo with a slow push-in
    const zoom = 1 + 0.07 * Math.min(1, time / D);
    const base = Math.max(W / im.naturalWidth, H / im.naturalHeight) * zoom;
    const dw = im.naturalWidth * base;
    const dh = im.naturalHeight * base;
    c.drawImage(im, (W - dw) * 0.5 - 14 * (time / D), (H - dh) * 0.3, dw, dh);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(0,0,0,0.25)");
    g.addColorStop(0.45, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.8)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    // which line is on
    let idx = T.findIndex((s) => time >= s.from && time < s.to);
    if (rec) idx = Math.min(rl, S.length - 1);
    if (idx < 0) idx = time <= 0 ? 0 : S.length - 1;

    // clipboard
    const bx = 760;
    const by = 36;
    const bw = 484;
    const nTicks = Math.min(9, S.reduce((n, x) => n + x.ticks.length, 0));
    const bh = 118 + nTicks * 38 + 40;
    c.fillStyle = "#3b2f2a";
    roundRect(c, bx, by, bw, bh, 22);
    c.fill();
    const clip = c.createLinearGradient(0, by - 10, 0, by + 30);
    clip.addColorStop(0, "#e5e7eb");
    clip.addColorStop(1, "#9ca3af");
    c.fillStyle = clip;
    roundRect(c, bx + bw / 2 - 70, by - 10, 140, 40, 10);
    c.fill();
    c.fillStyle = "#fbfaf5";
    roundRect(c, bx + 18, by + 40, bw - 36, bh - 58, 12);
    c.fill();
    c.fillStyle = "#71717a";
    c.font = "700 20px 'Segoe UI', Arial, sans-serif";
    c.textBaseline = "alphabetic";
    c.fillText("CANDIDATE: AARON PRINCE", bx + 40, by + 84);
    c.strokeStyle = "#d4d4d8";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(bx + 36, by + 98);
    c.lineTo(bx + bw - 36, by + 98);
    c.stroke();

    let row = 0;
    S.forEach((s, si) => {
      const sFrom = rec ? 0 : T[si]?.from ?? 0;
      const sTo = rec ? 1 : (T[si]?.to ?? 0) - sFrom;
      s.ticks.forEach((tk, ti) => {
        const appear = rec ? (si < rl ? -1 : si === rl ? 0.6 + ti * 0.9 : 1e9) : sFrom + 0.4 + ti * Math.min(1.2, sTo / (s.ticks.length + 1));
        const since = rec ? (si < rl ? 5 : si === rl ? (performance.now() - (mic.current?.marks[si] ? mic.current.t0 + mic.current.marks[si] * 1000 : performance.now())) / 1000 - appear : -1) : time - appear;
        if (since < 0) return;
        const a = Math.min(1, since / 0.35);
        const y = by + 138 + row * 38;
        c.globalAlpha = a;
        c.fillStyle = "#16a34a";
        c.beginPath();
        c.arc(bx + 54, y - 7, 13, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#fff";
        c.lineWidth = 3.5;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(bx + 46, y - 7);
        c.lineTo(bx + 52, y - 1);
        c.lineTo(bx + 63, y - 16);
        c.stroke();
        c.fillStyle = "#18181b";
        let size = 22;
        const avail = bw - 36 - 64 - 24;
        c.font = `700 ${size}px 'Segoe UI', Arial, sans-serif`;
        while (size > 15 && c.measureText(tk).width > avail) {
          size -= 1;
          c.font = `700 ${size}px 'Segoe UI', Arial, sans-serif`;
        }
        c.fillText(tk, bx + 82 + (1 - a) * 18, y);
        c.globalAlpha = 1;
        row++;
      });
    });

    // lower third: shown while the first line is spoken, like a TV name caption
    const showName = idx === 0;
    c.globalAlpha = showName ? 1 : 0;
    c.fillStyle = "#6d28d9";
    roundRect(c, 48, 430, 330, 52, 8);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "800 32px 'Segoe UI', Arial, sans-serif";
    c.fillText("Aaron Prince", 66, 467);
    c.fillStyle = "rgba(0,0,0,0.72)";
    roundRect(c, 48, 486, 560, 36, 8);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "600 21px 'Segoe UI', Arial, sans-serif";
    c.fillText("Technical Support Engineer applicant  ·  Jamaica", 64, 511);
    c.globalAlpha = 1;

    // subtitles, word by word
    const words = (S[idx]?.text ?? "").split(" ");
    const span = Math.max(0.1, (T[idx]?.to ?? 1) - (T[idx]?.from ?? 0));
    const spoken = rec ? words.length : Math.max(0, Math.min(words.length, Math.floor(((time - (T[idx]?.from ?? 0)) / span) * words.length * 1.08)));
    c.font = "800 36px 'Segoe UI', Arial, sans-serif";
    const maxW = 1160;
    const lines: { w: string; i: number }[][] = [[]];
    let lw = 0;
    words.forEach((w, i) => {
      const ww = c.measureText(w + " ").width;
      if (lw + ww > maxW && lines[lines.length - 1].length) {
        lines.push([]);
        lw = 0;
      }
      lines[lines.length - 1].push({ w, i });
      lw += ww;
    });
    c.shadowColor = "rgba(0,0,0,0.9)";
    c.shadowBlur = 8;
    lines.forEach((ln, li) => {
      const total = ln.reduce((n, x) => n + c.measureText(x.w + " ").width, 0);
      let x = (W - total) / 2;
      const y = 654 - (lines.length - 1 - li) * 46;
      ln.forEach((x2) => {
        c.fillStyle = x2.i < spoken ? "#ffffff" : "rgba(255,255,255,0.55)";
        c.fillText(x2.w + " ", x, y);
        x += c.measureText(x2.w + " ").width;
      });
    });
    c.shadowBlur = 0;

    // progress line
    c.fillStyle = "rgba(255,255,255,0.25)";
    c.fillRect(0, H - 5, W, 5);
    c.fillStyle = "#a78bfa";
    c.fillRect(0, H - 5, W * Math.min(1, time / D), 5);
  }, []);

  // ---------- clock + render loop ----------
  useEffect(() => {
    const im = new Image();
    im.src = hero;
    im.onload = () => draw(tRef.current);
    img.current = im;
  }, [draw]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      const a = audio.current;
      if (playRef.current) {
        const D = live.current.duration;
        if (mic.current) tRef.current = (performance.now() - mic.current.t0) / 1000;
        else if (a && audioUrl && !a.paused) tRef.current = a.currentTime;
        else tRef.current = Math.min(D, (performance.now() - startedAt.current) / 1000);
        if (!mic.current && tRef.current >= D) {
          tRef.current = D;
          playRef.current = false;
          setPlaying(false);
          a?.pause();
          if (exportRec.current) finishExport();
        }
      }
      draw(tRef.current);
      if (now - last > 100) {
        last = now;
        setT(tRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, audioUrl]);

  const seek = (to: number) => {
    tRef.current = to;
    startedAt.current = performance.now() - to * 1000;
    if (audio.current && audioUrl) audio.current.currentTime = to;
    setT(to);
  };

  const play = () => {
    if (tRef.current >= live.current.duration - 0.05) seek(0);
    startedAt.current = performance.now() - tRef.current * 1000;
    playRef.current = true;
    setPlaying(true);
    if (audio.current && audioUrl) {
      audio.current.currentTime = tRef.current;
      void audio.current.play().catch(() => undefined);
    }
  };
  const pause = () => {
    playRef.current = false;
    setPlaying(false);
    audio.current?.pause();
  };

  // ---------- record your voice ----------
  const nextLine = useCallback(() => {
    const m = mic.current;
    if (!m) return;
    const n = live.current.recLine + 1;
    if (n >= live.current.segs.length) return;
    m.marks[n] = (performance.now() - m.t0) / 1000;
    setRecLine(n);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        nextLine();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recording, nextLine]);

  const startRecording = async () => {
    setError("");
    setNote("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mic.current = { rec, stream, chunks, t0: performance.now(), marks: [0] };
      rec.onstop = () => {
        const m = mic.current;
        if (!m) return;
        const elapsed = (performance.now() - m.t0) / 1000;
        stream.getTracks().forEach((x) => x.stop());
        const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
        setAudioUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
        setDuration(Math.max(5, elapsed));
        setMarks(m.marks.length === live.current.segs.length ? m.marks : null);
        mic.current = null;
        playRef.current = false;
        tRef.current = 0;
        setPlaying(false);
        setRecording(false);
        setRecLine(0);
        setT(0);
        setNote(m.marks.length === live.current.segs.length ? "Recorded. The subtitles now follow the moments you tapped Next line." : "Recorded. You did not tap through every line, so the subtitles are spread evenly across your recording.");
      };
      tRef.current = 0;
      setRecLine(0);
      setRecording(true);
      playRef.current = true;
      setPlaying(true);
      rec.start();
    } catch {
      setError("Could not use the microphone. Allow microphone access for this site and try again.");
    }
  };
  const stopRecording = () => mic.current?.rec.state === "recording" && mic.current.rec.stop();

  // ---------- export the video ----------
  const finishExport = () => {
    const e = exportRec.current;
    if (!e) return;
    window.setTimeout(() => e.rec.state !== "inactive" && e.rec.stop(), 300);
  };

  const exportVideo = async () => {
    setError("");
    setNote("");
    const cv = canvas.current;
    const a = audio.current;
    if (!cv || !a || !audioUrl || typeof MediaRecorder === "undefined" || !("captureStream" in cv)) {
      setError("This browser cannot export video. Use Chrome or Edge on a computer.");
      return;
    }
    const mimes = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    pause();
    seek(0);
    try {
      const ctx = new AudioContext();
      exportCtx.current = ctx;
      const src = ctx.createMediaElementSource(a);
      const dest = ctx.createMediaStreamDestination();
      src.connect(dest); // not connected to the speakers: the export is silent while it renders
      const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
      const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 6_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const type = rec.mimeType || mime || "video/webm";
        const ext = type.includes("mp4") ? "mp4" : "webm";
        const url = URL.createObjectURL(new Blob(chunks, { type }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `aaron-prince-introduction.${ext}`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 10000);
        exportRec.current = null;
        setExporting(false);
        void ctx.close();
        setNote(`Done: aaron-prince-introduction.${ext} was downloaded.${ext === "webm" ? " WebM plays in Chrome, Edge, Firefox and VLC. If the application needs MP4, convert it free at cloudconvert.com or with HandBrake." : ""}`);
      };
      exportRec.current = { rec, chunks, mime };
      setExporting(true);
      rec.start(250);
      play();
    } catch {
      exportRec.current = null;
      setExporting(false);
      setError("Export could not start. Reload the page and try again.");
    }
  };

  useEffect(
    () => () => {
      mic.current?.stream.getTracks().forEach((x) => x.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // The recording's real length decides where the video ends, so no silent tail and no cut-off.
  const onAudioEnded = () => {
    const a = audio.current;
    if (!a) return;
    if (Number.isFinite(a.currentTime) && a.currentTime > 1) setDuration(a.currentTime);
    tRef.current = a.currentTime;
    playRef.current = false;
    setPlaying(false);
    setT(a.currentTime);
    if (exportRec.current) finishExport();
  };

  const busy = recording || exporting;
  const clock = `${t.toFixed(1)}s / ${recording ? "recording" : `${duration.toFixed(1)}s`}`;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-28">
      <p className="text-sm font-bold uppercase tracking-widest text-violet-light">Application video for Clipboard</p>
      <h1 className="mt-1 text-3xl font-extrabold md:text-5xl">Record it in your voice, download the video</h1>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-soft">
        <li>Press <b>Record my voice</b> and read the captions as they appear. Tap <b>Next line</b> (or press Space) as you start each line.</li>
        <li>Press play to check it. Re-record as many times as you like.</li>
        <li>Press <b>Download video</b>. It renders in real time, so keep this tab open and in view.</li>
      </ol>

      <div className="relative mt-6 overflow-hidden rounded-3xl bg-black shadow-2xl">
        <canvas ref={canvas} width={W} height={H} className="block h-auto w-full" role="img" aria-label="Preview of the introduction video: Aaron Prince with a clipboard checklist and subtitles" />
        {recording && (
          <p className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Recording, line {recLine + 1} of {segs.length}
          </p>
        )}
        {exporting && <p className="absolute left-4 top-4 rounded-full bg-violet px-3 py-1 text-sm font-bold text-white">Rendering video, keep this tab in view...</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {recording ? (
          <>
            <button type="button" onClick={nextLine} disabled={recLine >= segs.length - 1} className="btn-primary disabled:opacity-50">
              <SkipForward className="h-4 w-4" aria-hidden="true" /> Next line (Space)
            </button>
            <button type="button" onClick={stopRecording} className="btn-ghost">
              <Square className="h-4 w-4" aria-hidden="true" /> Stop recording
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => void startRecording()} disabled={busy} className="btn-primary disabled:opacity-50">
              <Mic className="h-4 w-4" aria-hidden="true" /> {audioUrl ? "Record again" : "Record my voice"}
            </button>
            <button type="button" onClick={playing ? pause : play} disabled={busy} className="btn-ghost disabled:opacity-50">
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : tRef.current >= duration - 0.05 ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Pause" : "Play preview"}
            </button>
            <button type="button" onClick={() => void exportVideo()} disabled={busy || !audioUrl} className="btn-primary disabled:opacity-50" title={audioUrl ? "" : "Record your voice first"}>
              <Download className="h-4 w-4" aria-hidden="true" /> {exporting ? "Rendering..." : "Download video"}
            </button>
          </>
        )}
        <input type="range" min={0} max={duration} step={0.1} value={Math.min(t, duration)} onChange={(e) => seek(Number(e.target.value))} disabled={busy} aria-label="Seek" className="min-w-32 flex-1 accent-violet" />
        <span className="font-mono text-sm text-soft">{clock}</span>
      </div>
      {!audioUrl && !recording && <p className="mt-2 text-sm text-soft">Download unlocks after you record your voice, so the video has your voice and not a computer voice.</p>}
      {note && <p role="status" className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-400/10 px-4 py-3 text-sm">{note}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      <audio ref={audio} src={audioUrl ?? undefined} preload="auto" onEnded={onAudioEnded} />

      <details className="mt-8 rounded-2xl border border-line bg-panel p-5">
        <summary className="cursor-pointer font-bold">Change the wording to sound like you</summary>
        <p className="mt-2 text-sm text-soft">One line per row. After the <code>|</code> write what the clipboard ticks off, separated by semicolons. Edit it, then record again.</p>
        <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={9} disabled={busy} aria-label="Script" className="mt-3 w-full rounded-xl border border-line bg-white/5 p-3 font-mono text-sm outline-none focus:border-violet-light" />
        <button type="button" onClick={() => setScript(DEFAULT_SCRIPT)} className="btn-ghost mt-2">Reset to the original script</button>
      </details>
    </div>
  );
};

export default Intro;
