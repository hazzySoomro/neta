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

const DEF = [{ value: 120, suffix: "+", label: "Projects delivered" }, { value: 18, suffix: "", label: "Years on site" }, { value: 96, suffix: "%", label: "Handed over on time" }, { value: 340, suffix: "", label: "People on our teams" }]
const cl = (v: number) => Math.max(0, Math.min(1, v))
interface Props { [key: string]: any; items?: any[]; accent?: string; note?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function StatsCounter({ ivBg, ivText, ivMuted, ivNote, ivFontPick, ivScale, ivBright, items = DEF, accent = "#ffc400", note = "", style }: Props) {
    const root = useRef<HTMLDivElement>(null), nums = useRef<any[]>([])
    useEffect(() => { const el = root.current; if (!el || !live()) return; let raf = 0; const io = new IntersectionObserver((e) => { if (!e[0].isIntersecting) return; io.disconnect(); const s = performance.now(); const tick = (n: number) => { const q = cl((n - s) / 1800), k = 1 - Math.pow(1 - q, 4); items.forEach((it, i) => { if (nums.current[i]) nums.current[i].textContent = Math.round(it.value * k) + (it.suffix || "") }); if (q < 1) raf = requestAnimationFrame(tick) }; raf = requestAnimationFrame(tick) }, { threshold: 0.3 }); io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf) } }, [items])
    return <div ref={root} style={{ width: "100%", boxSizing: "border-box", background: "var(--ivBg,#0f1012)", padding: "clamp(44px,7vw,84px) " + GUT, fontFamily: FONT, ...ivVars({ "--ivBg": ivBg, "--ivText": ivText, "--ivMuted": ivMuted, "--ivNote": ivNote, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "clamp(24px,3vw,32px)" }}>{items.map((it, i) => <div key={i} style={{ borderLeft: "2px solid " + accent, paddingLeft: 18 }}><div ref={(n) => { nums.current[i] = n }} style={{ fontSize: "calc(clamp(40px,5.6vw,72px) * var(--ivScale,1))", fontWeight: 600, letterSpacing: "-.04em", lineHeight: 1, color: "var(--ivText,#f4f2ec)", fontVariantNumeric: "tabular-nums" }}>{it.value}{it.suffix}</div><div style={{ marginTop: 10, fontSize: 15, color: "var(--ivMuted,#a9a79f)" }}>{it.label}</div></div>)}</div>
        {note ? <div style={{ marginTop: 26, fontSize: 12, color: "var(--ivNote,#77756e)" }}>{note}</div> : null}
    </div>
}
