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

interface Props { [key: string]: any; eyebrow?: string; title?: string; text?: string; photo?: number; image?: any; effect?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function PageHero({ ivText, ivSoft, ivBg, ivFontPick, ivScale, ivBright, eyebrow = "About", title = "Page title", text = "", photo = 0, image, effect = "wipe", accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null), bg = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = root.current, b = bg.current; if (!el || !b || !live()) return
        el.querySelectorAll("[data-word]").forEach((w: any, i) => w.animate([{ transform: "translateY(112%)" }, { transform: "translateY(0)" }], { duration: 1000, delay: 180 + i * 70, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }))
        if (bar.current) bar.current.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1200, delay: 300, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" })
        let raf = 0
        const run = () => { raf = 0; const y = Math.max(0, -el.getBoundingClientRect().top); b.style.transform = "translate3d(0," + (y * 0.26).toFixed(1) + "px,0) scale(1.08)" }
        const on = () => { if (!raf) raf = requestAnimationFrame(run) }
        run(); window.addEventListener("scroll", on, { passive: true }); return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf) }
    }, [])
    return <header ref={root} style={{ position: "relative", width: 1200, height: 640, overflow: "hidden", background: "var(--ivBg,#0f1012)", fontFamily: FONT, ...ivVars({ "--ivText": ivText, "--ivSoft": ivSoft, "--ivBg": ivBg, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div ref={bg} style={{ position: "absolute", inset: 0, willChange: "transform" }}><PixelImage effect={effect} eager src={image?.src || STOCK[photo % STOCK.length]} srcSet={image?.srcSet} alt={image?.alt || title} style={{ width: "100%", height: "100%" }} imgStyle={{ filter: "saturate(.8) contrast(1.05) brightness(var(--ivBright,.62))" }} /></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(15,16,18,.25) 0%,rgba(15,16,18,.2) 40%,rgba(15,16,18,.94) 100%)" }} />
        <div style={{ position: "absolute", left: GUT, right: GUT, bottom: "clamp(36px,6vw,72px)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>{eyebrow}</div>
            <h1 style={{ margin: 0, fontSize: "calc(clamp(42px,8.2vw,170px) * var(--ivScale,1))", lineHeight: 1, fontWeight: 700, letterSpacing: "-.04em", color: "var(--ivText,#f4f2ec)", maxWidth: "18ch" }}>{title.split(" ").map((w, i) => <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0 .07em .1em 0", marginRight: ".17em" }}><span data-word style={{ display: "inline-block" }}>{w}</span></span>)}</h1>
            <div ref={bar} style={{ width: "min(320px,50%)", height: 4, background: accent, margin: "22px 0", transformOrigin: "0 50%" }} />
            {text ? <p style={{ margin: 0, maxWidth: 560, fontSize: "clamp(16px,1.6vw,20px)", lineHeight: 1.45, color: "var(--ivSoft,#d2d0c8)" }}>{text}</p> : null}
        </div>
    </header>
}
