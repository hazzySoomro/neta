"use client";
// @ts-nocheck
import { useEffect, useRef } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };


interface Props { src: string; srcSet?: string; alt?: string; eager?: boolean; hidden?: boolean; effect?: string; imgStyle?: any; style?: any }
const LEVELS = [38, 26, 16, 10, 6, 3]

// Photo reveal effects: pixel (blocks assemble and sharpen), slats, wipe, wipeSide, iris, zoom
const SOFT = { duration: 1300, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" as const }
const CSS_FX: any = {
    wipe: [{ clipPath: "inset(100% 0 0 0)", transform: "scale(1.18)" }, { clipPath: "inset(0 0 0 0)", transform: "scale(1)" }],
    wipeSide: [{ clipPath: "inset(0 100% 0 0)", transform: "scale(1.14)" }, { clipPath: "inset(0 0 0 0)", transform: "scale(1)" }],
    iris: [{ clipPath: "circle(0% at 50% 50%)", transform: "scale(1.12)" }, { clipPath: "circle(78% at 50% 50%)", transform: "scale(1)" }],
    zoom: [{ opacity: 0, transform: "scale(1.28)" }, { opacity: 1, transform: "scale(1)" }],
}
export default function PixelImage({ src, srcSet, alt = "", eager, hidden, effect = "pixel", imgStyle, style }: Props) {
    const box = useRef<HTMLDivElement>(null), cv = useRef<HTMLCanvasElement>(null), im = useRef<HTMLImageElement>(null)
    useEffect(() => {
        const el = box.current, canvas = cv.current, photo = im.current
        if (!el || !canvas || !photo) return
        const show = () => { photo.style.opacity = "1"; canvas.style.display = "none" }
        const c = canvas.getContext("2d")
        if (!c || RenderTarget.current() === RenderTarget.canvas || RenderTarget.current() === RenderTarget.thumbnail || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { show(); return }
        photo.style.opacity = "0"
        let raf = 0, stop = false
        const run = () => {
            const source = new Image(); source.src = src
            source.onerror = show
            source.onload = () => {
                if (stop) return
                if (CSS_FX[effect]) { canvas.style.display = "none"; photo.style.opacity = "1"; photo.style.transition = "none"; photo.animate(CSS_FX[effect], SOFT); return }
                const r = el.getBoundingClientRect(), W = Math.max(1, Math.min(420, Math.round(r.width))), H = Math.max(1, Math.round((W * r.height) / Math.max(1, r.width)))
                if (r.width < 2 || r.height < 2) return show()
                canvas.width = W; canvas.height = H
                const sc = Math.max(W / source.naturalWidth, H / source.naturalHeight), sw = W / sc, sh = H / sc, sx = (source.naturalWidth - sw) / 2, sy = (source.naturalHeight - sh) / 2
                const small = document.createElement("canvas"), sm = small.getContext("2d") as any
                const cols = 10, rows = Math.max(4, Math.round((cols * H) / W)), order: number[] = []
                for (let i = 0; i < cols * rows; i++) order.splice(Math.floor(Math.random() * (order.length + 1)), 0, i)
                const start = performance.now(), dur = 1250 + Math.random() * 450
                let lastLevel = -1
                const tick = (now: number) => {
                    if (stop) return
                    const t = Math.min(1, (now - start) / dur)
                    if (t >= 1) { show(); return }
                    if (effect === "slats") {
                        canvas.style.imageRendering = "auto"; c.clearRect(0, 0, W, H); c.imageSmoothingEnabled = true
                        const slats = 8, sl = W / slats
                        for (let i = 0; i < slats; i++) { const q = Math.min(1, Math.max(0, (t - (i / slats) * 0.45) / 0.55)), e = 1 - Math.pow(1 - q, 3), dw = sl * e; if (dw > 0) c.drawImage(source, sx + (i * sl) / sc, sy, dw / sc, sh, i * sl, 0, Math.ceil(dw), H) }
                        raf = requestAnimationFrame(tick); return
                    }
                    const level = Math.min(LEVELS.length - 1, Math.floor(Math.max(0, (t - 0.42) / 0.58) * LEVELS.length)), p = LEVELS[level]
                    if (level !== lastLevel) { small.width = Math.max(1, Math.ceil(W / p)); small.height = Math.max(1, Math.ceil(H / p)); sm.drawImage(source, sx, sy, sw, sh, 0, 0, small.width, small.height); lastLevel = level }
                    c.clearRect(0, 0, W, H); c.imageSmoothingEnabled = false
                    const n = Math.ceil(Math.min(1, t / 0.45) * order.length), tw = W / cols, th = H / rows
                    for (let i = 0; i < n; i++) { const a = order[i], x = (a % cols) * tw, y = Math.floor(a / cols) * th; c.drawImage(small, (x / W) * small.width, (y / H) * small.height, (tw / W) * small.width, (th / H) * small.height, x, y, Math.ceil(tw), Math.ceil(th)) }
                    raf = requestAnimationFrame(tick)
                }
                raf = requestAnimationFrame(tick)
            }
        }
        const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); run() } }, { threshold: 0.12 })
        io.observe(el)
        return () => { stop = true; io.disconnect(); cancelAnimationFrame(raf) }
    }, [src, effect])
    return <div ref={box} style={{ position: "relative", overflow: "hidden", background: "#1c1d20", ...style }}>
        <img ref={im} src={src} srcSet={srcSet} alt={alt} aria-hidden={hidden} loading={eager ? "eager" : "lazy"} decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity .25s linear", ...imgStyle }} />
        <canvas ref={cv} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: "pixelated", ...imgStyle }} />
    </div>
}
