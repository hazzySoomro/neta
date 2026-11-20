"use client";
// @ts-nocheck
import { useEffect, useRef, useState } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };

// @ts-ignore Framer resolves this module at runtime
import PixelImage from "./PixelImage"
const ivVars = (o: any) => { const v: any = {}; for (const k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== "") v[k] = o[k]; return v }
const FONT = 'var(--ivFont,"Inter Variable","Inter","Inter Placeholder",system-ui,sans-serif)'
const staticMode = () => RenderTarget.current() === RenderTarget.canvas || RenderTarget.current() === RenderTarget.thumbnail
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))

const DEF = [{ title: "Harbour Exchange", meta: "Commercial, Harbour District", kind: 0 }, { title: "Linden Courtyards", meta: "Residential, Linden Park", kind: 1 }, { title: "North Dock Hall", meta: "Industrial, North Dock", kind: 2 }, { title: "Twin Quay", meta: "Mixed use, Old Quay", kind: 3 }, { title: "Foundry Lofts", meta: "Refurbishment, Foundry Quarter", kind: 4 }]
const FX = ["pixel", "wipe", "slats", "iris", "zoom"]
const PHOTOS = ["https://images.unsplash.com/photo-1678740386174-5b267bbf258b?auto=format&fit=crop&w=900&q=70","https://images.unsplash.com/photo-1688306141976-0a8ef8c3f585?auto=format&fit=crop&w=900&q=70","https://images.unsplash.com/photo-1761937841713-6b43e3f50efa?auto=format&fit=crop&w=900&q=70","https://images.unsplash.com/photo-1760426392296-9abd7fc8cab0?auto=format&fit=crop&w=900&q=70","https://images.unsplash.com/photo-1756679206737-dafa3370e0b2?auto=format&fit=crop&w=900&q=70"]
function Card({ p, accent, i }: any) {
    const box = useRef<HTMLDivElement>(null)
    useEffect(() => { if (!staticMode() && box.current && box.current.animate) { const a = box.current.animate([{ transform: "scale(1.02)" }, { transform: "scale(1.12) translateY(-1.5%)" }], { duration: 15000 + i * 1800, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); return () => a.cancel() } }, [p.image?.src, p.kind])
    return <article style={{ flex: "0 0 clamp(270px,36vw,500px)", height: "100%", position: "relative", overflow: "hidden", borderRadius: 4, background: "#141c24" }}>
        <div ref={box} style={{ position: "absolute", inset: 0, willChange: "transform" }}><PixelImage effect={FX[i % FX.length]} src={p.image?.src || PHOTOS[i % PHOTOS.length]} srcSet={p.image?.srcSet} alt={p.image?.alt || p.title} eager={i < 2} style={{ width: "100%", height: "100%" }} imgStyle={{ filter: "saturate(.85) contrast(1.06) brightness(var(--ivBright,.8))" }} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "70px 22px 22px", background: "linear-gradient(180deg,rgba(5,8,12,0),rgba(5,8,12,.9))" }}><div style={{ fontSize: 13, fontWeight: 600, color: accent, marginBottom: 6 }}>{p.meta}</div><div style={{ fontSize: "clamp(23px,2.6vw,32px)", fontWeight: 600, letterSpacing: "-.02em", color: "var(--ivText,#f4f2ec)" }}>{p.title}</div></div>
    </article>
}
interface Props { [key: string]: any; projects?: any[]; title?: string; note?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ProjectsRail({ ivText, ivMuted, ivLine, ivBg, ivFontPick, ivScale, ivBright, projects = DEF, title = "Selected work", note = "Scroll to explore", accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null), stick = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = root.current, st = stick.current, tr = track.current; if (!el || !st || !tr || staticMode()) return
        if (CSS.supports("height", "100svh")) st.style.height = "100svh"
        let raf = 0
        const run = () => { raf = 0; const r = el.getBoundingClientRect(), p = cl(-r.top / Math.max(1, r.height - st.offsetHeight)), dist = Math.max(0, tr.scrollWidth - st.clientWidth); tr.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)"; if (bar.current) bar.current.style.transform = "scaleX(" + p.toFixed(3) + ")" }
        const on = () => { if (!raf) raf = requestAnimationFrame(run) }
        run(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on); return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf) }
    }, [projects.length])
    return <div ref={root} style={{ position: "relative", width: "100%", height: "340vh", background: "var(--ivBg,#0f1012)", fontFamily: FONT, ...ivVars({ "--ivText": ivText, "--ivMuted": ivMuted, "--ivLine": ivLine, "--ivBg": ivBg, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div ref={stick} style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", gap: "clamp(16px,3vh,28px)", paddingTop: 72, paddingBottom: 26, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, padding: "0 clamp(20px,3.4vw,40px)" }}><h2 style={{ margin: 0, fontSize: "clamp(32px,4.4vw,56px)", fontWeight: 600, letterSpacing: "-.03em", color: "var(--ivText,#f4f2ec)" }}>{title}</h2><span style={{ fontSize: 13, color: "var(--ivMuted,#8f8d85)", whiteSpace: "nowrap" }}>{note}</span></div>
            <div ref={track} style={{ flex: 1, minHeight: 0, display: "flex", gap: "clamp(12px,1.6vw,20px)", padding: "0 clamp(20px,3.4vw,40px)", width: "max-content", willChange: "transform" }}>{projects.map((p, i) => <Card key={i} p={p} i={i} accent={accent} />)}</div>
            <div style={{ margin: "0 clamp(20px,3.4vw,40px)", height: 2, background: "var(--ivLine,#2e2e30)" }}><div ref={bar} style={{ height: "100%", background: accent, transformOrigin: "0 50%", transform: "scaleX(0)" }} /></div>
        </div>
    </div>
}
