"use client";
// @ts-nocheck
import { useEffect, useRef } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };

// @ts-ignore Framer resolves this module at runtime
import PixelImage from "./PixelImage"
const ivVars = (o: any) => { const v: any = {}; for (const k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== "") v[k] = o[k]; return v }
const FONT = 'var(--ivFont,"Inter Variable","Inter","Inter Placeholder",system-ui,sans-serif)'
const FX = ["wipe", "zoom", "slats", "pixel", "iris", "wipeSide"]
const SRC = ["https://images.unsplash.com/photo-1678740386174-5b267bbf258b?auto=format&fit=crop&w=520&q=70","https://images.unsplash.com/photo-1767926189999-4f9550c88247?auto=format&fit=crop&w=520&q=70","https://images.unsplash.com/photo-1688306141976-0a8ef8c3f585?auto=format&fit=crop&w=520&q=70","https://images.unsplash.com/photo-1764193875912-0f0a64874344?auto=format&fit=crop&w=520&q=70","https://images.unsplash.com/photo-1731870692027-d9b72b4931bd?auto=format&fit=crop&w=520&q=70","https://images.unsplash.com/photo-1698490275678-518f3b591f0c?auto=format&fit=crop&w=520&q=70"]
interface Props { [key: string]: any; title?: string; text?: string; badge?: string; images?: any[]; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function PhotoWall({ ivBg, ivText, ivMuted, ivFontPick, ivScale, ivBright, title = "On site, every day", text = "Real progress from our live sites, updated as each project moves forward.", badge = "On site now", images = [], accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null), dot = useRef<HTMLSpanElement>(null)
    const list = images.length ? images.map((m) => m?.src).filter(Boolean) : SRC
    useEffect(() => {
        const el = root.current; if (!el || RenderTarget.current() === RenderTarget.canvas || !el.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const cols = Array.from(el.querySelectorAll("[data-col]")) as HTMLElement[]
        const anims = cols.map((c, i) => c.animate([{ transform: "translate3d(0," + (i % 2 ? "-50%" : "0") + ",0)" }, { transform: "translate3d(0," + (i % 2 ? "0" : "-50%") + ",0)" }], { duration: 42000 + i * 9000, iterations: Infinity }))
        if (dot.current) anims.push(dot.current.animate([{ boxShadow: "0 0 0 0 " + accent + "aa" }, { boxShadow: "0 0 0 10px " + accent + "00" }], { duration: 1700, iterations: Infinity }))
        const io = new IntersectionObserver((e) => anims.forEach((a) => (e[0].isIntersecting ? a.play() : a.pause()))); io.observe(el)
        return () => { io.disconnect(); anims.forEach((a) => a.cancel()) }
    }, [accent, list.length])
    const col = (off: number) => { const order = list.map((_, k) => list[(k + off) % list.length]); return [...order, ...order] }
    return <div ref={root} style={{ width: "100%", boxSizing: "border-box", background: "var(--ivBg,#17181b)", padding: "clamp(64px,8vw,104px) clamp(20px,3.4vw,40px)", fontFamily: FONT, ...ivVars({ "--ivBg": ivBg, "--ivText": ivText, "--ivMuted": ivMuted, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
            <div style={{ flex: "1 1 280px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: accent, marginBottom: 18 }}><span ref={dot} style={{ width: 8, height: 8, borderRadius: 8, background: accent }} />{badge}</div>
                <h2 style={{ margin: "0 0 16px", fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.05, fontWeight: 600, letterSpacing: "-.03em", color: "var(--ivText,#f4f2ec)" }}>{title}</h2>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: "var(--ivMuted,#a9a79f)", maxWidth: 420 }}>{text}</p>
            </div>
            <div style={{ flex: "2 1 340px", minWidth: 0, height: "clamp(440px,70vh,680px)", overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, WebkitMaskImage: "linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent)", maskImage: "linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent)" }}>
                {[0, 2, 4].map((off) => <div key={off} data-col style={{ display: "flex", flexDirection: "column", gap: 12, willChange: "transform" }}>{col(off).map((s, k) => <PixelImage key={k} effect={FX[(k + off) % FX.length]} src={s} alt={k < list.length ? "Construction and building photo" : ""} hidden={k >= list.length} eager={k < 3} style={{ width: "100%", flex: "none", aspectRatio: k % 3 === 1 ? "3/4" : "4/5", borderRadius: 3 }} imgStyle={{ filter: "saturate(.85) contrast(1.05) brightness(var(--ivBright,.84))" }} />)}</div>)}
            </div>
        </div>
    </div>
}
