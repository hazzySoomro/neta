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

interface Props { [key: string]: any; title?: string; button?: string; href?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CtaBand({ ivDark, ivText, ivFontPick, ivScale, ivBright, title = "Have a site or a set of drawings?", button = "Get a quote", href = "/contact", accent = "#ffc400", style }: Props) {
    const shine = useRef<HTMLSpanElement>(null), [on, setOn] = useState(false)
    useEffect(() => { if (!shine.current || !live()) return; const a = shine.current.animate([{ transform: "translateX(-140%) skewX(-20deg)" }, { transform: "translateX(320%) skewX(-20deg)" }], { duration: 2800, iterations: Infinity, easing: "ease-in-out" }); return () => a.cancel() }, [])
    return <section style={{ width: "100%", boxSizing: "border-box", background: accent, padding: "clamp(56px,8vw,110px) " + GUT, display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-end", justifyContent: "space-between", fontFamily: FONT, ...ivVars({ "--ivDark": ivDark, "--ivText": ivText, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <h2 style={{ margin: 0, flex: "1 1 320px", fontSize: "calc(clamp(36px,6.6vw,130px) * var(--ivScale,1))", lineHeight: 1, fontWeight: 700, letterSpacing: "-.04em", color: "var(--ivDark,#0f1012)", maxWidth: "20ch" }}>{title}</h2>
        <a href={href} onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)} style={{ position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: on ? 18 : 12, padding: "18px 26px", background: "var(--ivDark,#0f1012)", color: "var(--ivText,#f4f2ec)", fontSize: 16, fontWeight: 700, textDecoration: "none", borderRadius: 2, transition: "gap .3s ease" }}><span ref={shine} aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "35%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)" }} />{button}<span aria-hidden>→</span></a>
    </section>
}
