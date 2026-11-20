"use client";
// @ts-nocheck
import { useEffect, useRef } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };


interface Props { count?: number; secondsEach?: number; track?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function StageRail({ count = 4, secondsEach = 2.4, track = "#2e2e30", accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = root.current
        if (!el || RenderTarget.current() === RenderTarget.canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const bars = Array.from(el.querySelectorAll("[data-bar]")) as HTMLElement[], total = (count + 1) * secondsEach * 1000
        const anims = bars.map((b, i) => { const s = i / (count + 1), e = (i + 1) / (count + 1); return b.animate([{ transform: "scaleX(0)", opacity: 1, offset: 0 }, { transform: "scaleX(0)", opacity: 1, offset: s }, { transform: "scaleX(1)", opacity: 1, offset: e }, { transform: "scaleX(1)", opacity: 1, offset: 0.94 }, { transform: "scaleX(1)", opacity: 0, offset: 1 }], { duration: total, iterations: Infinity }) })
        const io = new IntersectionObserver((e) => anims.forEach((a) => (e[0].isIntersecting ? a.play() : a.pause()))); io.observe(el)
        return () => { io.disconnect(); anims.forEach((a) => a.cancel()) }
    }, [count, secondsEach])
    return (
        <div ref={root} aria-hidden style={{ display: "flex", gap: 16, width: 1120, height: 3, ...style }}>
            {Array.from({ length: count }).map((_, i) => <div key={i} style={{ flex: 1, height: "100%", background: track, overflow: "hidden" }}><div data-bar style={{ height: "100%", background: accent, transformOrigin: "0 50%" }} /></div>)}
        </div>
    )
}
