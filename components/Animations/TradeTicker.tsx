"use client";
// @ts-nocheck
import { useEffect, useRef } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };


const ivVars = (o: any) => { const v: any = {}; for (const k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== "") v[k] = o[k]; return v }
interface Props { [key: string]: any; items?: string[]; customText?: string; seconds?: number; reverse?: boolean; color?: string; accent?: string; style?: any }
const DEFAULTS = ["Groundworks", "Concrete frames", "Steelwork", "Curtain walling", "Roofing", "Fit-out", "Refurbishment", "Handover"]
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function TradeTicker({ ivFontPick, ivScale, ivBright, items = DEFAULTS, customText = "", seconds = 36, reverse = false, color = "#f4f2ec", accent = "#ffc400", style }: Props) {
    const track = useRef<HTMLDivElement>(null)
    useEffect(() => { const el = track.current; if (!el || !el.animate || RenderTarget.current() === RenderTarget.canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const a = el.animate([{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(-50%,0,0)" }], { duration: seconds * 1000, iterations: Infinity, direction: reverse ? "reverse" : "normal" }); return () => a.cancel() }, [seconds, reverse])
    const custom = customText.split(",").map((s) => s.trim()).filter(Boolean)
    const list = custom.length ? custom : items.length ? items : DEFAULTS
    const row = (k: string) => list.map((t, i) => <span key={k + i} style={{ display: "inline-flex", alignItems: "center", gap: 34, paddingRight: 34 }}><span style={i % 2 ? { color: "transparent", WebkitTextStroke: "1px " + color } : undefined}>{t}</span><span aria-hidden style={{ width: 8, height: 8, background: accent, transform: "rotate(45deg)" }} /></span>)
    return <div style={{ overflow: "hidden", width: 1200, height: 84, display: "flex", alignItems: "center", color, fontFamily: 'var(--ivFont,"Inter Variable","Inter","Inter Placeholder",system-ui,sans-serif)', fontSize: "clamp(24px,3.4vw,52px)", fontWeight: 600, letterSpacing: "-.02em", whiteSpace: "nowrap", ...ivVars({ "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}><div ref={track} style={{ display: "inline-flex", willChange: "transform" }}>{row("a")}{row("b")}{row("c")}{row("d")}</div></div>
}
