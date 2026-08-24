import { useState, useEffect, useCallback, useContext, createContext, useRef } from "react"
import { ImageWithFallback } from "./components/ImageWithFallback"
import { startLoFiMusic, toggleLoFiMusicMuted, getLoFiMusicMuted } from "./audio/loFiMusic"
import drSparkGif from "./assets/dr-spark.gif"
import claymationMap from "./assets/claymation-map.webp"
import tvFrame from "./assets/tv-frame.webp"
import splashBg from "./assets/splash-bg.webp"
import titleLogo from "./assets/title-logo.webp"
import appBackground from "./assets/app-background.webp"

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen =
  | "intro" | "splash" | "welcome" | "home" | "destination" | "rough-idea"
  | "goal" | "audience" | "tone" | "assembly" | "generating"
  | "result" | "test" | "complete" | "map" | "bank" | "lab" | "profile"
type Overlay = "hint" | "example" | "leave" | null
type TileConf = { icon: string; label: string; onClick: () => void; color?: string }

// ── Static ────────────────────────────────────────────────────────────────────

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 37.3 + 17) % 100,
  y: (i * 53.7 + 31) % 100,
  size: i % 7 === 0 ? 2 : 1,
  opacity: 0.1 + (i % 8) * 0.05,
  delay: (i % 6) * 0.7,
  dur: 2 + (i % 5),
}))

const LOADING_MSGS = [
  "WARMING UP THE WEIRD ENGINES...",
  "CONSULTING THE IDEA ORACLE...",
  "CALIBRATING CREATIVITY LEVELS...",
  "CHARGING THE IMAGINATION PORTAL...",
  "ASKING DR. SPARK FOR ADVICE...",
  "REROUTING THROUGH THE WEIRDVERSE...",
]

// ── Base primitives ───────────────────────────────────────────────────────────

function Starfield() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: s.size, height: s.size,
            left: `${s.x}%`, top: `${s.y}%`,
            opacity: s.opacity,
            animation: `twinkle ${s.dur}s ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// Dr. Spark — always the GIF, pose prop kept for backward compat
function MapEnergyTrails() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen", opacity: 0.6 }}
      viewBox="0 0 400 300"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00AEFF" />
          <stop offset="50%" stopColor="#B400FF" />
          <stop offset="100%" stopColor="#FF00A0" />
        </linearGradient>
        <filter id="trailGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M -10,44 C 80,8 140,86 222,50 S 342,6 412,58" fill="none" stroke="url(#trailGrad)" strokeWidth="1.7" filter="url(#trailGlow)" strokeDasharray="6 11">
        <animate attributeName="stroke-dashoffset" from="0" to="-170" dur="9s" repeatCount="indefinite" />
      </path>
      <path d="M -10,232 C 68,268 152,196 232,238 S 352,276 412,214" fill="none" stroke="url(#trailGrad)" strokeWidth="1.3" filter="url(#trailGlow)" strokeDasharray="5 9" opacity="0.75">
        <animate attributeName="stroke-dashoffset" from="0" to="150" dur="11s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

function DrSpark({ size = 60 }: { pose?: string; size?: number }) {
  return (
    <ImageWithFallback
      src={drSparkGif}
      alt="Dr. Spark pixel-art professor mascot"
      style={{ width: size, height: size, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }}
    />
  )
}

// Pixel-art speech bubble — tail points left toward Dr. Spark
function SpeechBubble({ text, width = 200 }: { text: string; width?: number }) {
  return (
    <div style={{ position: "relative", zIndex: 5 }}>
      {/* left-pointing tail (outer) */}
      <div style={{ position: "absolute", left: -9, top: 10, width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "9px solid #7A5218" }} />
      {/* left-pointing tail (inner) */}
      <div style={{ position: "absolute", left: -5, top: 12, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "6px solid #FFF8E7" }} />
      <div
        style={{
          background: "#FFF8E7",
          border: "2.5px solid #7A5218",
          borderRadius: 6,
          padding: "6px 11px",
          width,
          fontFamily: "'VT323', monospace",
          fontSize: 15,
          color: "#1a0800",
          lineHeight: 1.35,
        }}
      >
        {text}
      </div>
    </div>
  )
}

// Falling digital-rain overlay, drawn on a canvas so it stays cheap even
// though it redraws every frame.
function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const chars = "アイウエオカキクケコサシスセソ01234567890XY#$%&"
    const fontSize = 13
    let columns = 0
    let drops = []
    let raf

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width))
      canvas.height = Math.max(1, Math.round(rect.height))
      columns = Math.ceil(canvas.width / fontSize)
      drops = Array.from({ length: columns }, () => Math.random() * -40)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    function draw() {
      ctx.fillStyle = "rgba(0, 8, 4, 0.16)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const y = drops[i] * fontSize
        ctx.fillStyle = Math.random() < 0.06 ? "#d4ffe4" : "rgba(60,255,140,0.8)"
        ctx.fillText(char, i * fontSize, y)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 1
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ zIndex: 15, mixBlendMode: "screen", opacity: 0.5, pointerEvents: "none" }}
    />
  )
}

// ── TV Shell — the retro CRT frame around all scene content ───────────────────

function TVShell({
  children, sparkSpeech, sparkSize = 54, sparkInScreen = false,
}: {
  children?: React.ReactNode
  sparkSpeech?: string
  sparkSize?: number
  sparkInScreen?: boolean
}) {
  return (
    <div className="relative w-full flex-shrink-0">
      {/* Physical TV frame */}
      <ImageWithFallback src={tvFrame} alt="Retro CRT television" className="w-full block" />
      {/* Screen area positioned over the TV's glass opening */}
      <div
        className="absolute overflow-hidden crt-screen-on"
        style={{ top: "7%", left: "9%", right: "8%", bottom: "16%" }}
      >
        {/* Screen fill */}
        <div className="absolute inset-0" style={{ background: "#000608" }} />
        {/* Scene content */}
        <div className="relative z-10 w-full h-full overflow-hidden">
          {children}
        </div>
        {/* Matrix digital-rain, screened on top of the scene content — only on big
            decorative scenes; it fights legibility over text-heavy screens like forms */}
        {sparkInScreen && <MatrixRain />}
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 30,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.14) 2px, rgba(0,0,0,0.14) 4px)",
          }}
        />
        {/* CRT tube vignette + green phosphor cast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 31,
            background: "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(40,255,140,0.05) 0%, transparent 55%, rgba(0,0,0,0.55) 100%)",
            boxShadow: "inset 0 0 40px 8px rgba(0,0,0,0.65)",
          }}
        />
        {/* Slow scan-glow sweep */}
        <div
          className="absolute pointer-events-none crt-sweep"
          style={{
            zIndex: 32, left: 0, right: 0, height: "18%",
            background: "linear-gradient(to bottom, transparent, rgba(140,255,190,0.06), transparent)",
          }}
        />
        {/* Dr. Spark + speech bubble — large in the screen's own bottom-left corner on screens with room */}
        {sparkSpeech && sparkInScreen && (
          <div className="absolute z-20 flex items-end gap-1.5" style={{ bottom: "3%", left: "3%" }}>
            <DrSpark size={sparkSize} />
            <div style={{ marginBottom: 30 }}>
              <SpeechBubble text={sparkSpeech} width={176} />
            </div>
          </div>
        )}
      </div>
      {/* Dr. Spark + speech bubble — compact, floats near the bottom-left foot of the TV frame */}
      {sparkSpeech && !sparkInScreen && (
        <div className="absolute z-20 flex items-center gap-1" style={{ bottom: "0%", left: "2%" }}>
          <DrSpark size={sparkSize} />
          <SpeechBubble text={sparkSpeech} />
        </div>
      )}
      <style>{`
        .crt-screen-on { animation: crtFlicker 5s ease-in-out infinite; filter: saturate(0.9) contrast(1.08) brightness(1.02); }
        @keyframes crtFlicker {
          0%, 100% { filter: saturate(0.9) contrast(1.08) brightness(1.02); }
          42%      { filter: saturate(0.9) contrast(1.1) brightness(0.97); }
          43%      { filter: saturate(0.9) contrast(1.05) brightness(1.05); }
          78%      { filter: saturate(0.9) contrast(1.08) brightness(0.99); }
        }
        .crt-sweep { animation: crtSweep 7s linear infinite; }
        @keyframes crtSweep {
          0%   { top: -20%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}

// ── App header ────────────────────────────────────────────────────────────────

const MusicContext = createContext({ muted: false, toggle: () => {} })

function AppHeader() {
  const { muted, toggle } = useContext(MusicContext)
  return (
    <div className="flex items-center gap-2 px-3 pt-1 pb-1 flex-shrink-0">
      {/* Chrome title */}
      <div className="flex-1 text-center">
        {["PRODUCT", "IMAGINATION"].map((word) => (
          <div
            key={word}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              lineHeight: 1.55,
              background: "linear-gradient(180deg,#fff 0%,#e4e4e4 28%,#b8b8b8 52%,#a0a0a0 74%,#d0d0d0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(0,170,255,0.85)) drop-shadow(2px 2px 0 rgba(0,0,70,0.9))",
            }}
          >
            {word}
          </div>
        ))}
      </div>
      {/* Icon buttons */}
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={toggle}
          aria-label={muted ? "Unmute music" : "Mute music"}
          style={{
            width: 38, height: 38, borderRadius: 7, fontSize: 16,
            background: "rgba(12,12,32,0.96)",
            border: "1.5px solid rgba(0,190,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          style={{
            width: 38, height: 38, borderRadius: 7, fontSize: 16,
            background: "rgba(12,12,32,0.96)",
            border: "1.5px solid rgba(0,190,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ⚙️
        </button>
      </div>
    </div>
  )
}

// ── Game counters ─────────────────────────────────────────────────────────────

function GameCounters({ xp = 1250, level = 75, missions = 12 }: { xp?: number; level?: number; missions?: number }) {
  return (
    <div className="flex gap-2 px-3 mb-1 flex-shrink-0">
      {[
        { icon: "💡", value: xp.toLocaleString(), color: "#FFD700" },
        { icon: "🌀", value: String(level), color: "#CC44FF" },
        { icon: "🚩", value: String(missions), color: "#00FF88" },
      ].map(({ icon, value, color }) => (
        <div
          key={icon}
          className="flex-1 flex items-center gap-1.5 px-2.5 py-1"
          style={{
            borderRadius: 20,
            border: `2px solid ${color}`,
            background: `rgba(0,0,0,0.75)`,
            boxShadow: `0 0 10px ${color}40`,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color, textShadow: `0 0 8px ${color}` }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Portal CTA — the large rainbow-bordered button ────────────────────────────

function PortalCTA({
  label, onClick, color = "rainbow",
}: {
  label: string; onClick: () => void; color?: "rainbow" | "yellow" | "cyan" | "green" | "magenta"
}) {
  const grad: Record<string, string> = {
    rainbow: "linear-gradient(90deg,#00DDFF,#9900FF,#FF00CC,#FF5500,#FFE500,#00DDFF)",
    yellow: "linear-gradient(90deg,#FFD700,#FFAA00,#FFD700)",
    cyan: "linear-gradient(90deg,#00FFEA,#0099FF,#00FFEA)",
    green: "linear-gradient(90deg,#00FF88,#00FFEA,#00FF88)",
    magenta: "linear-gradient(90deg,#FF00FF,#9900FF,#FF00FF)",
  }
  return (
    <button
      onClick={onClick}
      className="w-full flex-shrink-0 active:scale-[0.98] transition-all"
      style={{
        padding: 3, background: grad[color], borderRadius: 13,
        boxShadow: "0 0 28px rgba(0,150,255,0.55), 0 0 56px rgba(180,0,200,0.25)",
      }}
    >
      <div
        style={{
          background: "rgba(4,4,20,0.97)", borderRadius: 11,
          padding: "14px 8px",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 13, color: "white", letterSpacing: "0.04em",
          textShadow: "0 0 18px rgba(255,255,255,0.9), 0 2px 0 rgba(0,0,80,0.8)",
        }}
      >
        {label}
      </div>
    </button>
  )
}

// ── Action tile ───────────────────────────────────────────────────────────────

function ActionTile({ icon, label, onClick, color = "#00FFEA" }: TileConf) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 py-3 transition-all active:scale-95"
      style={{
        border: `2px solid ${color}`, borderRadius: 10,
        background: "rgba(4,4,18,0.92)",
        boxShadow: `0 0 14px ${color}35`,
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color, textShadow: `0 0 6px ${color}` }}>
        {label}
      </span>
    </button>
  )
}

// ── Bottom tab bar ────────────────────────────────────────────────────────────

function BottomTabs({ active, onTab }: { active: string; onTab: (t: string) => void }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "HOME" },
    { id: "map", icon: "🗺️", label: "MAP" },
    { id: "create", label: "CREATE", isCreate: true },
    { id: "bank", icon: "🏛️", label: "BANK" },
    { id: "profile", icon: "👤", label: "PROFILE" },
  ]
  return (
    <div
      className="flex items-end flex-shrink-0"
      style={{
        background: "rgba(5,5,18,0.99)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        minHeight: 62, paddingBottom: 10,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTab(tab.id)}
          className="flex-1 flex flex-col items-center justify-center transition-all"
          style={{ minHeight: 44 }}
        >
          {tab.isCreate ? (
            <div style={{ marginTop: -18 }}>
              <div
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "conic-gradient(from 0deg,#FF0000,#FF7F00,#FFE500,#00FF44,#0000FF,#9400D3,#FF0000)",
                  animation: "spin 4s linear infinite",
                  padding: 3,
                  boxShadow: "0 0 22px rgba(130,0,210,0.55),0 0 44px rgba(0,100,255,0.3)",
                }}
              >
                <div
                  style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    background: "#06060E",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 15, color: "white" }}>✦</span>
                </div>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: 20, opacity: active === tab.id ? 1 : 0.35 }}>{tab.icon}</span>
          )}
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 6, marginTop: 2,
              color: active === tab.id ? "#FFD700" : tab.isCreate ? "rgba(255,255,255,0.5)" : "#444",
              textShadow: active === tab.id ? "0 0 6px #FFD700" : "none",
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Small helpers for TV scene content ────────────────────────────────────────

function TvLabel({ text, color = "#00FFEA" }: { text: string; color?: string }) {
  return (
    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color, textShadow: `0 0 4px ${color}` }}>
      {text}
    </div>
  )
}

