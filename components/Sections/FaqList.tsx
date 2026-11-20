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

const DEF = [{ q: "What size of project do you take on?", a: "Most of our work runs from single-building refurbishments to ten-storey new builds. If yours sits outside that, we will tell you early." }, { q: "Do you handle design as well as construction?", a: "Yes. We can work from your architect's drawings or bring our design partners in from the start." }, { q: "How do you price a job?", a: "You get a line-by-line cost plan after we review the drawings and walk the site, so you can see where every figure comes from." }, { q: "Which areas do you cover?", a: "Our crews work across the region, and we travel further for larger projects. Ask us about your location." }]
interface Props { [key: string]: any; title?: string; items?: any[]; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function FaqList({ ivBg, ivText, ivMuted, ivLine, ivFontPick, ivScale, ivBright, title = "Common questions", items = DEF, accent = "#ffc400", style }: Props) {
    const [open, setOpen] = useState(0)
    return <div style={{ width: "100%", boxSizing: "border-box", background: "var(--ivBg,#0f1012)", padding: "clamp(64px,9vw,110px) " + GUT, fontFamily: FONT, ...ivVars({ "--ivBg": ivBg, "--ivText": ivText, "--ivMuted": ivMuted, "--ivLine": ivLine, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <h2 style={{ margin: "0 0 36px", fontSize: "calc(clamp(30px,3.4vw,40px) * var(--ivScale,1))", fontWeight: 600, letterSpacing: "-.025em", color: "var(--ivText,#f4f2ec)" }}>{title}</h2>
        {items.map((it, i) => { const on = i === open; return <div key={i} style={{ borderTop: "1px solid var(--ivLine,#2e2e30)" }}><button aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} style={{ all: "unset", cursor: "pointer", display: "flex", width: "100%", boxSizing: "border-box", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "22px 0", fontSize: "clamp(18px,2vw,24px)", fontWeight: 600, letterSpacing: "-.015em", color: "var(--ivText,#f4f2ec)" }}>{it.q}<span aria-hidden style={{ flex: "none", color: accent, fontSize: 26, fontWeight: 400, lineHeight: 1, transform: on ? "rotate(45deg)" : "none", transition: "transform .3s" }}>+</span></button><div style={{ display: "grid", gridTemplateRows: on ? "1fr" : "0fr", transition: "grid-template-rows .35s cubic-bezier(.22,1,.36,1)" }}><div style={{ overflow: "hidden" }}><p style={{ margin: 0, padding: "0 0 24px", maxWidth: 680, fontSize: 17, lineHeight: 1.5, color: "var(--ivMuted,#a9a79f)" }}>{it.a}</p></div></div></div> })}
    </div>
}
