"use client";
// @ts-nocheck
import { useEffect, useRef, useState } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };

// @ts-ignore Framer resolves this module at runtime
import PixelImage from "./PixelImage"
const ivVars = (o: any) => { const v: any = {}; for (const k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== "") v[k] = o[k]; return v }
const FONT = 'var(--ivFont,"Inter Variable","Inter","Inter Placeholder",system-ui,sans-serif)'
const STOCK = ["https://images.unsplash.com/photo-1678740386174-5b267bbf258b?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1688306141976-0a8ef8c3f585?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1761937841713-6b43e3f50efa?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1760426392296-9abd7fc8cab0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1756679206737-dafa3370e0b2?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1767926189999-4f9550c88247?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1764193875912-0f0a64874344?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1731870692027-d9b72b4931bd?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1698490275678-518f3b591f0c?auto=format&fit=crop&w=1400&q=70"]
const GUT = "clamp(20px,3.4vw,40px)"
const live = () => RenderTarget.current() !== RenderTarget.canvas && RenderTarget.current() !== RenderTarget.thumbnail && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
function useReveal(ref: any, stagger = 90) { useEffect(() => { const el = ref.current; if (!el || !live()) return; const items = Array.from(el.querySelectorAll("[data-rise]")) as HTMLElement[]; items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(34px)" }); const io = new IntersectionObserver((e) => { e.forEach((x) => { if (!x.isIntersecting) return; io.unobserve(x.target); const n = x.target as HTMLElement, i = items.indexOf(n) % 4; n.style.transition = "opacity .8s ease " + i * stagger + "ms, transform .9s cubic-bezier(.22,1,.36,1) " + i * stagger + "ms"; n.style.opacity = "1"; n.style.transform = "none" }) }, { threshold: 0.12 }); items.forEach((n) => io.observe(n)); return () => io.disconnect() }, []) }

const POINTS = "Point one, Point two, Point three"
interface Props { [key: string]: any; label?: string; title?: string; text?: string; points?: string; photo?: number; image?: any; effect?: string; reverse?: boolean; fill?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SplitFeature({ ivText, ivMuted, ivLine, ivFontPick, ivScale, ivBright, label = "Label", title = "Feature title", text = "Feature text.", points = POINTS, photo = 0, image, effect = "slats", reverse = false, fill = "#0f1012", accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null), pic = useRef<HTMLDivElement>(null); useReveal(root, 110)
    useEffect(() => { const el = root.current, p = pic.current; if (!el || !p || !live()) return; let raf = 0; const run = () => { raf = 0; const r = el.getBoundingClientRect(), q = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; p.style.transform = "translate3d(0," + (q * -46).toFixed(1) + "px,0) scale(1.14)" }; const on = () => { if (!raf) raf = requestAnimationFrame(run) }; run(); window.addEventListener("scroll", on, { passive: true }); return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf) } }, [])
    return <section ref={root} style={{ width: "100%", boxSizing: "border-box", background: fill, padding: "clamp(64px,8vw,110px) " + GUT, display: "flex", flexWrap: "wrap", flexDirection: reverse ? "row-reverse" : "row", gap: "clamp(32px,5vw,72px)", alignItems: "center", fontFamily: FONT, ...ivVars({ "--ivText": ivText, "--ivMuted": ivMuted, "--ivLine": ivLine, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div style={{ flex: "1 1 340px", minWidth: 0, height: "clamp(320px,48vw,640px)", overflow: "hidden", borderRadius: 3 }}><div ref={pic} style={{ width: "100%", height: "100%", willChange: "transform" }}><PixelImage effect={effect} src={image?.src || STOCK[photo % STOCK.length]} srcSet={image?.srcSet} alt={image?.alt || title} style={{ width: "100%", height: "100%" }} imgStyle={{ filter: "saturate(.85) contrast(1.05) brightness(var(--ivBright,.84))" }} /></div></div>
        <div style={{ flex: "1 1 340px", minWidth: 0 }}>
            <div data-rise style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: accent, marginBottom: 14 }}>{label}</div>
            <h2 data-rise style={{ margin: "0 0 18px", fontSize: "calc(clamp(32px,4.4vw,60px) * var(--ivScale,1))", lineHeight: 1.04, fontWeight: 600, letterSpacing: "-.033em", color: "var(--ivText,#f4f2ec)" }}>{title}</h2>
            <p data-rise style={{ margin: "0 0 24px", fontSize: 18, lineHeight: 1.5, color: "var(--ivMuted,#a9a79f)", maxWidth: 560 }}>{text}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{points.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => <li key={i} data-rise style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderTop: "1px solid var(--ivLine,#2e2e30)", fontSize: 17, fontWeight: 500, color: "var(--ivText,#f4f2ec)" }}><span aria-hidden style={{ width: 9, height: 9, background: accent, flex: "none" }} />{s}</li>)}</ul>
        </div>
    </section>
}
