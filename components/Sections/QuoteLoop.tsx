"use client";
// @ts-nocheck
import { useEffect, useRef, useState } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };

const ivVars = (o: any) => { const v: any = {}; for (const k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== "") v[k] = o[k]; return v }
const FONT = 'var(--ivFont,"Inter Variable","Inter","Inter Placeholder",system-ui,sans-serif)'
const STOCK = ["https://images.unsplash.com/photo-1678740386174-5b267bbf258b?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1688306141976-0a8ef8c3f585?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1761937841713-6b43e3f50efa?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1760426392296-9abd7fc8cab0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1756679206737-dafa3370e0b2?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1767926189999-4f9550c88247?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1764193875912-0f0a64874344?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1731870692027-d9b72b4931bd?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1698490275678-518f3b591f0c?auto=format&fit=crop&w=1400&q=70"]
const GUT = "clamp(20px,3.4vw,40px)"
const live = () => RenderTarget.current() !== RenderTarget.canvas && RenderTarget.current() !== RenderTarget.thumbnail && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
function useReveal(ref: any, stagger = 90) { useEffect(() => { const el = ref.current; if (!el || !live()) return; const items = Array.from(el.querySelectorAll("[data-rise]")) as HTMLElement[]; items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(34px)" }); const io = new IntersectionObserver((e) => { e.forEach((x) => { if (!x.isIntersecting) return; io.unobserve(x.target); const n = x.target as HTMLElement, i = items.indexOf(n) % 4; n.style.transition = "opacity .8s ease " + i * stagger + "ms, transform .9s cubic-bezier(.22,1,.36,1) " + i * stagger + "ms"; n.style.opacity = "1"; n.style.transform = "none" }) }, { threshold: 0.12 }); items.forEach((n) => io.observe(n)); return () => io.disconnect() }, []) }

const DEF = [{ quote: "The team kept the programme visible from the first week to the final walk-through.", name: "Maya Ortiz", role: "Development Director, Halcyon Estates" }, { quote: "Every question got a straight answer, and every change was priced before it was built.", name: "Daniel Reeve", role: "Founder, Northbank Living" }, { quote: "They handed over a building that worked on day one, along with the paperwork to prove it.", name: "Priya Nair", role: "Asset Manager, Kestrel Property" }]
const BG = [STOCK[0], STOCK[1], STOCK[7]]
interface Props { [key: string]: any; images?: any[]; items?: any[]; seconds?: number; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function QuoteLoop({ ivBg, ivText, ivMuted, ivTrack, ivFontPick, ivScale, ivBright, images = [], items = DEF, seconds = 6, accent = "#ffc400", style }: Props) {
    const [n, setN] = useState(0)
    useEffect(() => { if (!live()) return; const id = setInterval(() => setN((v) => (document.hidden ? v : (v + 1) % items.length)), seconds * 1000); return () => clearInterval(id) }, [items.length, seconds])
    return <div style={{ width: "100%", boxSizing: "border-box", background: "var(--ivBg,#17181b)", position: "relative", overflow: "hidden", padding: "clamp(84px,11vw,170px) " + GUT, fontFamily: FONT, ...ivVars({ "--ivBg": ivBg, "--ivText": ivText, "--ivMuted": ivMuted, "--ivTrack": ivTrack, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        {items.map((_, i) => <img key={i} src={images[i]?.src || BG[i % BG.length]} alt="" aria-hidden loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === n ? 0.34 : 0, transform: i === n ? "scale(1.08)" : "scale(1)", transition: "opacity 1.4s ease, transform " + (seconds + 2) + "s linear" }} />)}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(15,16,18,.92),rgba(15,16,18,.42))" }} />
        <div style={{ position: "relative", width: "100%", display: "grid" }}>
            {items.map((q, i) => <figure key={i} aria-hidden={i !== n} style={{ gridArea: "1/1", margin: 0, opacity: i === n ? 1 : 0, transform: i === n ? "translateY(0)" : "translateY(14px)", transition: "opacity .7s ease, transform .7s cubic-bezier(.22,1,.36,1)" }}><blockquote style={{ margin: 0, fontSize: "calc(clamp(27px,4.4vw,72px) * var(--ivScale,1))", maxWidth: "24ch", lineHeight: 1.14, fontWeight: 500, letterSpacing: "-.025em", color: "var(--ivText,#f4f2ec)" }}>{q.quote}</blockquote><figcaption style={{ marginTop: 26, fontSize: 15, color: "var(--ivMuted,#a9a79f)" }}><strong style={{ color: accent, fontWeight: 600 }}>{q.name}</strong>, {q.role}</figcaption></figure>)}
            <div style={{ display: "flex", gap: 8, marginTop: 30 }}>{items.map((_, i) => <button key={i} aria-label={"Show quote " + (i + 1)} onClick={() => setN(i)} style={{ width: 34, height: 24, padding: 0, border: 0, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}><span style={{ width: "100%", height: 3, background: i === n ? accent : "var(--ivTrack,#3a3a3c)", transition: "background .3s" }} /></button>)}</div>
        </div>
    </div>
}
