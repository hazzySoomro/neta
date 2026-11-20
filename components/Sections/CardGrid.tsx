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

const DEF = [{ title: "Card title", text: "Card text." }]
const FX = ["zoom", "wipe", "iris", "slats", "wipeSide", "pixel"]
function Card({ it, i, start, accent }: any) {
    const [on, setOn] = useState(false), box = useRef<HTMLElement>(null), glow = useRef<HTMLDivElement>(null)
    const move = (e: any) => { const el = box.current, g = glow.current; if (!el || !g || e.pointerType !== "mouse") return; const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; g.style.background = "radial-gradient(340px circle at " + x + "px " + y + "px,rgba(255,196,0,.17),transparent 70%)"; el.style.transform = "perspective(1100px) rotateX(" + ((0.5 - y / r.height) * 3.4).toFixed(2) + "deg) rotateY(" + ((x / r.width - 0.5) * 3.4).toFixed(2) + "deg) translateY(-4px)" }
    const leave = () => { setOn(false); if (box.current) box.current.style.transform = "none" }
    return <article ref={box as any} data-rise onPointerMove={move} onMouseEnter={() => setOn(true)} onMouseLeave={leave} style={{ position: "relative", background: on ? "var(--ivCardHover,#212226)" : "var(--ivCard,#1a1b1e)", overflow: "hidden", borderRadius: 3, transition: "background .3s ease", boxShadow: on ? "0 24px 60px rgba(0,0,0,.42)" : "none" }}>
        <div ref={glow} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", opacity: on ? 1 : 0, transition: "opacity .3s ease" }} />
        <div style={{ overflow: "hidden", aspectRatio: "4/3" }}><div style={{ width: "100%", height: "100%", transform: on ? "scale(1.07)" : "scale(1)", transition: "transform .9s cubic-bezier(.22,1,.36,1)" }}><PixelImage effect={FX[(i + start) % FX.length]} src={it.image?.src || STOCK[(start + i) % STOCK.length]} srcSet={it.image?.srcSet} alt={it.title} style={{ width: "100%", height: "100%" }} imgStyle={{ filter: "saturate(.85) contrast(1.05) brightness(var(--ivBright,.86))" }} /></div></div>
        <div style={{ height: 3, background: accent, transform: on ? "scaleX(1)" : "scaleX(.14)", transformOrigin: "0 50%", transition: "transform .6s cubic-bezier(.22,1,.36,1)" }} />
        <div style={{ padding: "22px 22px 26px" }}>{it.tag ? <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>{it.tag}</div> : null}<h3 style={{ margin: "0 0 8px", fontSize: "clamp(21px,2vw,27px)", lineHeight: 1.15, fontWeight: 600, letterSpacing: "-.02em", color: "var(--ivText,#f4f2ec)" }}>{it.title}</h3><p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: "var(--ivMuted,#a9a79f)" }}>{it.text}</p></div>
    </article>
}
interface Props { [key: string]: any; label?: string; title?: string; items?: any[]; start?: number; min?: number; fill?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CardGrid({ ivText, ivMuted, ivCard, ivCardHover, ivFontPick, ivScale, ivBright, label = "", title = "Section title", items = DEF, start = 0, min = 280, fill = "#131416", accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null); useReveal(root)
    return <section ref={root} style={{ width: "100%", boxSizing: "border-box", background: fill, padding: "clamp(64px,8vw,110px) " + GUT, fontFamily: FONT, ...ivVars({ "--ivText": ivText, "--ivMuted": ivMuted, "--ivCard": ivCard, "--ivCardHover": ivCardHover, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        {label ? <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>{label}</div> : null}
        <h2 data-rise style={{ margin: "0 0 clamp(28px,4vw,48px)", fontSize: "calc(clamp(34px,5vw,68px) * var(--ivScale,1))", lineHeight: 1.03, fontWeight: 600, letterSpacing: "-.035em", color: "var(--ivText,#f4f2ec)" }}>{title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(" + min + "px,100%),1fr))", gap: 16 }}>{items.map((it, i) => <Card key={i} it={it} i={i} start={start} accent={accent} />)}</div>
    </section>
}