function TvBody({ text, color = "#CCC" }: { text: string; color?: string }) {
  return (
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color, lineHeight: 1.4 }}>{text}</div>
  )
}

// Compact pick card (used inside TV for goal/audience pickers)
function PickCard({
  icon, label, color, selected, onClick,
}: { icon: string; label: string; color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
      style={{
        border: `2px solid ${selected ? color : `${color}40`}`,
        borderRadius: 6,
        background: selected ? `${color}20` : "rgba(0,0,0,0.4)",
        boxShadow: selected ? `0 0 10px ${color}55` : "none",
        padding: "8px 4px",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color, lineHeight: 1.2, textAlign: "center" }}>
        {label}
      </span>
    </button>
  )
}

// Score ring for prompt result
function ScoreRing({ score }: { score: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="32" cy="32" r={r} stroke="#1a1a1a" strokeWidth="7" fill="none" />
        <circle cx="32" cy="32" r={r} stroke="#00FFEA" strokeWidth="7" fill="none"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          style={{ filter: "drop-shadow(0 0 5px #00FFEA)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: "#00FFEA" }}>{score}</span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: "#555" }}>/100</span>
      </div>
    </div>
  )
}

// ── Intro Clip · hallucinogenic groovy swirl loop ────────────────────────────
// Beat grid: everything is a factor of 5s → 5s / 2.5s / 1.25s

// Logo lockup — the chrome wordmark + tagline as a single crisp image
function TitleLockup({ maxWidth = 340 }: { maxWidth?: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={titleLogo}
        alt="Product Imagination — Imagination Is The Last Currency"
        style={{ width: "78%", maxWidth, margin: "0 auto", display: "block", filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.65))" }}
      />
    </div>
  )
}

function IntroClipScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      onClick={onEnter}
      style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden", cursor: "pointer" }}
    >

      {/* ── SWIRL A: wide slow CCW rainbow vortex — full backdrop ── */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", left: "50%",
        width: "520%", height: "520%",
        background: "conic-gradient(from 0deg,#FF0080 0%,#FF6000 14%,#FFE500 28%,#00FF88 42%,#0088FF 57%,#9900FF 71%,#FF0080 100%)",
        animation: "swirlCCW 5s linear infinite",
        opacity: 0.13,
        mixBlendMode: "screen",
      }} />

      {/* ── SWIRL B: tight magenta pinwheel CW 2.5s ── */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", left: "50%",
        width: "380%", height: "380%",
        background: "repeating-conic-gradient(from 0deg, rgba(255,0,180,0.32) 0deg 8deg, transparent 8deg 22deg)",
        animation: "swirlCW 2.5s linear infinite",
        mixBlendMode: "screen",
      }} />

      {/* ── SWIRL C: tight cyan pinwheel CCW 2.5s ── */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", left: "50%",
        width: "300%", height: "300%",
        background: "repeating-conic-gradient(from 0deg, rgba(0,240,255,0.28) 0deg 6deg, transparent 6deg 20deg)",
        animation: "swirlCCW 2.5s linear infinite",
        mixBlendMode: "screen",
      }} />

      {/* ── SWIRL D: small fast yellow CW 1.25s ── */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", left: "50%",
        width: "210%", height: "210%",
        background: "repeating-conic-gradient(from 0deg, rgba(255,220,0,0.38) 0deg 4deg, transparent 4deg 13deg)",
        animation: "swirlCW 1.25s linear infinite",
        mixBlendMode: "screen",
      }} />

      {/* ── IMAGE A: main portal — breathes + full hue cycle over 5s ── */}
      <div aria-hidden style={{
        position: "absolute", inset: "-8%",
        animation: "imgA 5s ease-in-out infinite",
        transformOrigin: "50% 50%",
      }}>
        <ImageWithFallback src={splashBg} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
      </div>

      {/* ── IMAGE B: mirrored portal — exclusion blend, offset phase ──
          Creates psychedelic moiré as it drifts out of sync with A     */}
      <div aria-hidden style={{
        position: "absolute", inset: "-8%",
        animation: "imgB 5s ease-in-out infinite",
        transformOrigin: "50% 50%",
        mixBlendMode: "exclusion",
        opacity: 0.55,
      }}>
        <ImageWithFallback src={splashBg} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", transform: "scaleX(-1)" }} />
      </div>

      {/* ── MAP: floats over top, overlay blend, slow rock ── */}
      <div aria-hidden style={{
        position: "absolute", inset: "-12%",
        animation: "mapRock 5s ease-in-out infinite",
        transformOrigin: "50% 50%",
        mixBlendMode: "overlay",
      }}>
        <ImageWithFallback src={claymationMap} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* ── BEAT PULSE: radial flash every 1.25s (4× per loop) ── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, transparent 62%)",
        animation: "beatPulse 1.25s ease-out infinite",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }} />

      {/* ── TUNNEL VIGNETTE: keeps edges dark, pulls eye to center ── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 18%, rgba(0,0,0,0.92) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── TITLE — crisp, above the psychedelic blend layers so it stays legible ── */}
      <div style={{ position: "absolute", top: 20, left: 0, right: 0, pointerEvents: "none" }}>
        <TitleLockup maxWidth={300} />
      </div>

      {/* ── CENTER MANDALA: 4 flattened rings spinning in unison ── */}
      <div aria-hidden style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 80, height: 80,
        marginLeft: -40, marginTop: -40,
        animation: "mandalaSpin 2.5s linear infinite",
        pointerEvents: "none",
      }}>
        {([0, 45, 90, 135] as number[]).map((deg) => (
          <div key={deg} style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(0,255,200,0.5)",
            boxShadow: "0 0 8px rgba(0,255,200,0.35)",
            transform: `rotate(${deg}deg) scaleX(0.25)`,
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5,
          borderRadius: "50%",
          background: "rgba(0,255,200,0.95)",
          boxShadow: "0 0 16px #00FFEA, 0 0 32px rgba(0,255,234,0.5)",
        }} />
      </div>

      {/* ── TAP TO ENTER — blinks on beat ── */}
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
          color: "#FFD700",
          textShadow: "0 0 14px #FFD700, 0 0 28px rgba(255,215,0,0.45)",
          animation: "blink 1.25s step-end infinite",
          letterSpacing: "0.1em",
        }}>
          TAP TO ENTER
        </span>
      </div>

      <style>{`
        @keyframes swirlCW  { from{transform:translate(-50%,-50%) rotate(0deg);}   to{transform:translate(-50%,-50%) rotate(360deg);} }
        @keyframes swirlCCW { from{transform:translate(-50%,-50%) rotate(0deg);}   to{transform:translate(-50%,-50%) rotate(-360deg);} }

        @keyframes imgA {
          0%   { transform:scale(1.06) rotate(0deg);     filter:hue-rotate(0deg)   saturate(3.5) brightness(1.05); }
          25%  { transform:scale(1.00) rotate(0.9deg);   filter:hue-rotate(90deg)  saturate(5)   brightness(1.4); }
          50%  { transform:scale(1.09) rotate(0deg);     filter:hue-rotate(180deg) saturate(3.5) brightness(1.05); }
          75%  { transform:scale(1.00) rotate(-0.9deg);  filter:hue-rotate(270deg) saturate(5)   brightness(1.4); }
          100% { transform:scale(1.06) rotate(0deg);     filter:hue-rotate(360deg) saturate(3.5) brightness(1.05); }
        }
        @keyframes imgB {
          0%   { transform:scale(1.00) rotate(0deg);     filter:hue-rotate(180deg) saturate(2.5) brightness(0.85); }
          25%  { transform:scale(1.09) rotate(-0.7deg);  filter:hue-rotate(270deg) saturate(4)   brightness(1.2); }
          50%  { transform:scale(1.00) rotate(0deg);     filter:hue-rotate(360deg) saturate(2.5) brightness(0.85); }
          75%  { transform:scale(1.09) rotate(0.7deg);   filter:hue-rotate(90deg)  saturate(4)   brightness(1.2); }
          100% { transform:scale(1.00) rotate(0deg);     filter:hue-rotate(180deg) saturate(2.5) brightness(0.85); }
        }
        @keyframes mapRock {
          0%   { transform:scale(1.12) rotate(0deg);    filter:hue-rotate(0deg)   saturate(2) brightness(0.65); opacity:0.28; }
          25%  { transform:scale(1.03) rotate(2deg);    filter:hue-rotate(90deg)  saturate(4) brightness(1.1);  opacity:0.5; }
          50%  { transform:scale(1.12) rotate(0deg);    filter:hue-rotate(180deg) saturate(2) brightness(0.65); opacity:0.28; }
          75%  { transform:scale(1.03) rotate(-2deg);   filter:hue-rotate(270deg) saturate(4) brightness(1.1);  opacity:0.5; }
          100% { transform:scale(1.12) rotate(0deg);    filter:hue-rotate(360deg) saturate(2) brightness(0.65); opacity:0.28; }
        }
        @keyframes beatPulse {
          0%   { opacity:0.9; transform:scale(1); }
          35%  { opacity:0.1; transform:scale(0.88); }
          65%  { opacity:0.55; transform:scale(1.06); }
          100% { opacity:0.9; transform:scale(1); }
        }
        @keyframes mandalaSpin {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ── Screen 1 · Splash ─────────────────────────────────────────────────────────

function SplashScreen({ onNext }: { onNext: () => void }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => {
      setPct((p) => {
        if (p >= 100) { clearInterval(iv); setTimeout(onNext, 500); return 100 }
        return p + 1.4
      })
    }, 44)
    return () => clearInterval(iv)
  }, [onNext])

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Full-bleed splash artwork (portal art only — title lives in its own layer below) */}
      <ImageWithFallback
        src={splashBg}
        alt="Product Imagination — Weirdverse portal splash"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center top" }}
      />
      {/* Title logo, de-glared and layered on its own so it stays crisp */}
      <div className="absolute" style={{ top: 18, left: 0, right: 0 }}>
        <TitleLockup />
      </div>
      {/* Subtle vignette so the loading bar reads clearly */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.85) 100%)" }} />
      {/* Loading bar — mirrors the design in the image */}
      <div className="absolute flex items-center gap-3 px-5" style={{ bottom: 40, left: 0, right: 0 }}>
        {/* Atom icon */}
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #00AAFF", boxShadow: "0 0 10px #00AAFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>⚛</span>
        </div>
        {/* Bar track */}
        <div className="flex-1" style={{ height: 10, borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.5)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            borderRadius: 999,
            background: "linear-gradient(90deg,#CC00FF,#FF00CC,#FF4400,#FFB800)",
            boxShadow: "0 0 10px rgba(255,80,0,0.7)",
            transition: "width 0.05s linear",
          }} />
        </div>
      </div>
      {/* Label */}
      <div className="absolute" style={{ bottom: 18, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "rgba(255,220,0,0.85)", letterSpacing: "0.1em", textShadow: "0 0 8px #FFD700" }}>
          INITIALIZING THE WEIRDVERSE...
        </span>
      </div>
    </div>
  )
}

// ── Screen 2 · Welcome ────────────────────────────────────────────────────────

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-3 py-2">
      <Starfield />
      {/* Title */}
      <div className="text-center mb-1 flex-shrink-0">
        {["PRODUCT", "IMAGINATION"].map((w) => (
          <div key={w} style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 12, lineHeight: 1.55,
            background: "linear-gradient(180deg,#fff 0%,#e0e0e0 30%,#b0b0b0 55%,#d0d0d0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 10px rgba(0,180,255,0.85)) drop-shadow(2px 2px 0 rgba(0,0,80,0.9))",
          }}>{w}</div>
        ))}
      </div>
      {/* TV with welcome message */}
      <div className="relative w-full flex-shrink-0">
        <ImageWithFallback src={tvFrame} alt="CRT TV" className="w-full block" />
        <div className="absolute overflow-hidden" style={{ top: "7%", left: "9%", right: "8%", bottom: "16%", background: "#000610" }}>
          <div style={{ padding: "10px 10px 0 10px", height: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#00FFEA", lineHeight: 1.5 }}>
              <span style={{ color: "#FF00FF" }}>{"DR. SPARK: "}</span>
              {"Hello, future Idea Wizard! I'll guide you through the "}
              <span style={{ color: "#FFE500" }}>WEIRDVERSE</span>
              {" — where wild ideas become real things."}
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "rgba(0,255,234,0.5)" }}>
              Build better prompts. Unlock levels. Break the internet (nicely).
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)" }} />
        </div>
        {/* Dr. Spark near bottom-left foot of TV */}
        <div className="absolute z-20 flex items-center gap-1" style={{ bottom: "0%", left: "2%" }}>
          <DrSpark size={54} />
          <SpeechBubble text="Ready to get weird?" />
        </div>
      </div>
      <div className="mt-2 px-0 flex-shrink-0 space-y-2">
        <PortalCTA label="SHOW ME HOW." onClick={onNext} color="magenta" />
        <button onClick={onNext} style={{ display: "block", width: "100%", textAlign: "center", fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#444", padding: "8px" }}>
          SKIP INTRO →
        </button>
      </div>
    </div>
  )
}

// ── Screens 3–17: shared shell with AppHeader + GameCounters + TV ─────────────

function MainLayout({
  children, sparkSpeech, sparkSize, sparkInScreen, ctaLabel, onCTA, ctaColor = "rainbow",
  tiles, activeTab, onTab,
}: {
  children: React.ReactNode
  sparkSpeech?: string
  sparkSize?: number
  sparkInScreen?: boolean
  ctaLabel?: string
  onCTA?: () => void
  ctaColor?: "rainbow" | "yellow" | "cyan" | "green" | "magenta"
  tiles?: [TileConf, TileConf, TileConf]
  activeTab?: string
  onTab?: (t: string) => void
}) {
  return (
    <div className="flex flex-col h-full">
      <Starfield />
      <AppHeader />
      <GameCounters />
      <div className="px-2 flex-shrink-0">
        <TVShell sparkSpeech={sparkSpeech} sparkSize={sparkSize} sparkInScreen={sparkInScreen}>{children}</TVShell>
      </div>
      {ctaLabel && (
        <div className="px-2 mt-2 flex-shrink-0">
          <PortalCTA label={ctaLabel} onClick={onCTA!} color={ctaColor} />
        </div>
      )}
      {tiles && (
        <div className="px-2 mt-2 grid grid-cols-3 gap-2 flex-shrink-0">
          {tiles.map((t) => <ActionTile key={t.label} {...t} />)}
        </div>
      )}
      {onTab && <BottomTabs active={activeTab!} onTab={onTab} />}
    </div>
  )
}

// ── Screen 3 · Home ───────────────────────────────────────────────────────────

function HomeScreen({ onNav, onEnter }: { onNav: (t: string) => void; onEnter: () => void }) {
  return (
    <MainLayout
      sparkSpeech="Ready to think weird?"
      sparkSize={104}
      sparkInScreen
      ctaLabel="ENTER THE PORTAL"
      onCTA={onEnter}
      ctaColor="rainbow"
      tiles={[
        { icon: "💾", label: "CONTINUE", onClick: () => onNav("destination"), color: "#FFD700" },
        { icon: "🗺️", label: "WORLD MAP", onClick: () => onNav("map"), color: "#00FFEA" },
        { icon: "⚗️", label: "IDEA LAB", onClick: () => onNav("lab"), color: "#AA44FF" },
      ]}
      activeTab="home"
      onTab={onNav}
    >
      {/* Claymation map fills the TV screen, zoomed in on the island cluster */}
      <ImageWithFallback
        src={claymationMap}
        alt="Weirdverse world map"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center 32%" }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(0,4,0,0.22)" }} />
      <MapEnergyTrails />
      {/* Mission pulse on Etherville */}
      <div className="absolute" style={{ left: "36%", top: "34%", width: 22, height: 22, borderRadius: "50%", border: "2px solid #FFE500", boxShadow: "0 0 10px #FFE500", animation: "ping 2.5s ease-in-out infinite" }} />
    </MainLayout>
  )
}

// ── Screen 4 · Destination ────────────────────────────────────────────────────

function DestinationScreen({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return (
    <MainLayout
      sparkSpeech="Your mission awaits!"
      ctaLabel="▶ START MISSION"
      onCTA={onStart}
      ctaColor="yellow"
    >
      {/* Map as backdrop */}
      <ImageWithFallback src={claymationMap} alt="Etherville map" className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", objectPosition: "center 20%" }} />
      <div className="absolute inset-0" style={{ background: "rgba(0,4,0,0.55)" }} />
      {/* Back button */}
      <button onClick={onBack} className="absolute top-1.5 left-1.5 z-10 px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#FFD700", border: "1px solid #FFD70060" }}>◀ BACK</button>
      {/* Mission card */}
      <div className="absolute right-1.5 top-1.5 z-10 p-2.5" style={{ border: "1.5px solid rgba(255,229,0,0.6)", background: "rgba(10,8,0,0.88)", maxWidth: 140 }}>
        <TvLabel text="MISSION 01" color="#FFE500" />
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "white", marginTop: 3, lineHeight: 1.5 }}>THE VIRAL CHALLENGE</div>
        <TvBody text="Build a prompt that generates a viral video concept. Score 80+." color="#AAA" />
        <div className="flex gap-2 mt-2">
          {[{ l: "XP", v: "250" }, { l: "DIFF", v: "EASY" }].map(({ l, v }) => (
            <div key={l} className="text-center">
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: "#555" }}>{l}</div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#FFE500" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Active node pulse */}
      <div className="absolute" style={{ left: "36%", top: "45%", width: 18, height: 18, borderRadius: "50%", border: "2px solid #FFE500", background: "rgba(255,229,0,0.25)", animation: "blink 1.5s step-end infinite" }} />
    </MainLayout>
  )
}

// ── Screen 5 · Rough Idea ─────────────────────────────────────────────────────

function RoughIdeaScreen({
  onBack, onBuild, onOverlay,
}: { onBack: () => void; onBuild: () => void; onOverlay: (o: "hint" | "example" | "leave") => void }) {
  const [idea, setIdea] = useState("")
  return (
    <MainLayout
      sparkSpeech="What's your big idea?"
      ctaLabel="⚡ BUILD MY PROMPT"
      onCTA={onBuild}
      ctaColor="cyan"
      tiles={[
        { icon: "💡", label: "HINT", onClick: () => onOverlay("hint"), color: "#FFD700" },
        { icon: "📋", label: "EXAMPLE", onClick: () => onOverlay("example"), color: "#FF00FF" },
        { icon: "🚪", label: "LEAVE", onClick: () => onOverlay("leave"), color: "#666" },
      ]}
    >
      <div className="absolute inset-0 p-2 flex flex-col gap-2 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <button onClick={onBack} className="self-start px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#00FFEA", border: "1px solid #00FFEA40" }}>◀ BACK</button>
        <TvLabel text="DESCRIBE YOUR IDEA:" />
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="MAKE ME A VIRAL VIDEO."
          rows={5}
          className="w-full bg-transparent outline-none resize-none flex-shrink-0"
          style={{ fontFamily: "'VT323', monospace", fontSize: 17, color: "#00FFEA", border: "1px solid rgba(0,255,234,0.3)", padding: "8px 10px", lineHeight: 1.4, minHeight: 120 }}
        />
        <TvLabel text="PROMPT INGREDIENTS:" color="#FFE500" />
        {[
          { key: "goal", label: "GOAL", desc: "What to create?", color: "#00FFEA", icon: "◎" },
          { key: "aud", label: "AUDIENCE", desc: "Who's it for?", color: "#FF00FF", icon: "◉" },
          { key: "tone", label: "TONE", desc: "How should it feel?", color: "#FFE500", icon: "◈" },
        ].map(({ key, label, desc, color, icon }) => (
          <button key={key} className="flex items-center gap-2 p-1.5 transition-all" style={{ border: `1px solid ${color}40` }} onClick={onBuild}>
            <span style={{ fontSize: 16, color }}>{icon}</span>
            <div className="flex-1 text-left">
              <TvLabel text={label} color={color} />
              <TvBody text={desc} color="#777" />
            </div>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color }}>→</span>
          </button>
        ))}
      </div>
    </MainLayout>
  )
}

// ── Screen 6 · Goal Picker ────────────────────────────────────────────────────

function GoalScreen({ onBack, onSelect }: { onBack: () => void; onSelect: (g: string) => void }) {
  const [sel, setSel] = useState("")
  const opts = [
    { id: "video", icon: "🎬", label: "VIDEO", color: "#FF00FF" },
    { id: "post", icon: "📝", label: "POST", color: "#00FFEA" },
    { id: "image", icon: "🎨", label: "IMAGE", color: "#FFE500" },
    { id: "app", icon: "📱", label: "APP IDEA", color: "#FF6B00" },
    { id: "plan", icon: "📊", label: "PRODUCT", color: "#AA00FF" },
    { id: "custom", icon: "⚡", label: "CUSTOM", color: "#00FF88" },
  ]
  return (
    <MainLayout sparkSpeech="Pick your goal!" ctaLabel="ADD GOAL →" onCTA={() => sel && onSelect(sel)} ctaColor="cyan">
      <div className="absolute inset-0 p-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#00FFEA", border: "1px solid #00FFEA40" }}>◀ BACK</button>
          <TvLabel text="WHAT TO CREATE?" color="#00FFEA" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {opts.map((o) => (
            <PickCard key={o.id} icon={o.icon} label={o.label} color={o.color} selected={sel === o.id} onClick={() => setSel(o.id)} />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 7 · Audience Picker ────────────────────────────────────────────────

function AudienceScreen({ onBack, onSelect }: { onBack: () => void; onSelect: (a: string) => void }) {
  const [sel, setSel] = useState("")
  const opts = [
    { id: "users", icon: "👥", label: "APP USERS", color: "#00FFEA" },
    { id: "creators", icon: "🎙️", label: "CREATORS", color: "#FF00FF" },
    { id: "biz", icon: "🏢", label: "BUSINESS", color: "#FFE500" },
    { id: "customers", icon: "🛒", label: "CUSTOMERS", color: "#FF6B00" },
    { id: "community", icon: "🌐", label: "COMMUNITY", color: "#AA00FF" },
    { id: "custom", icon: "⚡", label: "CUSTOM", color: "#00FF88" },
  ]
  return (
    <MainLayout sparkSpeech="Who are we targeting?" ctaLabel="ADD AUDIENCE →" onCTA={() => sel && onSelect(sel)} ctaColor="magenta">
      <div className="absolute inset-0 p-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#FF00FF", border: "1px solid #FF00FF40" }}>◀ BACK</button>
          <TvLabel text="WHO IS THIS FOR?" color="#FF00FF" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {opts.map((o) => (
            <PickCard key={o.id} icon={o.icon} label={o.label} color={o.color} selected={sel === o.id} onClick={() => setSel(o.id)} />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 8 · Tone Picker ────────────────────────────────────────────────────

function ToneScreen({ onBack, onSelect }: { onBack: () => void; onSelect: (t: string) => void }) {
  const [sel, setSel] = useState<string[]>([])
  const tones = [
    { id: "funny", label: "FUNNY", color: "#FFE500" },
    { id: "weird", label: "WEIRD", color: "#FF00FF" },
    { id: "exciting", label: "EXCITING", color: "#FF6B00" },
    { id: "helpful", label: "HELPFUL", color: "#00FFEA" },
    { id: "cinematic", label: "CINEMATIC", color: "#AA00FF" },
    { id: "professional", label: "PROFE…", color: "#0088FF" },
    { id: "calm", label: "CALM", color: "#00FF88" },
  ]
  const toggle = (id: string) => setSel((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p)
  return (
    <MainLayout sparkSpeech="How should it feel?" ctaLabel="ADD TONE →" onCTA={() => sel.length > 0 && onSelect(sel.join("+"))} ctaColor="yellow">
      <div className="absolute inset-0 p-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#FFE500", border: "1px solid #FFE50040" }}>◀ BACK</button>
          <TvLabel text="PICK UP TO 3" color="#FFE500" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tones.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="px-2.5 py-1.5 transition-all"
              style={{
                border: `2px solid ${sel.includes(t.id) ? t.color : `${t.color}35`}`,
                borderRadius: 4,
                background: sel.includes(t.id) ? `${t.color}20` : "transparent",
                fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: t.color,
                boxShadow: sel.includes(t.id) ? `0 0 8px ${t.color}55` : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-2" style={{ border: "1px solid rgba(0,255,234,0.2)", background: "rgba(0,0,0,0.4)", flex: 1 }}>
          <TvLabel text="SELECTED:" color="#555" />
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#00FFEA", marginTop: 3 }}>
            {sel.length > 0 ? sel.map((s) => s.toUpperCase()).join(" + ") : "—"}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 9 · Prompt Assembly ────────────────────────────────────────────────

function PromptAssemblyScreen({
  goal, audience, tone, onBack, onBuild,
}: { goal: string; audience: string; tone: string; onBack: () => void; onBuild: () => void }) {
  const parts = [
    { label: "GOAL", value: goal || "VIDEO", color: "#00FFEA", icon: "◎" },
    { label: "AUDIENCE", value: audience || "CREATORS", color: "#FF00FF", icon: "◉" },
    { label: "TONE", value: tone || "WEIRD+FUNNY", color: "#FFE500", icon: "◈" },
  ]
  return (
    <MainLayout sparkSpeech="Almost ready to build!" ctaLabel="⚡ BUILD MY PROMPT" onCTA={onBuild} ctaColor="cyan">
      <div className="absolute inset-0 p-2 flex flex-col gap-1.5">
        <button onClick={onBack} className="self-start px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#00FFEA", border: "1px solid #00FFEA40" }}>◀ BACK</button>
        {parts.map((p, i) => (
          <div key={p.label}>
            <div className="flex items-center gap-2 p-1.5" style={{ border: `2px solid ${p.color}`, background: `${p.color}12`, boxShadow: `0 0 10px ${p.color}20` }}>
              <span style={{ fontSize: 16, color: p.color }}>{p.icon}</span>
              <div>
                <TvLabel text={p.label} color={p.color} />
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: p.color, textShadow: `0 0 6px ${p.color}`, textTransform: "uppercase" }}>{p.value}</div>
              </div>
            </div>
            {i < 2 && <div style={{ textAlign: "center", color: "#333", fontSize: 12, lineHeight: 1 }}>+</div>}
          </div>
        ))}
        {/* Chamber */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ border: "1px solid rgba(0,255,234,0.2)", background: "rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 28, animation: "portalPulse 1.5s ease-in-out infinite", filter: "drop-shadow(0 0 10px #00FFEA)" }}>⚡</div>
          <TvLabel text="CHAMBER CHARGED" color="rgba(0,255,234,0.5)" />
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 10 · Generating ────────────────────────────────────────────────────

function GeneratingScreen({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MSGS.length)
      setPct((p) => { if (p >= 100) { clearInterval(iv); setTimeout(onDone, 400); return 100 } return p + 1.8 })
    }, 100)
    return () => clearInterval(iv)
  }, [onDone])
  return (
    <MainLayout sparkSpeech="Hold on... thinking!">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3">
        <div className="relative flex items-center justify-center">
          <div style={{ width: 90, height: 90, borderRadius: "50%", border: "3px solid #FF00FF", boxShadow: "0 0 40px #FF00FF,inset 0 0 40px rgba(255,0,255,0.15)", animation: "spin 2s linear infinite" }} />
          <div style={{ position: "absolute", width: 62, height: 62, borderRadius: "50%", border: "2px solid #00FFEA", boxShadow: "0 0 20px #00FFEA", animation: "spin 1.4s linear infinite reverse" }} />
          <div style={{ position: "absolute", width: 38, height: 38, borderRadius: "50%", border: "1.5px solid #FFE500", animation: "spin 0.8s linear infinite" }} />
          <span style={{ position: "absolute", fontSize: 20, animation: "blink 0.8s step-end infinite" }}>⚡</span>
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: "#FF00FF", textShadow: "0 0 8px #FF00FF", textAlign: "center", minHeight: 22 }}>
          {LOADING_MSGS[msgIdx]}
        </div>
        <div style={{ width: "80%", height: 8, border: "1px solid rgba(0,255,234,0.3)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "linear-gradient(90deg,#00FFEA,#FF00FF,#FFE500)", transition: "width 0.1s linear", boxShadow: "0 0 6px #00FFEA" }} />
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#00FFEA" }}>{Math.min(Math.round(pct), 100)}%</div>
      </div>
    </MainLayout>
  )
}

// ── Screen 11 · Prompt Result ─────────────────────────────────────────────────

const GENERATED_PROMPT_TEXT =
  "Create a 60-sec viral product launch video for Gen Z creators on TikTok — weird, funny tone ending with a catchphrase."

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  // Fallback for contexts without the async Clipboard API
  const ta = document.createElement("textarea")
  ta.value = text
  ta.style.position = "fixed"
  ta.style.opacity = "0"
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand("copy")
  } finally {
    document.body.removeChild(ta)
  }
  return Promise.resolve()
}

function PromptResultScreen({
  onBack, onTest, onSave,
}: { onBack: () => void; onTest: () => void; onSave: (p: { title: string; score: number; tag: string; color: string; text: string }) => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")

  const handleCopy = () => {
    copyToClipboard(GENERATED_PROMPT_TEXT).then(() => {
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 1600)
    })
  }

  const handleSave = () => {
    onSave({ title: "Viral Product Launch", score: 87, tag: "VIDEO", color: "#00FFEA", text: GENERATED_PROMPT_TEXT })
    setSaveState("saved")
    setTimeout(() => setSaveState("idle"), 1600)
  }

  return (
    <MainLayout
      sparkSpeech="Your prompt is ready!"
      ctaLabel="▶ TEST PROMPT"
      onCTA={onTest}
      ctaColor="cyan"
      tiles={[
        { icon: "✏️", label: "EDIT", onClick: onBack, color: "#FFE500" },
        copyState === "copied"
          ? { icon: "✅", label: "COPIED!", onClick: handleCopy, color: "#00FFEA" }
          : { icon: "📋", label: "COPY", onClick: handleCopy, color: "#00FFEA" },
        saveState === "saved"
          ? { icon: "✅", label: "SAVED!", onClick: handleSave, color: "#FF00FF" }
          : { icon: "💾", label: "SAVE", onClick: handleSave, color: "#FF00FF" },
      ]}
    >
      <div className="absolute inset-0 p-2 flex flex-col gap-2">
        <button onClick={onBack} className="self-start px-2 py-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#00FFEA", border: "1px solid #00FFEA40" }}>◀ BACK</button>
        {/* Score + bars */}
        <div className="flex items-center gap-3">
          <ScoreRing score={87} />
          <div className="flex-1 space-y-1.5">
            {[
              { label: "CLARITY", val: 92, color: "#00FFEA" },
              { label: "SPECIFIC", val: 85, color: "#FFE500" },
              { label: "CREATIVE", val: 78, color: "#FF00FF" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5 }}>
                  <span style={{ color }}>{label}</span><span style={{ color }}>{val}</span>
                </div>
                <div style={{ height: 4, background: "#111", overflow: "hidden" }}>
                  <div style={{ width: `${val}%`, height: "100%", background: color, boxShadow: `0 0 4px ${color}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Prompt text */}
        <div className="flex-1 p-2" style={{ border: "1px solid rgba(0,255,234,0.3)", background: "rgba(0,0,0,0.5)", overflow: "auto", scrollbarWidth: "none" }}>
          <TvLabel text="GENERATED PROMPT:" color="rgba(0,255,234,0.5)" />
          <TvBody text={`"${GENERATED_PROMPT_TEXT}"`} />
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 12 · Prompt Test ───────────────────────────────────────────────────

