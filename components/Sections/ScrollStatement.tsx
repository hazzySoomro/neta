"use client";
// @ts-nocheck
import { useEffect, useRef, useState } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };

const ivVars = (o: any) => { const v: any = {}; for (const k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== "") v[k] = o[k]; return v }
const FONT = 'var(--ivFont,"Inter Variable","Inter","Inter Placeholder",system-ui,sans-serif)'
const staticMode = () => RenderTarget.current() === RenderTarget.canvas || RenderTarget.current() === RenderTarget.thumbnail
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))

const TXT = "Good buildings are not poured in a day. They are planned, measured, checked and checked again, by people who stay until the last snag is closed."
interface Props { [key: string]: any; text?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ScrollStatement({ every = 11, ivBg, ivText, ivFontPick, ivScale, ivBright, text = TXT, accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null), stick = useRef<HTMLDivElement>(null)
    const words = text.split(" ")
    useEffect(() => {
        const el = root.current, st = stick.current; if (!el || !st) return
        const spans = Array.from(st.querySelectorAll("[data-w]")) as HTMLElement[]
        if (staticMode()) { spans.forEach((s, i) => (s.style.opacity = i / spans.length < 0.7 ? "1" : ".16")); return }
        if (CSS.supports("height", "100svh")) st.style.height = "100svh"
        let raf = 0
        const run = () => { raf = 0; const r = el.getBoundingClientRect(), p = cl(-r.top / Math.max(1, r.height - st.offsetHeight)) * 1.15; spans.forEach((s, i) => { s.style.opacity = String(0.14 + 0.86 * cl((p * spans.length - i) / 3)) }) }
        const on = () => { if (!raf) raf = requestAnimationFrame(run) }
        run(); window.addEventListener("scroll", on, { passive: true }); return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf) }
    }, [text])
    return <div ref={root} style={{ position: "relative", width: "100%", height: "240vh", background: "var(--ivBg,#131416)", fontFamily: FONT, ...ivVars({ "--ivBg": ivBg, "--ivText": ivText, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div ref={stick} style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 clamp(20px,3.4vw,40px)", boxSizing: "border-box", overflow: "hidden" }}>
            <p style={{ margin: 0, width: "100%", fontSize: "calc(clamp(32px,5.8vw,118px) * var(--ivScale,1))", lineHeight: 1.08, fontWeight: 600, letterSpacing: "-.035em", color: "var(--ivText,#f4f2ec)" }}>{words.map((w, i) => <span key={i} data-w style={{ opacity: 0.14, color: (every > 0 && i % every === 3 % every) ? accent : undefined }}>{w} </span>)}</p>
        </div>
    </div>
}
