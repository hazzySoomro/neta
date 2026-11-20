"use client";
// @ts-nocheck
import { useEffect, useRef } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };


interface Props { line?: string; accent?: string; style?: any }
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function SurveyGrid({ line = "rgba(244,242,236,.055)", accent = "#ffc400", style }: Props) {
    const a = useRef<HTMLDivElement>(null), b = useRef<HTMLDivElement>(null), c = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (RenderTarget.current() === RenderTarget.canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const list: Animation[] = []
        if (a.current) list.push(a.current.animate([{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(56px,56px,0)" }], { duration: 16000, iterations: Infinity }))
        if (b.current) list.push(b.current.animate([{ transform: "translate3d(-20vw,0,0)", opacity: 0 }, { opacity: 0.8, offset: 0.2 }, { opacity: 0.8, offset: 0.8 }, { transform: "translate3d(110vw,0,0)", opacity: 0 }], { duration: 7000, iterations: Infinity }))
        if (c.current) list.push(c.current.animate([{ transform: "translate3d(110vw,0,0)", opacity: 0 }, { opacity: 0.55, offset: 0.2 }, { opacity: 0.55, offset: 0.8 }, { transform: "translate3d(-20vw,0,0)", opacity: 0 }], { duration: 10000, delay: 1500, iterations: Infinity }))
        return () => list.forEach((q) => q.cancel())
    }, [])
    const bar = { position: "absolute", left: 0, width: "18vw", height: 1, background: "linear-gradient(90deg,transparent," + accent + ",transparent)", willChange: "transform,opacity", opacity: 0 } as any
    return (
        <div aria-hidden style={{ position: "relative", overflow: "hidden", width: 1200, height: 500, ...style }}>
            <div ref={a} style={{ position: "absolute", inset: -60, backgroundImage: "linear-gradient(" + line + " 1px,transparent 1px),linear-gradient(90deg," + line + " 1px,transparent 1px)", backgroundSize: "56px 56px", willChange: "transform" }} />
            <div ref={b} style={{ ...bar, top: "34%" }} /><div ref={c} style={{ ...bar, top: "72%" }} />
        </div>
    )
}