const TEST_OUTPUT_ORIGINAL = {
  title: '"The Product That Slaps Different 🌀"',
  hook: "A rubber duck in a suit slides in: 'You've been doing it wrong.'",
  build: "Fast cuts, product as chaotic mini-games. Breaks 4th wall ×3.",
  catchphrase: '"It\'s not weird. You\'re just not ready."',
}
const TEST_OUTPUT_WEIRDER = [
  {
    title: '"Your Product But It\'s Sentient Now 🐙"',
    hook: "The product grows tiny legs and just... walks away mid-pitch.",
    build: "Increasingly unhinged cutaways. A backup dancer duck squad appears.",
    catchphrase: '"Normal is a subscription you never signed up for."',
  },
  {
    title: '"We Replaced The Narrator With A Toaster 🍞"',
    hook: "Toast pops out yelling the product name in Comic Sans on-screen.",
    build: "Product floats in zero-g while jazz plays backwards.",
    catchphrase: '"Weird sells. Normal doesn\'t."',
  },
]
const TEST_OUTPUT_IMPROVED = [
  {
    title: '"Meet The Product Gen Z Actually Wants"',
    hook: "Quick cut: real user reaction, genuine surprise, no acting.",
    build: "Clean product shots, on-screen stat callouts, confident pacing.",
    catchphrase: '"Made for how you actually create."',
  },
  {
    title: '"The 3-Second Rule: Why This Hooks Instantly"',
    hook: "Bold on-screen text states the core benefit in the first frame.",
    build: "Before/after comparison, tight editing, trending audio cue.",
    catchphrase: '"See it. Get it. Want it."',
  },
]

function PromptTestScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [output, setOutput] = useState(TEST_OUTPUT_ORIGINAL)
  const [weirderStep, setWeirderStep] = useState(0)
  const [improveStep, setImproveStep] = useState(0)

  const goWeirder = () => {
    setOutput(TEST_OUTPUT_WEIRDER[weirderStep % TEST_OUTPUT_WEIRDER.length])
    setWeirderStep((s) => s + 1)
  }
  const goImprove = () => {
    setOutput(TEST_OUTPUT_IMPROVED[improveStep % TEST_OUTPUT_IMPROVED.length])
    setImproveStep((s) => s + 1)
  }

  return (
    <MainLayout
      sparkSpeech="Let's see what happens!"
      ctaLabel="👍 LIKE IT!"
      onCTA={onContinue}
      ctaColor="green"
      tiles={[
        { icon: "🌀", label: "WEIRDER", onClick: goWeirder, color: "#FF00FF" },
        { icon: "⚙️", label: "IMPROVE", onClick: goImprove, color: "#FFE500" },
        { icon: "◀", label: "BACK", onClick: onBack, color: "#666" },
      ]}
    >
      <div className="absolute inset-0 p-2 flex flex-col gap-2 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <TvLabel text="SIMULATED OUTPUT:" color="#FFE500" />
        {[
          { label: "TITLE", value: output.title },
          { label: "HOOK (0-3s)", value: output.hook },
          { label: "BUILD (3-50s)", value: output.build },
          { label: "CATCHPHRASE", value: output.catchphrase },
        ].map(({ label, value }) => (
          <div key={label} className="p-1.5" style={{ borderLeft: "2px solid rgba(0,255,234,0.4)", paddingLeft: 6 }}>
            <TvLabel text={label} color="rgba(0,255,234,0.6)" />
            <TvBody text={value} />
          </div>
        ))}
      </div>
    </MainLayout>
  )
}

// ── Screen 13 · Mission Complete ──────────────────────────────────────────────

function MissionCompleteScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <MainLayout sparkSpeech="You did it! Amazing!" ctaLabel="CONTINUE JOURNEY →" onCTA={onContinue} ctaColor="yellow">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2" style={{ background: "radial-gradient(ellipse at 50% 30%,rgba(255,229,0,0.1) 0%,transparent 70%)" }}>
        <DrSpark size={72} />
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: "#FFE500", textAlign: "center", textShadow: "0 0 20px #FFE500", animation: "glow 1.2s ease-in-out infinite alternate", lineHeight: 1.6 }}>
          MISSION<br />COMPLETE!
        </div>
        <div className="w-full space-y-1.5">
          {[
            { icon: "⭐", label: "+250 XP EARNED", color: "#FFE500" },
            { icon: "🏅", label: "SPARK BADGE UNLOCKED", color: "#FF00FF" },
            { icon: "◈", label: "ETHERVILLE CLEARED", color: "#00FFEA" },
          ].map(({ icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 p-1.5" style={{ border: `1px solid ${color}45`, background: `${color}0d` }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color, textShadow: `0 0 5px ${color}` }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 14 · World Map ─────────────────────────────────────────────────────

function WorldMapScreen({ onNav }: { onNav: (t: string) => void }) {
  const nodes = [
    { name: "GLITCH GROVE", x: 20, y: 68, status: "completed" as const, icon: "🌲" },
    { name: "ETHERVILLE", x: 36, y: 46, status: "active" as const, icon: "🏙️" },
    { name: "PIXEL PEAKS", x: 63, y: 28, status: "locked" as const, icon: "⛰️" },
    { name: "DATA DUNES", x: 74, y: 63, status: "locked" as const, icon: "🏜️" },
    { name: "NEON NEXUS", x: 52, y: 76, status: "locked" as const, icon: "🌆" },
  ]
  const sc = { active: "#FFE500", locked: "#2a2a2a", completed: "#00FFEA" }
  return (
    <MainLayout
      sparkSpeech="Choose your adventure!"
      ctaLabel="ENTER ETHERVILLE"
      onCTA={() => onNav("destination")}
      ctaColor="yellow"
      tiles={[
        { icon: "🏠", label: "HOME", onClick: () => onNav("home"), color: "#FFD700" },
        { icon: "⚗️", label: "IDEA LAB", onClick: () => onNav("lab"), color: "#AA44FF" },
        { icon: "◧", label: "BANK", onClick: () => onNav("bank"), color: "#00FFEA" },
      ]}
      activeTab="map"
      onTab={onNav}
    >
      {/* Full claymation map */}
      <ImageWithFallback src={claymationMap} alt="Weirdverse world map" className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", objectPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "rgba(0,4,0,0.3)" }} />
      {/* SVG connector lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
        <line x1="20%" y1="68%" x2="36%" y2="46%" stroke="#00FFEA" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="36%" y1="46%" x2="63%" y2="28%" stroke="#FFE500" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
      {/* Mission nodes */}
      {nodes.map((n) => (
        <button
          key={n.name}
          className="absolute flex flex-col items-center gap-0.5"
          style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)" }}
          onClick={() => n.status !== "locked" && onNav("destination")}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: "50%",
              border: `2px solid ${sc[n.status]}`,
              background: n.status === "locked" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.55)",
              boxShadow: n.status === "locked" ? "none" : `0 0 12px ${sc[n.status]}80`,
              opacity: n.status === "locked" ? 0.4 : 1,
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(2px)",
            }}
          >
            {n.status === "locked" ? "🔒" : n.icon}
          </div>
          <span style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 4, color: sc[n.status],
            whiteSpace: "nowrap", textShadow: "0 1px 3px #000",
            opacity: n.status === "locked" ? 0.4 : 1,
          }}>
            {n.name}
          </span>
        </button>
      ))}
    </MainLayout>
  )
}

// ── Screen 15 · Prompt Bank ───────────────────────────────────────────────────

function PromptBankScreen({ onNav, savedPrompts = [] }: { onNav: (t: string) => void; savedPrompts?: Array<{ id: string; title: string; score: number; tag: string; color: string; text: string }> }) {
  const [tab, setTab] = useState<"completed" | "drafts" | "favorites">("completed")
  const [query, setQuery] = useState("")
  const mockPrompts = [
    { id: "mock-1", title: "Creator Hook Formula", score: 92, tag: "POST", color: "#FFE500" },
    { id: "mock-2", title: "App Onboarding Flow", score: 74, tag: "APP", color: "#FF00FF" },
  ]
  const allPrompts = tab === "completed" ? [...savedPrompts, ...mockPrompts] : mockPrompts
  const q = query.trim().toLowerCase()
  const visiblePrompts = q
    ? allPrompts.filter((p) => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q))
    : allPrompts

  return (
    <MainLayout
      sparkSpeech="Your saved gems!"
      ctaLabel="+ NEW PROMPT"
      onCTA={() => onNav("rough-idea")}
      ctaColor="cyan"
      activeTab="bank"
      onTab={onNav}
    >
      <div className="absolute inset-0 flex flex-col p-2 gap-1.5">
        {/* Search */}
        <div className="flex items-center gap-1.5 px-2 py-1" style={{ border: "1px solid rgba(0,255,234,0.3)" }}>
          <span style={{ color: "rgba(0,255,234,0.5)", fontSize: 12 }}>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#00FFEA" }}
          />
        </div>
        {/* Tabs */}
        <div className="flex gap-1">
          {(["completed", "drafts", "favorites"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "3px 0",
              fontFamily: "'Press Start 2P', monospace", fontSize: 5,
              border: `1px solid ${tab === t ? "#00FFEA" : "#222"}`,
              color: tab === t ? "#00FFEA" : "#444",
              background: tab === t ? "rgba(0,255,234,0.1)" : "transparent",
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Prompt cards */}
        <div className="flex-1 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: "none" }}>
          {visiblePrompts.length === 0 && (
            <div className="text-center py-4">
              <TvBody text="No prompts match yet." color="#555" />
            </div>
          )}
          {visiblePrompts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2" style={{ border: `1px solid ${p.color}35`, background: `${p.color}08` }}>
              <div>
                <TvLabel text={p.title} color={p.color} />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: "#555" }}>{p.tag}</span>
              </div>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: p.color, border: `1px solid ${p.color}50`, padding: "2px 5px" }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 16 · Idea Lab ──────────────────────────────────────────────────────

function IdeaLabScreen({ onNav }: { onNav: (t: string) => void }) {
  const exps = [
    { icon: "💡", label: "NEW IDEA", color: "#00FFEA", to: "rough-idea" },
    { icon: "🎲", label: "RANDOM", color: "#FFE500", to: "destination" },
    { icon: "🔀", label: "COMBINE", color: "#FF00FF", to: "bank" },
    { icon: "✨", label: "SURPRISE", color: "#AA44FF", to: "generating" },
  ]
  return (
    <MainLayout
      sparkSpeech="Let's experiment!"
      ctaLabel="⚗️ START EXPERIMENT"
      onCTA={() => onNav("rough-idea")}
      ctaColor="magenta"
      activeTab="create"
      onTab={onNav}
    >
      <div className="absolute inset-0 p-2 flex flex-col gap-2">
        <div className="flex-none text-center">
          <TvLabel text="DR. SPARK'S LAB" color="#AA44FF" />
          <TvBody text={'"The best ideas start as terrible ones."'} color="#777" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 flex-1">
          {exps.map((e) => (
            <button
              key={e.label}
              onClick={() => e.to && onNav(e.to)}
              className="flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ border: `2px solid ${e.color}50`, borderRadius: 6, background: `${e.color}0d` }}
            >
              <span style={{ fontSize: 26 }}>{e.icon}</span>
              <TvLabel text={e.label} color={e.color} />
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

// ── Screen 17 · Profile ───────────────────────────────────────────────────────

function ProfileScreen({ onNav }: { onNav: (t: string) => void }) {
  return (
    <MainLayout sparkSpeech="Looking good, wizard!" activeTab="profile" onTab={onNav}>
      <div className="absolute inset-0 p-2 flex flex-col gap-2 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Player card */}
        <div className="flex items-center gap-2 p-2" style={{ border: "1px solid rgba(255,0,255,0.4)", background: "rgba(255,0,255,0.05)" }}>
          <DrSpark size={48} />
          <div className="flex-1">
            <TvLabel text="IDEA_WIZARD" color="white" />
            <div className="flex gap-1.5 mt-1">
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#FFD700", border: "1px solid rgba(255,215,0,0.5)", padding: "1px 4px" }}>LVL 3</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#666" }}>SPARK CADET</span>
            </div>
            <TvBody text="1,240 / 2,000 XP" color="#666" />
          </div>
        </div>
        {/* XP bar */}
        <div style={{ height: 7, border: "1px solid rgba(255,215,0,0.3)", overflow: "hidden" }}>
          <div style={{ width: "62%", height: "100%", background: "linear-gradient(90deg,#FFD700,#FF00FF)" }} />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { icon: "🔥", label: "STREAK", val: "7D", color: "#FF00FF" },
            { icon: "⚡", label: "PROMPTS", val: "24", color: "#00FFEA" },
            { icon: "◈", label: "MISSIONS", val: "3", color: "#FFE500" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} className="text-center py-2" style={{ border: `1px solid ${color}35`, background: `${color}08` }}>
              <div style={{ fontSize: 16 }}>{icon}</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color, textShadow: `0 0 5px ${color}` }}>{val}</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: "#555", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Badges */}
        <TvLabel text="BADGES" color="rgba(0,255,234,0.5)" />
        <div className="flex gap-1.5 flex-wrap">
          {["⚡", "🎬", "🏅", "🌟", "🔮", "◈"].map((b, i) => (
            <div key={i} style={{ width: 36, height: 36, border: "1px solid rgba(255,215,0,0.35)", background: "#100e00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{b}</div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

// ── Overlays ──────────────────────────────────────────────────────────────────

function HintOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full p-5 space-y-4" style={{ borderTop: "2px solid #FFD700", background: "#080808", boxShadow: "0 -12px 40px rgba(255,215,0,0.15)" }}>
        <div className="text-center" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#FFD700", textShadow: "0 0 8px #FFD700" }}>💡 PROMPT HINT</div>
        {[
          { icon: "◎", color: "#00FFEA", label: "GOAL", desc: "WHAT you want to create — video, post, idea?" },
          { icon: "◉", color: "#FF00FF", label: "AUDIENCE", desc: "WHO it's for — creators, business, fans?" },
          { icon: "◈", color: "#FFE500", label: "TONE", desc: "HOW it should FEEL — funny, weird, cinematic?" },
        ].map(({ icon, color, label, desc }) => (
          <div key={label} className="flex gap-3 items-start">
            <span style={{ fontSize: 18, color, marginTop: 2 }}>{icon}</span>
            <div>
              <TvLabel text={`${label} =`} color={color} />
              <TvBody text={desc} color="#CCC" />
            </div>
          </div>
        ))}
        <PortalCTA label="GOT IT — LET'S BUILD" onClick={onClose} color="yellow" />
      </div>
    </div>
  )
}

function ExampleOverlay({ onUse, onClose }: { onUse: () => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <div className="relative w-full p-4 space-y-3" style={{ border: "2px solid #FF00FF", background: "#0a0005", boxShadow: "0 0 40px rgba(255,0,255,0.25)" }}>
        <div className="text-center" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#FF00FF" }}>EXAMPLE PROMPT</div>
        <div className="p-3" style={{ border: "1px solid rgba(200,0,0,0.4)", background: "rgba(60,0,0,0.3)" }}>
          <TvLabel text="✗ VAGUE" color="#ff6666" />
          <TvBody text={'"Make me a viral video."'} color="#999" />
        </div>
        <div className="text-center" style={{ color: "#555" }}>↓ IMPROVED ↓</div>
        <div className="p-3" style={{ border: "1px solid rgba(0,255,234,0.45)", background: "rgba(0,255,234,0.04)" }}>
          <TvLabel text="✓ WITH GOAL + AUDIENCE + TONE" color="#00FFEA" />
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: "#EEE", lineHeight: 1.5, marginTop: 4 }}>
            {"Create a "}<span style={{ color: "#00FFEA" }}>60-sec product launch video</span>{" for "}<span style={{ color: "#FF00FF" }}>Gen Z on TikTok</span>{" with a "}<span style={{ color: "#FFE500" }}>weird, funny tone</span>{" that ends with a catchphrase."}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PortalCTA label="USE THIS" onClick={onUse} color="cyan" />
          <PortalCTA label="BACK" onClick={onClose} color="magenta" />
        </div>
      </div>
    </div>
  )
}

function LeaveOverlay({ onKeep, onLeave }: { onKeep: () => void; onLeave: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/85" />
      <div className="relative w-full p-5 space-y-4 text-center" style={{ border: "1.5px solid #555", background: "#0d0d0d" }}>
        <DrSpark size={64} />
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "white" }}>LEAVING ALREADY?</div>
        <TvBody text="Progress saved as a draft. Continue from Mission Select later." color="#AAA" />
        <div className="p-2.5" style={{ border: "1px solid rgba(255,215,0,0.35)", background: "#1a1200" }}>
          <TvLabel text="✓ DRAFT AUTO-SAVED" color="#FFD700" />
          <TvBody text='"MAKE ME A VIRAL VIDEO..." · Mission 01' color="#777" />
        </div>
        <div className="space-y-2">
          <PortalCTA label="KEEP BUILDING" onClick={onKeep} color="cyan" />
          <PortalCTA label="SAVE DRAFT & LEAVE" onClick={onLeave} color="magenta" />
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

// On an actual phone the "device mockup" frame below is wider/taller than the
// real viewport, so its rounded corners, fake status bar, and everything
// outside it end up entirely off-screen — the decorative chrome and ambient
// background are only meaningful on a wide (desktop/tablet) viewport.
function useIsCompactViewport() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 480 : false
  )
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)")
    const handler = (e) => setIsCompact(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isCompact
}

export default function App() {
  const isCompact = useIsCompactViewport()
  const [screen, setScreen] = useState<Screen>("intro")
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [goal, setGoal] = useState("")
  const [audience, setAudience] = useState("")
  const [tone, setTone] = useState("")
  const [savedPrompts, setSavedPrompts] = useState([])
  const [musicMuted, setMusicMutedState] = useState(() => getLoFiMusicMuted())
  const toggleMusic = useCallback(() => setMusicMutedState(toggleLoFiMusicMuted()), [])

  const go = useCallback((s: Screen) => { setScreen(s); setOverlay(null) }, [])

  const navTab = useCallback(
    (tab: string) => {
      const m: Partial<Record<string, Screen>> = {
        home: "home", map: "map", create: "lab", bank: "bank",
        profile: "profile", destination: "destination",
        "rough-idea": "rough-idea", generating: "generating", lab: "lab",
      }
      if (m[tab]) go(m[tab]!)
    },
    [go],
  )

  const renderScreen = () => {
    switch (screen) {
      case "intro": return <IntroClipScreen onEnter={() => { startLoFiMusic(); go("splash") }} />
      case "splash": return <SplashScreen onNext={() => go("welcome")} />
      case "welcome": return <WelcomeScreen onNext={() => go("home")} />
      case "home": return <HomeScreen onNav={navTab} onEnter={() => go("destination")} />
      case "destination": return <DestinationScreen onBack={() => go("home")} onStart={() => go("rough-idea")} />
      case "rough-idea": return <RoughIdeaScreen onBack={() => go("destination")} onBuild={() => go("goal")} onOverlay={(o) => setOverlay(o)} />
      case "goal": return <GoalScreen onBack={() => go("rough-idea")} onSelect={(g) => { setGoal(g); go("audience") }} />
      case "audience": return <AudienceScreen onBack={() => go("goal")} onSelect={(a) => { setAudience(a); go("tone") }} />
      case "tone": return <ToneScreen onBack={() => go("audience")} onSelect={(t) => { setTone(t); go("assembly") }} />
      case "assembly": return <PromptAssemblyScreen goal={goal} audience={audience} tone={tone} onBack={() => go("tone")} onBuild={() => go("generating")} />
      case "generating": return <GeneratingScreen onDone={() => go("result")} />
      case "result": return (
        <PromptResultScreen
          onBack={() => go("assembly")}
          onTest={() => go("test")}
          onSave={(p) => setSavedPrompts((prev) => [{ ...p, id: `${Date.now()}-${prev.length}` }, ...prev])}
        />
      )
      case "test": return <PromptTestScreen onBack={() => go("result")} onContinue={() => go("complete")} />
      case "complete": return <MissionCompleteScreen onContinue={() => go("home")} />
      case "map": return <WorldMapScreen onNav={navTab} />
      case "bank": return <PromptBankScreen onNav={navTab} savedPrompts={savedPrompts} />
      case "lab": return <IdeaLabScreen onNav={navTab} />
      case "profile": return <ProfileScreen onNav={navTab} />
    }
  }

  return (
    <MusicContext.Provider value={{ muted: musicMuted, toggle: toggleMusic }}>
    <div
      className={isCompact ? "" : "min-h-screen flex items-center justify-center p-4"}
      style={{ background: isCompact ? "#000" : "radial-gradient(ellipse at 50% 40%,#0a0018 0%,#000 80%)" }}
    >
      {/* Claymation background for the whole app — visible edge-to-edge on
          mobile and behind the device mockup on desktop, both at 80% opacity */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <img
          src={appBackground}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.8 }}
        />
      </div>

      {/* Decorative starfield — only makes sense on a wide viewport where the
          device mockup doesn't already fill the screen. */}
      {!isCompact && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {STARS.slice(0, 35).map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: 1, height: 1, left: `${s.x}%`, top: `${s.y}%`, opacity: 0.18 }} />
          ))}
        </div>
      )}

      {/* iPhone 15 Pro frame (desktop) / edge-to-edge app shell (mobile) */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={isCompact ? {
          width: "100%", height: "100dvh", minHeight: "100vh",
          background: "transparent",
        } : {
          width: 393, height: 852,
          background: "#000",
          borderRadius: 50,
          border: "2px solid #2a2a3a",
          boxShadow: "0 0 0 1px #1a1a2a,0 0 80px rgba(0,200,255,0.07),0 60px 140px rgba(0,0,0,0.9)",
        }}
      >
        {!isCompact && (
          <>
            {/* Dynamic island */}
            <div className="absolute z-50" style={{ top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 34, background: "#000", borderRadius: 20, border: "1px solid #222" }} />

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-14 flex items-end justify-between px-6 pb-1.5 z-40">
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#FFD700" }}>9:41</span>
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-0.5">
                  {[3, 4, 6, 8].map((h, i) => <div key={i} style={{ width: 3, height: h, background: "#FFD700", borderRadius: 1, opacity: i === 3 ? 0.35 : 1 }} />)}
                </div>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#FFD700" }}>WiFi</span>
                <div className="flex items-center gap-0.5" style={{ border: "1px solid rgba(255,215,0,0.6)", borderRadius: 3, padding: "1px 2px" }}>
                  <div style={{ width: 14, height: 8, background: "#FFD700", borderRadius: 1 }} />
                  <div style={{ width: 3, height: 5, borderRadius: 1, border: "1px solid rgba(255,215,0,0.4)" }} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{ paddingTop: isCompact ? "env(safe-area-inset-top)" : 56, background: isCompact ? "transparent" : "#000" }}
        >
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {renderScreen()}
            {overlay === "hint" && <HintOverlay onClose={() => setOverlay(null)} />}
            {overlay === "example" && <ExampleOverlay onUse={() => { setOverlay(null); go("goal") }} onClose={() => setOverlay(null)} />}
            {overlay === "leave" && <LeaveOverlay onKeep={() => setOverlay(null)} onLeave={() => { setOverlay(null); go("home") }} />}
          </div>
        </div>

        {/* Corner mask */}
        {!isCompact && (
          <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: 50, boxShadow: "inset 0 0 0 2px #000" }} />
        )}
      </div>

      {/* Hint below phone (desktop only) */}
      {!isCompact && (
        <div className="absolute" style={{ bottom: 20, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "rgba(255,215,0,0.3)" }}>
            TAP TILES & BUTTONS TO NAVIGATE THE PROTOTYPE
          </span>
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes twinkle {
          0%,100%{opacity:0.12;transform:scale(1);}
          50%{opacity:0.9;transform:scale(1.6);}
        }
        @keyframes spin {
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }
        @keyframes portalPulse {
          0%,100%{opacity:0.75;transform:scale(1);}
          50%{opacity:1;transform:scale(1.1);}
        }
        @keyframes blink {
          0%,100%{opacity:1;}
          50%{opacity:0.1;}
        }
        @keyframes glow {
          from{text-shadow:0 0 10px #FFE500,0 0 20px #FFE500;}
          to{text-shadow:0 0 22px #FFE500,0 0 55px #FFE500,0 0 90px #FFE500;}
        }
        @keyframes ping {
          0%{transform:scale(1);opacity:0.5;}
          100%{transform:scale(2.4);opacity:0;}
        }
        ::-webkit-scrollbar{display:none;}
        *{-webkit-tap-highlight-color:transparent;}
      `}</style>
    </div>
    </MusicContext.Provider>
  )
}
