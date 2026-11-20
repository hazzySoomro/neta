"use client";
// @ts-nocheck
import { useEffect, useRef } from "react"
const RenderTarget = { current: () => "preview", canvas: "canvas", thumbnail: "thumbnail" };


type V = number[]
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const sm = (a: number, b: number, v: number) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const sub = (a: V, b: V) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: V, b: V) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const nrm = (a: V) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
const scl = (a: V, s: number) => [a[0] * s, a[1] * s, a[2] * s]
function lookAt(e: V, t: V, u: V) { const z = nrm(sub(e, t)), x = nrm(cross(u, z)), y = cross(z, x); return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]) }
function persp(fov: number, a: number, n: number, f: number) { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]) }
function ortho(s: number, n: number, f: number) { return new Float32Array([1 / s, 0, 0, 0, 0, 1 / s, 0, 0, 0, 0, -2 / (f - n), 0, 0, 0, -(f + n) / (f - n), 1]) }
function mul(a: any, b: any) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3]; return o }
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const C = (h: string) => { const n = parseInt(h.slice(1), 16); return [Math.pow(((n >> 16) & 255) / 255, 2.2), Math.pow(((n >> 8) & 255) / 255, 2.2), Math.pow((n & 255) / 255, 2.2)] }

// Materials: 0 paint, 1 concrete, 2 glass, 3 ground, 4 asphalt, 5 foliage, 6 metal, 7 city block
let THEME = { crane: "#eeb71c", hoarding: "#d9a70f", stone: "#b8b2a4" }
const toHex = (c: any, d: string) => { if (typeof c !== "string") return d; if (/^#[0-9a-f]{6}$/i.test(c)) return c; const m = c.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/); return m ? "#" + [1, 2, 3].map((i) => (+m[i]).toString(16).padStart(2, "0")).join("") : d }
const NO = [0, 1, -1]
let WELD = [0, 0, 0, 0]
const G = (b: any, x: number, y: number, z: number, s: number, r: number, g: number, bl: number) => b[3].push(x, y, z, s, r, g, bl)
let seedR = rng(5)
function put(l: number[], X: V, Y: V, Z: V, T: V, c: V, m: number, r: V, s?: number) { l.push(X[0], X[1], X[2], Y[0], Y[1], Y[2], Z[0], Z[1], Z[2], T[0], T[1], T[2], c[0], c[1], c[2], m, s === undefined ? seedR() : s, r[0], r[1], r[2]) }
function box(l: number[], x: number, y: number, z: number, sx: number, sy: number, sz: number, c: V, m = 0, r: V = NO, rot = 0) { const co = Math.cos(rot), si = Math.sin(rot); put(l, [sx * co, 0, -sx * si], [0, sy, 0], [sz * si, 0, sz * co], [x, y, z], c, m, r) }
function beam(l: number[], a: V, b: V, w: number, c: V, m = 0, r: V = NO, h = w) { const Y = sub(b, a), n = nrm(Y), up = Math.abs(n[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], X = nrm(cross(up, n)), Z = nrm(cross(X, n)); put(l, scl(X, w), Y, scl(Z, h), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], c, m, r) }

const N = 10, FH = 3.6, HX = 14, HZ = 10, CX = -30, CZ = -24, MASTH = 62, JIBL = 60
const YARD = [24, -26]
const fStart = (i: number) => 0.02 + (i / N) * 0.7

function buildScene(small: boolean) {
    seedR = rng(5); const r = rng(11)
    const glows: number[] = [], fBox: number[] = [], fCyl: number[] = [], fSph: number[] = []
    const sBox: number[] = [], sCyl: number[] = [], sSph: number[] = [], mast: number[] = [], upper: number[] = []
    const conc = C("#c9c5bb"), concD = C("#a9a59b"), steel = C("#6c7377"), yel = C(THEME.crane), yelD = scl(C(THEME.crane), 0.42), wood = C("#b58b56"), rust = C("#6a4a38"), spand = C("#343a40"), fin = C("#2c3136"), white = C("#f1f1ec")
    // Ground, roads, kerbs
    box(sBox, 0, -0.5, 0, 2400, 1, 2400, C("#9b8c74"), 3)
    const road = C("#55565a"), kerb = C("#c2bfb6")
    ;[-72, 72].forEach((x) => { box(sBox, x, 0.03, 0, 15, 0.06, 2400, road, 4); box(sBox, x - 8, 0.08, 0, 1.4, 0.16, 2400, kerb, 1); box(sBox, x + 8, 0.08, 0, 1.4, 0.16, 2400, kerb, 1) })
    ;[-60, 60].forEach((z) => { box(sBox, 0, 0.035, z, 2400, 0.06, 15, road, 4); box(sBox, 0, 0.08, z - 8, 2400, 0.16, 1.4, kerb, 1); box(sBox, 0, 0.08, z + 8, 2400, 0.16, 1.4, kerb, 1) })
    // Foundation
    box(sBox, 0, 0.2, 0, 2 * HX + 3, 0.4, 2 * HZ + 3, concD, 1)
    // Structure, floor by floor
    for (let i = 0; i < N; i++) {
        const s = fStart(i), colE = s + 0.026, y0 = 0.4 + i * FH, slabE = colE + 0.016, cladS = Math.min(s + 0.13, 0.885)
        for (let gx = 0; gx < 6; gx++) for (let gz = 0; gz < 4; gz++) {
            const x = -HX + 0.5 + (gx * (2 * HX - 1)) / 5, z = -HZ + 0.5 + (gz * (2 * HZ - 1)) / 3
            box(sBox, x, y0 + FH / 2, z, 0.62, FH, 0.62, conc, 1, [s, colE, 0])
            for (const d of [-0.18, 0.18]) box(sBox, x + d, y0 + FH + 0.55, z, 0.05, 1.1, 0.05, rust, 6, [s, slabE + 0.012, 2])
        }
        box(sBox, 0, y0 + FH / 2, 0, 7, FH, 5, conc, 1, [s, colE, 0])
        for (let k = 0; k < 8; k++) box(sBox, -11 + k * 3.2, y0 + FH / 2, -6 + (k % 3) * 6, 0.09, FH, 0.09, steel, 6, [colE - 0.005, slabE + 0.03, 2])
        box(sBox, 0, y0 + FH - 0.13, 0, 2 * HX + 0.5, 0.3, 2 * HZ + 0.5, conc, 1, [colE, slabE, 1])
        // Temporary edge protection
        for (const z of [-HZ - 0.15, HZ + 0.15]) { box(sBox, 0, y0 + FH + 1, z, 2 * HX + 0.6, 0.05, 0.05, yel, 0, [slabE, slabE + 0.03, 2]); for (let x = -HX; x <= HX; x += 4) box(sBox, x, y0 + FH + 0.5, z, 0.05, 1, 0.05, steel, 6, [slabE, slabE + 0.03, 2]) }
        // Curtain wall
        let idx = 0
        const panel = (x: number, z: number, axis: number, sign: number) => {
            const st = cladS + (idx++ / 48) * 0.05, rv = [st, st + 0.007, 1], w = 1.94, h = FH - 0.74, yy = y0 + 0.62 + h / 2, off = 0.03 * sign
            if (axis === 0) { box(sBox, x, yy, z + off, w, h, 0.07, C("#6da3c4"), 2, rv); box(sBox, x, y0 + 0.31, z + off, 2, 0.62, 0.12, spand, 6, rv); box(sBox, x - 1, y0 + FH / 2, z + 0.13 * sign, 0.08, FH, 0.2, fin, 6, rv); box(sBox, x, yy, z + 0.05 * sign, 0.04, h, 0.06, C("#262a2f"), 6, rv) }
            else { box(sBox, x + off, yy, z, 0.07, h, w, C("#6da3c4"), 2, rv); box(sBox, x + off, y0 + 0.31, z, 0.12, 0.62, 2, spand, 6, rv); box(sBox, x + 0.13 * sign, y0 + FH / 2, z - 1, 0.2, FH, 0.08, fin, 6, rv); box(sBox, x + 0.05 * sign, yy, z, 0.06, h, 0.04, C("#262a2f"), 6, rv) }
        }
        for (let k = 0; k < 14; k++) panel(-13 + k * 2, HZ + 0.12, 0, 1)
        for (let k = 0; k < 10; k++) panel(HX + 0.12, 9 - k * 2, 1, 1)
        for (let k = 0; k < 14; k++) panel(13 - k * 2, -HZ - 0.12, 0, -1)
        for (let k = 0; k < 10; k++) panel(-HX - 0.12, -9 + k * 2, 1, -1)
        // Scaffold on the west elevation
        const scaf = [s, 0.955, 2]
        for (const z of [-9, -3, 3, 9]) for (const x of [-HX - 1, -HX - 2.4]) box(sCyl, x, y0 + FH / 2, z, 0.07, FH, 0.07, steel, 6, scaf)
        for (const x of [-HX - 1, -HX - 2.4]) box(sBox, x, y0 + FH - 0.02, 0, 0.06, 0.06, 19, steel, 6, scaf)
        box(sBox, -HX - 1.7, y0 + FH - 0.08, 0, 1.4, 0.07, 18.5, wood, 0, scaf)
        beam(sBox, [-HX - 2.4, y0, -9], [-HX - 2.4, y0 + FH, -3], 0.05, steel, 6, scaf); beam(sBox, [-HX - 2.4, y0, 3], [-HX - 2.4, y0 + FH, 9], 0.05, steel, 6, scaf)
        // Hoist mast on the east elevation
        box(sBox, HX + 1.5, y0 + FH / 2, 3, 0.55, FH, 0.55, steel, 6, scaf)
    }
    // Roof
    const roofY = 0.4 + N * FH, roof = [0.89, 0.915, 1]
    ;[[0, HZ + 0.1, 2 * HX + 0.8, 0.3], [0, -HZ - 0.1, 2 * HX + 0.8, 0.3], [HX + 0.1, 0, 0.3, 2 * HZ + 0.8], [-HX - 0.1, 0, 0.3, 2 * HZ + 0.8]].forEach((q) => box(sBox, q[0], roofY + 0.4, q[1], q[2], 0.9, q[3], C("#3a3f45"), 6, roof))
    box(sBox, 0, roofY + 1.3, 0, 8, 2.6, 6, C("#a8aba9"), 6, [0.9, 0.925, 1]); box(sBox, -8, roofY + 0.8, 4, 4, 1.6, 3, C("#8e9394"), 6, [0.905, 0.93, 1]); box(sBox, 8, roofY + 0.8, -4, 4, 1.6, 3, C("#8e9394"), 6, [0.905, 0.93, 1])
    for (let a = 0; a < 6; a++) for (let b = 0; b < 2; b++) box(sBox, -3 + a * 2.2, roofY + 0.3, 6.6 + b * 1.6, 2, 0.08, 1.4, C("#1d3550"), 2, [0.915, 0.94, 1])
    // Stone corner piers, podium band and entrance doors
    const stone = C(THEME.stone)
    for (const q of [[HX + 0.1, HZ + 0.1], [-HX - 0.1, HZ + 0.1], [HX + 0.1, -HZ - 0.1], [-HX - 0.1, -HZ - 0.1]]) box(sBox, q[0], 0.4 + (N * FH + 0.6) / 2, q[1], 1.5, N * FH + 0.6, 1.5, stone, 1, [0.86, 0.9, 0])
    for (const q of [[0, HZ + 0.34, 2 * HX + 1, 0.3], [0, -HZ - 0.34, 2 * HX + 1, 0.3], [HX + 0.34, 0, 0.3, 2 * HZ + 1], [-HX - 0.34, 0, 0.3, 2 * HZ + 1]]) box(sBox, q[0], 0.62, q[1], q[2], 0.5, q[3], stone, 1, [0.88, 0.91, 1])
    for (const x of [-2.2, 0, 2.2]) { box(sBox, x, 2, HZ + 0.34, 2, 3.1, 0.1, C("#6da3c4"), 2, [0.92, 0.94, 1]); box(sBox, x - 1, 2, HZ + 0.4, 0.1, 3.2, 0.16, C("#1d2125"), 6, [0.92, 0.94, 1]) }

    // Canopy and entrance appear near the end
    box(sBox, 0, 4.25, HZ + 2.3, 12, 0.3, 4.4, white, 1, [0.92, 0.94, 1]); for (const x of [-5.6, 5.6]) box(sCyl, x, 2.2, HZ + 4, 0.28, 3.9, 0.28, steel, 6, [0.92, 0.94, 0])
    // Crane
    const tube = (l: number[], a: V, b: V, w: number) => beam(l, a, b, w, yel, 0)
    const hs = 1.05
    box(mast, 0, 0.5, 0, 6.5, 1, 6.5, concD, 1)
    for (const q of [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]]) tube(mast, [q[0], 1, q[1]], [q[0], MASTH, q[1]], 0.16)
    for (let y = 1; y < MASTH - 1; y += 2.2) {
        const q = [[-hs, -hs, hs, -hs], [hs, -hs, hs, hs], [hs, hs, -hs, hs], [-hs, hs, -hs, -hs]]
        q.forEach((p, k) => { tube(mast, [p[0], y, p[1]], [p[2], y, p[3]], 0.07); const f = (Math.floor(y / 2.2) + k) % 2; tube(mast, [p[f ? 2 : 0], y, p[f ? 3 : 1]], [p[f ? 0 : 2], y + 2.2, p[f ? 1 : 3]], 0.06) })
    }
    const J = MASTH + 0.6, Ju = J + 2.6, wz = 0.85
    box(upper, 0, MASTH + 0.25, 0, 3.1, 0.5, 3.1, C("#50565a"), 6)
    const chords = (a: V, b: V, w: number) => beam(upper, a, b, w, yelD, 0)
    chords([-20, J, -wz], [JIBL, J, -wz], 0.15); chords([-20, J, wz], [JIBL, J, wz], 0.15)
    tube(upper, [-18, Ju, 0], [JIBL - 8, Ju, 0], 0.15); tube(upper, [JIBL - 8, Ju, 0], [JIBL, J, 0], 0.13)
    for (let x = -18; x < JIBL - 2; x += 2.4) {
        const top = (q: number) => (q > JIBL - 8 ? mix(Ju, J, (q - JIBL + 8) / 8) : Ju)
        tube(upper, [x, J, -wz], [x + 1.2, top(x + 1.2), 0], 0.05); tube(upper, [x, J, wz], [x + 1.2, top(x + 1.2), 0], 0.05); tube(upper, [x + 1.2, top(x + 1.2), 0], [x + 2.4, J, -wz], 0.05); tube(upper, [x + 1.2, top(x + 1.2), 0], [x + 2.4, J, wz], 0.05); tube(upper, [x, J, -wz], [x, J, wz], 0.05)
    }
    tube(upper, [-1, J, 0], [0, J + 11, 0], 0.22); tube(upper, [1, J, 0], [0, J + 11, 0], 0.22); tube(upper, [0, J, -1], [0, J + 11, 0], 0.2); tube(upper, [0, J, 1], [0, J + 11, 0], 0.2)
    beam(upper, [0, J + 11, 0], [36, Ju, 0], 0.035, steel, 6); beam(upper, [0, J + 11, 0], [17, Ju, 0], 0.035, steel, 6); beam(upper, [0, J + 11, 0], [-17, J + 0.5, 0], 0.05, steel, 6)
    for (let k = 0; k < 5; k++) box(upper, -19 + k * 1, J - 1.5, 0, 0.92, 3.2, 2.2, conc, 1)
    box(upper, -10, J + 0.5, 0, 3.2, 1.3, 1.9, C("#5f666a"), 6)
    box(upper, 1.5, J - 1.5, 1.8, 1.9, 2.4, 1.6, white, 0); box(upper, 2.45, J - 1.45, 1.8, 0.05, 1.7, 1.4, C("#6da3c4"), 2)
    // Hoarding around the site (removed at the end)
    const clearR = [0, 0.955, 2], hb = C(THEME.hoarding), ha = C("#e9e8e2")
    for (let x = -60; x < 60; x += 6) for (const z of [-50, 50]) { if (z === 50 && x > 18 && x < 30) continue; box(sBox, x + 3, 1.25, z, 5.9, 2.5, 0.08, (Math.floor(x / 6) % 4 === 0) ? hb : ha, 0, clearR); box(sBox, x, 1.3, z, 0.12, 2.6, 0.12, steel, 6, clearR) }
    for (let z = -50; z < 50; z += 6) for (const x of [-60, 60]) { box(sBox, x, 1.25, z + 3, 0.08, 2.5, 5.9, (Math.floor(z / 6) % 4 === 0) ? hb : ha, 0, clearR); box(sBox, x, 1.3, z, 0.12, 2.6, 0.12, steel, 6, clearR) }
    // Site floodlight towers
    const lampC = [1, 0.86, 0.62]
    ;[[-40, 30], [42, -30], [40, 36], [-42, -34]].forEach((q) => { box(sBox, q[0], 7, q[1], 0.22, 14, 0.22, steel, 6, clearR); box(sBox, q[0], 14.2, q[1], 2.2, 0.75, 0.3, lampC, 8, clearR) })
    // Street lamps
    for (let k = -8; k <= 8; k++) { const x = k * 26; for (const z of [-68, 68]) { box(sBox, x, 3.6, z, 0.16, 7.2, 0.16, steel, 6); box(sBox, x, 7.2, z, 0.8, 0.16, 0.34, [1, 0.72, 0.4], 8); glows.push(x, 7.1, z, 7, 0.55, 0.34, 0.15) } for (const px of [-80, 80]) { box(sBox, px, 3.6, x, 0.16, 7.2, 0.16, steel, 6); box(sBox, px, 7.2, x, 0.34, 0.16, 0.8, [1, 0.72, 0.4], 8); glows.push(px, 7.1, x, 7, 0.55, 0.34, 0.15) } }
    // Finished building: roof crown, canopy light, path bollards
    const crown = [0.93, 0.955, 1], crownC = [1, 0.62, 0.26]
    box(sBox, 0, roofY + 0.92, HZ + 0.32, 2 * HX + 0.7, 0.07, 0.05, crownC, 8, crown); box(sBox, 0, roofY + 0.92, -HZ - 0.32, 2 * HX + 0.7, 0.07, 0.05, crownC, 8, crown); box(sBox, HX + 0.32, roofY + 0.92, 0, 0.05, 0.07, 2 * HZ + 0.7, crownC, 8, crown); box(sBox, -HX - 0.32, roofY + 0.92, 0, 0.05, 0.07, 2 * HZ + 0.7, crownC, 8, crown)
    box(sBox, 0, 4.08, HZ + 2.4, 10, 0.05, 3, [1, 0.8, 0.54], 8, [0.93, 0.95, 2])
    for (let k = 0; k < 7; k++) for (const x of [-7.6, 7.6]) box(sCyl, x, 0.62, HZ + 3 + k * 4.8, 0.14, 0.9, 0.14, [1, 0.75, 0.45], 8, [0.955 + k * 0.003, 2, 2])

    // Soil piles, yard, cabins, pipes, skip
    const soil = C("#7b6144"), soil2 = C("#8d7150")
    box(sSph, 31, 0.8, 26, 17, 6, 13, soil, 3, clearR); box(sSph, 41, 0.5, 18, 12, 4, 10, soil2, 3, clearR)
    for (let k = 0; k < 5; k++) { box(sBox, YARD[0], 0.2 + k * 0.42, YARD[1], 12, 0.36, 3, conc, 1, clearR); box(sBox, YARD[0] + 8, 0.22 + k * 0.42, YARD[1] + 4.2, 8, 0.36, 2, C("#7fa9c3"), 2, clearR) }
    for (let k = 0; k < 8; k++) beam(sCyl, [YARD[0] - 8 + k * 0.08, 0.2 + (k % 3) * 0.18, YARD[1] + 6 + k * 0.24], [YARD[0] + 4, 0.2 + (k % 3) * 0.18, YARD[1] + 6 + k * 0.24], 0.12, rust, 6, clearR)
    for (let row = 0; row < 3; row++) for (let k = 0; k < 6 - row; k++) beam(sCyl, [-20, 0.55 + row * 0.92, 30 + k * 1.1 + row * 0.55], [-13, 0.55 + row * 0.92, 30 + k * 1.1 + row * 0.55], 1.05, C("#70767a"), 1, clearR)
    for (let k = 0; k < 2; k++) for (let lvl = 0; lvl < 2; lvl++) { const y = 1.4 + lvl * 2.8, x = -50 + k * 12.5; box(sBox, x, y, 40, 12, 2.7, 3, lvl ? ha : C("#dfe1dd"), 0, clearR); box(sBox, x, y, 41.53, 8, 1, 0.06, C("#6da3c4"), 2, clearR) }
    box(sBox, -24, 1, 14, 6, 2, 3, C("#c5702a"), 0, clearR); box(sSph, -24, 1.9, 14, 5, 1.3, 2.4, C("#5a4f45"), 3, clearR)
    for (let k = 0; k < 8; k++) { const x = 8 + k * 2.5, z = 44; box(sCyl, x, 0.38, z, 0.36, 0.76, 0.36, C("#e8682b"), 0, clearR) }
    // Landscape grows outward from the building at the end
    for (let x = -60; x < 60; x += 8) for (let z = -48; z < 48; z += 8) {
        const cx = x + 4, cz = z + 4, d = Math.hypot(cx, cz) / 76, st = 0.948 + d * 0.035, path = Math.abs(cx) < 7 && cz > 0
        if (Math.abs(cx) < HX + 1 && Math.abs(cz) < HZ + 1) continue
        box(sBox, cx, 0.12, cz, 8.02, 0.24, 8.02, path ? C("#c8c4ba") : C("#4f7a3e"), path ? 1 : 5, [st, st + 0.008, 0])
    }
    const addTree = (x: number, z: number, sc: number, rv: V, far = false) => {
        const cyl = far ? fCyl : sCyl, sph = far ? fSph : sSph, bark = C("#2f2d2a"), H = (6.4 + r() * 2.4) * sc, R = (2.9 + r() * 0.8) * sc, cy = H * 0.84, lean = [(r() - 0.5) * 0.7 * sc, (r() - 0.5) * 0.7 * sc]
        const mid = [x + lean[0] * 0.5, H * 0.46, z + lean[1] * 0.5], top = [x + lean[0], H * 0.72, z + lean[1]]
        beam(cyl, [x, 0, z], mid, 0.46 * sc, bark, 1, rv); beam(cyl, mid, top, 0.28 * sc, bark, 1, rv)
        box(sph, top[0], cy, top[2], R * 1.1, R * 0.85, R * 1.1, C("#2a4122"), 0, rv)
        const n = far ? 16 : 40, greens = ["#3e5f2d", "#34542a", "#4a6b33", "#2c4a26", "#557538"]
        for (let k = 0; k < n; k++) {
            const a = r() * 6.28, e = Math.acos(1 - r() * 1.8), dist = R * (0.4 + r() * 0.62), px = top[0] + Math.cos(a) * Math.sin(e) * dist, py = cy + Math.cos(e) * dist * 0.72 - R * 0.05, pz = top[2] + Math.sin(a) * Math.sin(e) * dist, s = (far ? 2 : 1.25 + r() * 1.25) * sc
            box(sph, px, py, pz, s * (0.9 + r() * 0.5), s * (0.7 + r() * 0.3), s * (0.9 + r() * 0.5), C(greens[Math.floor(r() * 5)]), 9, rv)
            if (k < 6) beam(cyl, [mix(mid[0], top[0], 0.6), H * 0.62, mix(mid[2], top[2], 0.6)], [px, py - s * 0.3, pz], 0.09 * sc, bark, 1, rv)
        }
    }
    ;[[-30, 40], [-34, 28], [-44, 22], [44, 38], [52, 32], [46, 24], [-40, -8], [-46, -28], [38, 2], [46, -18], [-22, -32], [10, -36], [28, -40]].forEach((q, k) => addTree(q[0], q[1], 0.85 + (k % 3) * 0.14, [0.962 + k * 0.0012, 0.985, 0]))
    // Street trees and lamps
    for (let k = -14; k <= 14; k += small ? 4 : 2) { addTree(k * 13 + 3, 76, 0.85 + r() * 0.4, NO, true); addTree(k * 13 - 3, -76, 0.85 + r() * 0.4, NO, true); if (Math.abs(k) > 3) { addTree(88, k * 11, 0.85 + r() * 0.4, NO, true); addTree(-88, k * 11, 0.85 + r() * 0.4, NO, true) } }
    return { static: [sBox, sCyl, sSph], mast: [mast, [], []], upper: [upper, [], []], far: [fBox, fCyl, fSph], glows }
}

const VS = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN;
layout(location=2) in vec3 iX; layout(location=3) in vec3 iY; layout(location=4) in vec3 iZ; layout(location=5) in vec3 iT; layout(location=6) in vec3 iC; layout(location=7) in vec2 iM; layout(location=8) in vec3 iR;
uniform mat4 uVP; uniform mat4 uModel; uniform float uB;
out vec3 vW; out vec3 vN; out vec3 vC; flat out float vM; flat out float vS;
void main(){ vec3 p=aP; vec3 off=vec3(0.); bool hide=false; float m=iR.z;
 if(m>-.5){ float q=clamp((uB-iR.x)/max(iR.y-iR.x,1e-4),0.,1.);
  if(m<.5){ p.y=(p.y+.5)*q-.5; hide=q<=0.; }
  else if(m<1.5){ q=q*q*(3.-2.*q); off.y=(1.-q)*2.2; hide=uB<=iR.x; }
  else { hide=uB<iR.x||uB>=iR.y; } }
 if(hide){ gl_Position=vec4(2.,2.,2.,1.); vW=vec3(0.);vN=vec3(0.,1.,0.);vC=vec3(0.);vM=0.;vS=0.; return; }
 vec4 W=uModel*vec4(iX*p.x+iY*p.y+iZ*p.z+iT+off,1.);
 vec3 n=iX*aN.x/dot(iX,iX)+iY*aN.y/dot(iY,iY)+iZ*aN.z/dot(iZ,iZ);
 vW=W.xyz; vN=normalize(mat3(uModel)*n); vC=iC; vM=iM.x; vS=iM.y; gl_Position=uVP*W; }`
const SHADOW_FS = `#version 300 es
precision mediump float; void main(){}`
const NOISE = `
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .5*n3(p)+.3*n3(p*2.1+3.)+.2*n3(p*4.3+7.);}
vec3 tone(vec3 c){c*=.92;c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);return pow(clamp(c,0.,1.),vec3(1./2.2));}`
const FS = `#version 300 es
precision highp float; precision highp sampler2DShadow;
in vec3 vW; in vec3 vN; in vec3 vC; flat in float vM; flat in float vS;
uniform vec3 uCam; uniform vec3 uSun; uniform sampler2D uSky; uniform sampler2DShadow uShadow; uniform mat4 uLight; uniform float uTop; uniform float uB; uniform float uFlood; uniform vec4 uWeld; out vec4 o;` + NOISE + `
vec3 env(vec3 d,float lod){vec2 uv=vec2(atan(d.z,d.x)/6.28318+.5,acos(clamp(d.y,-1.,1.))/3.14159);vec3 c=textureLod(uSky,uv,lod).rgb;return c*c;}
float shade(vec3 w,vec3 n){vec4 q=uLight*vec4(w+n*.16,1.);vec3 s=q.xyz*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;s.z-=.0009;float e=1./1400.;float v=0.;
 v+=texture(uShadow,vec3(s.xy+vec2(-e,-e),s.z));v+=texture(uShadow,vec3(s.xy+vec2(e,-e),s.z));v+=texture(uShadow,vec3(s.xy+vec2(-e,e),s.z));v+=texture(uShadow,vec3(s.xy+vec2(e,e),s.z));return v*.25;}
void main(){ vec3 N=normalize(vN); vec3 V=uCam-vW; float dist=length(V); V/=dist; vec3 L=uSun; vec3 alb=vC; vec3 emis=vec3(0.);float gloss=30.,sp=.04,fade=clamp(1.-dist/170.,0.,1.); int m=int(vM+.5);
 if(m==1){float n=fbm(vW*1.3);alb*=.8+.42*n;alb*=mix(1.,.94+.06*step(.035,fract(vW.y/1.2))*step(.02,fract((vW.x+vW.z)/2.4)),fade);alb*=1.-.13*smoothstep(.62,.8,n3(vW*vec3(2.,.25,2.)));gloss=12.;sp=.02;}
 else if(m==3){vec3 q=vW;float n=fbm(q*vec3(.1,1.,.1)),n2=fbm(q*.75),pad=smoothstep(66.,60.,abs(q.x)+n*5.)*smoothstep(54.,48.,abs(q.z)+n*5.);
   vec3 dirt=mix(C1,C2,n);dirt*=.78+.42*n2;dirt=mix(dirt,dirt*.72,smoothstep(.1,0.,abs(fract((q.z+sin(q.x*.07)*7.)/11.)-.5)-.16)*.55*smoothstep(.3,.65,n));dirt*=mix(1.,.86+.3*n3(q*8.),fade);
   vec3 out2=mix(vec3(.2,.3,.11),vec3(.36,.36,.3),smoothstep(.42,.62,n2));float keep=vC.r>.3?0.:1.;alb=vM>0.?mix(mix(out2,alb*1.,keep),dirt,keep>0.?0.:pad):alb;if(keep>0.)alb=vC*(.72+.45*n2);gloss=6.;sp=.015;N=normalize(N+vec3(n2-.5,0.,n3(q*.75+9.)-.5)*.45);}
 else if(m==4){float n=fbm(vW*.8);alb*=.78+.42*n;alb*=mix(1.,.86+.3*n3(vW*14.),fade);float dashX=step(abs(abs(vW.x)-72.),.1)*step(.5,fract(vW.z/6.))*step(abs(vW.z),1190.);float dashZ=step(abs(abs(vW.z)-60.),.1)*step(.5,fract(vW.x/6.));alb=mix(alb,vec3(.8,.78,.68),max(dashX,dashZ)*(.55+.45*n));gloss=20.;sp=.03;}
 else if(m==5){float n=fbm(vW*2.6);alb*=.72+.5*n;alb*=mix(1.,.7+.6*n3(vW*vec3(16.,1.,16.)),fade);N=normalize(N+(vec3(n3(vW*6.),0.,n3(vW*6.+9.))-.5)*.35);gloss=8.;sp=.02;}
 else if(m==6){gloss=70.;sp=.3;alb*=.86+.24*n3(vW*3.);}
 else if(m==0){gloss=46.;sp=.07;}
 else if(m==7){float a=abs(N.y)>.5?0.:1.;float co=abs(N.x)>.5?vW.z:vW.x;float gx=step(.2,fract(co/3.3)),gy=step(.3,fract(vW.y/3.5));float w=gx*gy*a;float rn=h3(floor(vec3(co/3.3,vW.y/3.5,vS*40.)));vec3 glass=env(reflect(-V,N),2.)*.7+vec3(.03,.05,.07);alb=mix(alb,glass/.95,w*.82);alb=mix(alb,alb*(.82+.35*rn),w);gloss=30.;if(rn>.74)emis=vec3(1.,.7,.4)*w*(.12+.5*fract(rn*7.));}
 if(m==8){emis=vC*3.2;alb=vec3(0.);}
 if(m==9){float a=n3(vW*7.+vS*9.),b=n3(vW*17.);float rim=1.-abs(dot(N,V));if(a*.7+b*.3<.2+rim*.4)discard;alb*=.5+.95*b;N=normalize(N+(vec3(n3(vW*9.),n3(vW*9.+4.),n3(vW*9.+8.))-.5)*1.4);gloss=14.;sp=.03;emis=alb*vec3(.035,.05,.022);}
 float ndl=max(dot(N,L),0.);float sh=ndl>0.?shade(vW,normalize(vN)):1.;vec3 sunc=vec3(.95,.52,.27);
 vec3 amb=mix(vec3(.03,.03,.042),vec3(.075,.105,.19),N.y*.5+.5);float ao=mix(.72,1.,smoothstep(0.,3.,vW.y))*mix(1.,.9,step(abs(N.y),.5));if(m!=2&&abs(vW.x)<13.7&&abs(vW.z)<9.7&&vW.y<uTop-.25&&vW.y>.45)ao*=.36;
 vec3 col;
 if(m==2){vec3 G=normalize(N+vec3(vS-.5,(fract(vS*7.)-.5)*.5,fract(vS*13.)-.5)*.024);vec3 R=reflect(-V,G);R.y=abs(R.y)+.07;R=normalize(R);vec3 e=(env(R,.7)*1.2+mix(vec3(.075,.095,.135),vec3(.01,.013,.022),clamp(R.y*1.5,0.,1.)))*(.72+.56*fract(vS*23.));float F=.14+.86*pow(1.-max(dot(G,V),0.),4.);float fy=fract((vW.y-.4)/3.6);float sq=fract(vS*31.)*.03;float on=clamp(smoothstep(.955+sq,.96+sq,uB)+.16*step(.6,fract(vS*53.))+step(vW.y,4.)*.9,0.,1.)*step(.38,fract(vS*19.));vec3 inner=mix(vec3(.008,.012,.02),vec3(.85,.58,.34)*(.45+.55*fract(vS*11.)),on*(.18+.82*smoothstep(.5,.93,fy)));col=mix(inner,e,clamp(F+.26,0.,1.));float s=pow(max(dot(R,L),0.),700.)*sh;col+=vec3(7.,6.3,5.)*s;}
 else {vec3 H=normalize(L+V);float s=pow(max(dot(N,H),0.),gloss)*sp*(gloss+8.)*.04*sh;float F=sp+(1.-sp)*pow(1.-max(dot(N,V),0.),5.);col=alb*(sunc*ndl*sh+amb*ao)+sunc*s;if(m==0||m==6)col=mix(col,env(reflect(-V,N),3.),F*.35);}
 if(m!=2&&m!=8){vec3 lp=vec3(0.);
  const vec3 FL0=vec3(-40.,14.,30.);const vec3 FL1=vec3(42.,14.,-30.);const vec3 FL2=vec3(40.,14.,36.);const vec3 FL3=vec3(-42.,14.,-34.);
  vec3 q0=FL0-vW;vec3 q1=FL1-vW;vec3 q2=FL2-vW;vec3 q3=FL3-vW;
  float la=max(dot(N,normalize(q0)),0.)/(1.+dot(q0,q0)*.0016)+max(dot(N,normalize(q1)),0.)/(1.+dot(q1,q1)*.0016)+max(dot(N,normalize(q2)),0.)/(1.+dot(q2,q2)*.0016)+max(dot(N,normalize(q3)),0.)/(1.+dot(q3,q3)*.0016);
  lp+=vec3(1.,.9,.72)*la*.62*uFlood;
  vec3 qw=uWeld.xyz-vW;lp+=vec3(.55,.75,1.25)*uWeld.w*max(dot(N,normalize(qw)),0.)/(1.+dot(qw,qw)*.1)*2.4;
  if(vW.y<1.){float lx=mod(vW.x+13.,26.)-13.,dz=abs(abs(vW.z)-68.),lz=mod(vW.z+13.,26.)-13.,dx=abs(abs(vW.x)-80.);lp+=vec3(1.,.68,.36)*(exp(-(lx*lx+dz*dz)*.016)+exp(-(lz*lz+dx*dx)*.016))*1.15;}
  if(abs(vW.x)<13.7&&abs(vW.z)<9.7&&vW.y<uTop-.1&&vW.y>.4)lp+=vec3(.95,.68,.38)*.42*(.6+.4*sin(floor(vW.y/3.6)*2.7));
  col+=alb*lp;}
 col+=emis;
 float f=1.-exp(-dist*dist*.000011);vec3 hz=vec3(.034,.034,.04);col=mix(col,hz,f);
 float grain=(h3(vec3(gl_FragCoord.xy,1.))-.5)*.008;o=vec4(tone(col)+grain,1.);}`.replace(/C1/g, "vec3(.42,.3,.19)").replace(/C2/g, "vec3(.62,.49,.34)")
const GLOW_VS = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in float aS; layout(location=2) in vec3 aC; uniform mat4 uVP; uniform float uH; out vec3 vC; void main(){gl_Position=uVP*vec4(aP,1.);gl_PointSize=clamp(aS*uH/gl_Position.w,1.,240.);vC=aC;}`
const GLOW_FS = `#version 300 es
precision mediump float; in vec3 vC; out vec4 o; void main(){float r=length(gl_PointCoord-.5)*2.;float a=max(1.-r,0.);a=a*a*a*.65+pow(a,9.)*.9;o=vec4(vC*a,1.);}`
const FSQ_VS = `#version 300 es
out vec2 vUv; void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));vUv=p;gl_Position=vec4(p*2.-1.,.999,1.);}`
const BAKE_FS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o;` + NOISE + `
float fb2(vec3 p){float a=.5,v=0.;for(int i=0;i<6;i++){v+=a*n3(p);p=p*2.05+vec3(4.,1.,2.);a*=.5;}return v;}
void main(){float th=(vUv.x-.5)*6.28318,ph=vUv.y*3.14159;vec3 d=vec3(sin(ph)*cos(th),cos(ph),sin(ph)*sin(th));
 vec3 glowDir=normalize(vec3(.8,.05,.42));float toward=dot(d,glowDir)*.5+.5;float y=d.y;
 vec3 c=mix(vec3(.052,.052,.06),vec3(.009,.009,.013),smoothstep(0.,.62,max(y,0.)));
 c+=vec3(.42,.2,.08)*pow(toward,5.)*exp(-abs(y)*7.)*.36;c+=vec3(.05,.055,.08)*pow(1.-toward,3.)*exp(-abs(y)*3.5)*.8;
 c*=.88+.24*fb2(d*2.6+vec3(3.));if(y<0.)c=mix(c,vec3(.03,.033,.042),clamp(-y*5.,0.,1.));
 o=vec4(sqrt(clamp(c,0.,1.6)/1.6),1.);}`
const SKY_FS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uSky; uniform vec3 uF; uniform vec3 uR; uniform vec3 uU; uniform vec3 uSun; uniform float uTx; uniform float uTy;` + NOISE + `
void main(){vec2 p=vUv*2.-1.;vec3 d=normalize(uF+uR*p.x*uTx+uU*p.y*uTy);vec2 uv=vec2(atan(d.z,d.x)/6.28318+.5,acos(clamp(d.y,-1.,1.))/3.14159);vec3 c=textureLod(uSky,uv,0.).rgb;c=c*c*1.05;o=vec4(tone(c)+(h3(vec3(gl_FragCoord.xy,2.))-.5)*.012,1.);}`

function mkProg(gl: any, vs: string, fs: string) { const p = gl.createProgram(); [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach((q: any) => { const s = gl.createShader(q[0]); gl.shaderSource(s, q[1]); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); gl.attachShader(p, s) }); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u: any = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name) } return { p, u } }
function meshes() {
    const bv: number[] = [], f = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]
    f.forEach((n) => { const u = n[1] ? [1, 0, 0] : [0, 1, 0], v = cross(n, u); [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]].forEach((q) => bv.push(n[0] / 2 + (u[0] * q[0] + v[0] * q[1]) / 2, n[1] / 2 + (u[1] * q[0] + v[1] * q[1]) / 2, n[2] / 2 + (u[2] * q[0] + v[2] * q[1]) / 2, n[0], n[1], n[2])) })
    const cv: number[] = [], S = 14
    for (let i = 0; i < S; i++) { const a = (i / S) * 6.2832, b = ((i + 1) / S) * 6.2832, x1 = Math.cos(a), z1 = Math.sin(a), x2 = Math.cos(b), z2 = Math.sin(b); cv.push(x1 / 2, -0.5, z1 / 2, x1, 0, z1, x2 / 2, -0.5, z2 / 2, x2, 0, z2, x2 / 2, 0.5, z2 / 2, x2, 0, z2, x1 / 2, -0.5, z1 / 2, x1, 0, z1, x2 / 2, 0.5, z2 / 2, x2, 0, z2, x1 / 2, 0.5, z1 / 2, x1, 0, z1, 0, 0.5, 0, 0, 1, 0, x1 / 2, 0.5, z1 / 2, 0, 1, 0, x2 / 2, 0.5, z2 / 2, 0, 1, 0, 0, -0.5, 0, 0, -1, 0, x2 / 2, -0.5, z2 / 2, 0, -1, 0, x1 / 2, -0.5, z1 / 2, 0, -1, 0) }
    const sv: number[] = [], A = 12, B = 8, pt = (i: number, j: number) => { const t = (i / A) * 6.2832, p = (j / B) * 3.1416; return [Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t)] }
    for (let i = 0; i < A; i++) for (let j = 0; j < B; j++) [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j), pt(i + 1, j + 1), pt(i, j + 1)].forEach((q) => sv.push(q[0] / 2, q[1] / 2, q[2] / 2, q[0], q[1], q[2]))
    return [bv, cv, sv].map((a) => new Float32Array(a))
}

function worker(b: any, x: number, y: number, z: number, dir: number, ph: number, vest: V, moving = true) {
    const sw = moving ? Math.sin(ph) * 0.26 : 0, dx = Math.cos(dir), dz = Math.sin(dir), pants = C("#2b3640"), skin = C("#b98a69")
    beam(b[0], [x, y + 0.92, z], [x + dx * sw, y, z + dz * sw], 0.15, pants, 0); beam(b[0], [x, y + 0.92, z], [x - dx * sw, y, z - dz * sw], 0.15, pants, 0)
    box(b[0], x, y + 1.24, z, 0.42, 0.64, 0.42, vest, 0, NO, -dir)
    beam(b[0], [x - dz * 0.27, y + 1.5, z + dx * 0.27], [x - dz * 0.3 - dx * sw, y + 0.93, z + dx * 0.3 - dz * sw], 0.1, skin, 0); beam(b[0], [x + dz * 0.27, y + 1.5, z - dx * 0.27], [x + dz * 0.3 + dx * sw, y + 0.93, z - dx * 0.3 + dz * sw], 0.1, skin, 0)
    box(b[2], x, y + 1.73, z, 0.25, 0.27, 0.25, skin, 0); box(b[2], x, y + 1.82, z, 0.31, 0.2, 0.31, vest[0] > 0.7 ? C("#ffffff") : C("#f3c92b"), 0)
}
function dynamics(b: any, B: number, t: number) {
    const pantsY = C("#d8ff2e"), orange = C("#ff6a18"), steel = C("#555c60"), dark = C("#1b1d20"), yel = C(THEME.crane), yelD = scl(C(THEME.crane), 0.42), white = C("#eef0ee"), conc = C("#c9c5bb"), glass = C("#6da3c4"), blue = C("#2a659a")
    const cycle = B * 22 + t * 0.055, idx = Math.floor(cycle), u = cycle - idx
    const top = 0.4 + Math.min(Math.floor(B / 0.072), N) * FH
    const dropSeedX = -9 + ((idx * 37) % 18), dropSeedZ = -7 + ((idx * 23) % 14)
    const ang = (x: number, z: number) => Math.atan2(z - CZ, x - CX), rad = (x: number, z: number) => Math.hypot(x - CX, z - CZ)
    const a0 = ang(YARD[0], YARD[1]), r0 = rad(YARD[0], YARD[1]), a1 = ang(dropSeedX, dropSeedZ), r1 = rad(dropSeedX, dropSeedZ)
    const go = sm(0.28, 0.56, u), back = sm(0.84, 1, u), f = go - back * go
    const craneOn = B < 0.955, drop = sm(0.955, 0.995, B) * 72
    const theta = craneOn ? mix(a0, a1, f) : a1, rr = mix(r0, r1, f)
    let hy = mix(1.2, MASTH - 8, sm(0.06, 0.28, u)); hy = mix(hy, Math.max(top + 4.5, 7), sm(0.56, 0.7, u)); hy = mix(hy, MASTH - 8, sm(0.78, 0.86, u)); hy = mix(hy, 1.2, sm(0.9, 1, u))
    const sway = Math.sin(t * 1.25) * (0.08 + 0.55 * Math.sin(cl((u - 0.28) / 0.28) * 3.14)), c = Math.cos(theta), s = Math.sin(theta)
    const tx = CX + c * rr, tz = CZ + s * rr, J = MASTH + 0.6 - drop
    if (B < 0.992) {
        box(b[0], tx, J - 0.2, tz, 2, 0.35, 1.6, C("#30353a"), 0, NO, -theta)
        const hx = tx - s * sway, hz = tz + c * sway, hookY = hy - drop
        beam(b[0], [tx - c * 0.3, J - 0.3, tz - s * 0.3], [hx - c * 0.3, hookY + 0.8, hz - s * 0.3], 0.035, dark, 6); beam(b[0], [tx + c * 0.3, J - 0.3, tz + s * 0.3], [hx + c * 0.3, hookY + 0.8, hz + s * 0.3], 0.035, dark, 6)
        box(b[0], hx, hookY + 0.45, hz, 0.8, 0.7, 0.34, yel, 0, NO, -theta)
        if (craneOn && u > 0.06 && u < 0.72) {
            const kind = idx % 3, ly = hookY - 2.4, sp = kind === 1 ? 5 : 4
            ;[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach((q) => beam(b[0], [hx, hookY, hz], [hx + c * sp * q[0] - s * 0.7 * q[1], ly, hz + s * sp * q[0] + c * 0.7 * q[1]], 0.03, dark, 6))
            if (kind === 0) box(b[0], hx, ly - 0.2, hz, 11, 0.4, 2.6, conc, 1, NO, -theta)
            else if (kind === 1) for (let k = 0; k < 8; k++) box(b[0], hx - s * (k - 4) * 0.22, ly - 0.2 - (k % 2) * 0.13, hz + c * (k - 4) * 0.22, 12, 0.12, 0.12, C("#6a4a38"), 6, NO, -theta)
            else { box(b[0], hx, ly - 1.2, hz, 6, 2.4, 0.16, glass, 2, NO, -theta); box(b[0], hx, ly - 0.05, hz, 6.2, 0.14, 0.24, steel, 6, NO, -theta); box(b[0], hx, ly - 2.4, hz, 6.2, 0.14, 0.24, steel, 6, NO, -theta) }
        }
    }
    // Crane beacons and hook lamp
    if (B < 0.985) { const blink = Math.sin(t * 2.6) > 0.1 ? 1 : 0.12; G(b, CX + c * JIBL, J + 0.2, CZ + s * JIBL, 3.4, 1.2 * blink, 0.08 * blink, 0.05 * blink); G(b, CX, J + 11.2, CZ, 3.4, 1.2 * (1.12 - blink), 0.08, 0.05); G(b, CX - c * 20, J + 0.4, CZ - s * 20, 2.4, 1.0 * blink, 0.07 * blink, 0.04 * blink); G(b, tx, J - 0.6, tz, 2.6, 0.8, 0.68, 0.45) }
    // Floodlight halos
    if (B < 0.955) [[-40, 30], [42, -30], [40, 36], [-42, -34]].forEach((q) => G(b, q[0], 14.2, q[1], 12, 0.72, 0.62, 0.42))
    if (B > 0.94) { const a = sm(0.94, 0.965, B); for (const q of [[HX, HZ], [-HX, HZ], [HX, -HZ], [-HX, -HZ]]) G(b, q[0], 0.4 + N * FH + 1, q[1], 8, 0.7 * a, 0.36 * a, 0.12 * a); G(b, 0, 3.8, HZ + 2.6, 16, 0.5 * a, 0.36 * a, 0.2 * a) }
    // Welding arc with falling sparks
    WELD = [0, 0, 0, 0]
    if (B < 0.9 && B > 0.03 && Math.floor(t * 0.45) % 3 !== 2) {
        const wx = -8 + ((idx * 5) % 16), wy = top + 0.7, wz = HZ - 0.5, fl = 0.62 + 0.38 * Math.sin(t * 37) * Math.sin(t * 23)
        WELD = [wx, wy, wz, fl]; G(b, wx, wy, wz, 2 + 4.5 * fl, 0.8 * fl, 1.05 * fl, 1.7 * fl)
        for (let i = 0; i < 34; i++) { const sq = (t * (0.62 + (i % 5) * 0.08) + i / 34) % 1, a = i * 2.399, ra = 0.8 + (i % 7) * 0.32, fall = sq * sq * 9; G(b, wx + Math.cos(a) * sq * ra, wy + sq * 1.1 - fall, wz + 0.3 + Math.abs(Math.sin(a)) * sq * ra, 0.34 * (1 - sq) + 0.06, 1.8 * (1 - sq), 0.9 * (1 - sq), 0.22 * (1 - sq)) }
    }
    // Hoist cage
    if (B < 0.955 && top > 4) { const hoY = mix(1.6, top, (Math.sin(t * 0.35) + 1) / 2); box(b[0], HX + 2.8, hoY, 3, 2, 2.6, 2.2, C("#d9a52a"), 0) }
    // Deck crew
    if (B < 0.9 && B > 0.03) { [[-9, 0.26, orange, 0], [-2, 0.22, pantsY, 2], [8, 0.3, pantsY, 4]].forEach((q: any, k) => { const x = q[0] + Math.sin(t * q[1] + q[3]) * 4, d = Math.cos(t * q[1] + q[3]) >= 0 ? 0 : 3.14; worker(b, x, top, 7 - k * 6, d, t * 4 + k, q[2]) }) }
    // Ground crew and machines
    if (B < 0.95) {
        ;[[-34, 26, 0.16, 0, orange], [8, 34, 0.14, 1.7, pantsY], [28, -12, 0.12, 3, pantsY], [-20, -34, 0.1, 4, orange], [20, 12, 0.13, 2, orange], [-44, 16, 0.11, 5, pantsY], [14, -40, 0.09, 1, pantsY]].forEach((q: any, k) => { const v = Math.sin(t * q[2] + q[3]), x = q[0] + v * 8, d = Math.cos(t * q[2] + q[3]) >= 0 ? 0 : 3.14; worker(b, x, 0, q[1] + (k % 2) * 2, d, t * 3.8 + k, q[4]) })
        // Excavator: faces -x
        const ex = 44, ez = 34, cy = (t * 0.14 + B) % 1, dA = [29, 0.9], lift = [31, 8.5], dumpP = [39, 7.6]
        let dx = dA[0], dy = dA[1], load = 0
        if (cy < 0.25) { const a = sm(0, 0.25, cy); dx = mix(dumpP[0], dA[0], a); dy = mix(dumpP[1], dA[1], a) } else if (cy < 0.4) { load = sm(0.25, 0.4, cy); dx = mix(dA[0], 33, load); dy = mix(dA[1], 1.5, load) } else if (cy < 0.62) { const a = sm(0.4, 0.62, cy); dx = mix(33, lift[0], a); dy = mix(1.5, lift[1], a); load = 1 } else if (cy < 0.82) { const a = sm(0.62, 0.82, cy); dx = mix(lift[0], dumpP[0], a * 0.12); dy = mix(lift[1], dumpP[1], a); load = 1 - sm(0.72, 0.82, cy); } else { dx = dumpP[0]; dy = dumpP[1] }
        for (const z of [ez - 1.35, ez + 1.35]) { box(b[0], ex, 0.48, z, 5.4, 0.96, 0.75, dark, 0); for (const k of [-2.3, 2.3]) beam(b[1], [ex + k, 0.48, z - 0.4], [ex + k, 0.48, z + 0.4], 0.92, steel, 6) }
        box(b[1], ex, 1.2, ez, 2, 0.5, 2, steel, 6)
        box(b[0], ex + 0.6, 1.95, ez, 4.8, 1.25, 2.9, yel, 0); box(b[0], ex + 2.8, 1.95, ez, 0.85, 1.3, 2.95, C("#3a3d40"), 0); box(b[0], ex - 0.6, 3.25, ez + 0.65, 1.7, 1.75, 1.3, yel, 0); box(b[0], ex - 1.47, 3.3, ez + 0.65, 0.04, 1.45, 1.15, glass, 2); box(b[0], ex - 0.6, 3.3, ez + 1.32, 1.42, 1.45, 0.04, glass, 2)
        const Px = ex - 1.8, Py = 2.2, L1 = 6.8, L2 = 5.1, Dx = dx - Px, Dy = dy - Py, Dd = cl(Math.hypot(Dx, Dy), 2.4, L1 + L2 - 0.1), base = Math.atan2(Dy, Dx), off = Math.acos(cl((L1 * L1 + Dd * Dd - L2 * L2) / (2 * L1 * Dd), -1, 1)), e1 = [Px + Math.cos(base + off) * L1, Py + Math.sin(base + off) * L1], e2 = [Px + Math.cos(base - off) * L1, Py + Math.sin(base - off) * L1], E = e1[1] > e2[1] ? e1 : e2
        const nd = Math.hypot(dx - E[0], dy - E[1]) || 1, Q = [E[0] + ((dx - E[0]) / nd) * L2, E[1] + ((dy - E[1]) / nd) * L2]
        beam(b[0], [Px, Py, ez - 0.2], [E[0], E[1], ez - 0.2], 0.62, yel, 0, NO, 0.42); beam(b[0], [E[0], E[1], ez - 0.2], [Q[0], Q[1], ez - 0.2], 0.42, yelD, 0, NO, 0.3)
        const midA = [mix(Px, E[0], 0.2), mix(Py, E[1], 0.2) - 0.55], midB = [mix(Px, E[0], 0.72), mix(Py, E[1], 0.72) - 0.42]
        beam(b[1], [midA[0], midA[1], ez - 0.2], [mix(midA[0], midB[0], 0.55), mix(midA[1], midB[1], 0.55), ez - 0.2], 0.2, C("#3b3f42"), 6); beam(b[1], [mix(midA[0], midB[0], 0.55), mix(midA[1], midB[1], 0.55), ez - 0.2], [midB[0], midB[1], ez - 0.2], 0.1, C("#d9dddd"), 6)
        box(b[0], Q[0], Q[1] - 0.2, ez - 0.2, 1.05, 0.75, 1.15, C("#2b2e31"), 0); if (load > 0.05) box(b[2], Q[0], Q[1] + 0.18, ez - 0.2, 1.05 * load, 0.65 * load, 1.05 * load, C("#7b6144"), 3)
        if (cy > 0.2 && cy < 0.5) for (let i = 0; i < 9; i++) { const sq = (t * 0.32 + i / 9) % 1; G(b, dA[0] + i * 0.5 + sq * 3, 0.8 + sq * 3.4, ez + Math.sin(i * 2.1) * 2, 3 + sq * 6, 0.08 * (1 - sq), 0.06 * (1 - sq), 0.04 * (1 - sq)) }
        // Tipper truck
        const tkx = 40, tkz = 44
        box(b[0], tkx - 0.5, 0.95, tkz, 8.8, 0.34, 2.15, dark, 0); box(b[0], tkx - 1.7, 2.1, tkz, 5.4, 1.9, 2.35, C("#a8adae"), 6); box(b[0], tkx + 2.9, 2.05, tkz, 2.2, 2.45, 2.35, blue, 0); box(b[0], tkx + 3.97, 2.45, tkz, 0.05, 1.05, 2, glass, 2)
        if (B > 0.02) box(b[2], tkx - 1.7, 3, tkz, 4.8, 1.2 * cl(B * 2), 2, C("#7b6144"), 3)
        for (const x of [tkx - 3.2, tkx - 1.7, tkx + 2.9]) for (const z of [tkz - 1.15, tkz + 1.15]) beam(b[1], [x, 0.56, z - 0.25], [x, 0.56, z + 0.25], 1.12, dark, 0)
    }
    // Road traffic (concrete mixer plus city cars)
    const vehicle = (x: number, z: number, dirx: number, col: V, big: boolean) => { const y = 0.1, fx = dirx * (big ? 4.25 : 2.24), rx = -dirx * (big ? 4.8 : 2.24), ly = big ? 1.15 : 0.72; for (const q of [-0.68, 0.68]) { G(b, x + fx, y + ly, z + q, 2.8, 1.2, 1.04, 0.72); G(b, x + rx, y + ly, z + q, 1.5, 0.95, 0.06, 0.03); box(b[0], x + fx, y + ly, z + q, 0.08, 0.2, 0.34, [1, 0.94, 0.72], 8); box(b[0], x + rx, y + ly, z + q, 0.08, 0.16, 0.3, [1, 0.05, 0.03], 8) } if (big) { box(b[0], x, y + 0.9, z, 8.8, 0.34, 2.3, dark, 0); box(b[0], x + dirx * 3.2, y + 1.95, z, 1.9, 2.5, 2.35, white, 0); box(b[0], x + dirx * 4.19, y + 2.35, z, 0.05, 1.05, 2, glass, 2); beam(b[1], [x + dirx * 2, y + 2.55, z], [x - dirx * 3.9, y + 2.55, z], 2.45, C("#c7cac8"), 6); beam(b[1], [x + dirx * 0.5, y + 2.55, z], [x - dirx * 0.3, y + 2.55, z], 2.52, C("#c9632a"), 0); for (const k of [-3.1, -1.7, 3]) for (const q of [-1.15, 1.15]) beam(b[1], [x + dirx * k, y + 0.56, z + q - 0.25], [x + dirx * k, y + 0.56, z + q + 0.25], 1.12, dark, 0) } else { box(b[0], x, y + 0.65, z, 4.4, 0.7, 1.82, col, 0); box(b[0], x - dirx * 0.2, y + 1.22, z, 2.4, 0.62, 1.66, C("#2d4656"), 2); for (const k of [-1.35, 1.35]) for (const q of [-0.8, 0.8]) beam(b[1], [x + k, y + 0.35, z + q - 0.13], [x + k, y + 0.35, z + q + 0.13], 0.7, dark, 0) } }
    const lap = (sp: number, off: number) => ((t * sp + off) % 520) - 260
    vehicle(lap(9, 0), 63.5, 1, C("#fff"), true)
    ;[["#e8e8e4", 11, 60, 56.5, -1], ["#27527a", 13, 180, 63.5, 1], ["#8f2f2c", 10, 300, 56.5, -1], ["#d3d4d0", 12, 430, -56.5, 1], ["#32363b", 11, 90, -63.5, -1], ["#f2f2ee", 12, 240, -63.5, -1]].forEach((q: any) => { const raw = lap(q[1], q[2]); vehicle(q[4] < 0 ? -raw : raw, q[3], q[4], C(q[0]), false) })
}

interface Stage { eyebrow?: string; title?: string; text?: string }
interface Props { craneColor?: string; hoardingColor?: string; stoneColor?: string; hint?: string; levelLabel?: string; doneLabel?: string; inline?: boolean; scrollScreens?: number; canvasStage?: number; stages?: Stage[]; accent?: string; fontFamily?: string; style?: any }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ConstructionScroll3D(props: Props) {
    const { craneColor = "#eeb71c", hoardingColor = "#d9a70f", stoneColor = "#b8b2a4", hint = "Scroll to build ↓", levelLabel = "Level", doneLabel = "Complete", inline = false, canvasStage = 60, stages: stagesProp, accent = "#ffc400", fontFamily = '"Inter Variable", "Inter", "Inter Placeholder", system-ui, sans-serif', style } = props
    const stages = stagesProp && stagesProp.length ? stagesProp : DEFAULT_STAGES
    const rootRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null), capRefs = useRef<any[]>([]), barRef = useRef<HTMLDivElement>(null), floorRef = useRef<HTMLSpanElement>(null), angleRef = useRef<HTMLSpanElement>(null), hintRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current, root = rootRef.current; if (!canvas || !root) return
        const isCanvas = RenderTarget.current() === RenderTarget.canvas || RenderTarget.current() === RenderTarget.thumbnail || RenderTarget.current() === (RenderTarget as any).export
        const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        const gl: any = canvas.getContext("webgl2", { antialias: Math.min(window.innerWidth, window.innerHeight) >= 700, alpha: false, preserveDrawingBuffer: isCanvas, powerPreference: "high-performance" })
        if (!gl) return
        let stopped = false, raf = 0, cleanup: any = null
        const boot = () => { try {
            const small = Math.min(window.innerWidth, window.innerHeight) < 700
            const main = mkProg(gl, VS, FS), shadow = mkProg(gl, VS, SHADOW_FS), bake = mkProg(gl, FSQ_VS, BAKE_FS), skyP = mkProg(gl, FSQ_VS, SKY_FS)
            const empty = gl.createVertexArray()
            // Bake sky + clouds once for the background and reflections
            const SKYW = small ? 768 : 1536, skyTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, skyTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SKYW, SKYW / 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
            const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, skyTex, 0)
            gl.viewport(0, 0, SKYW, SKYW / 2); gl.disable(gl.DEPTH_TEST); gl.useProgram(bake.p); gl.bindVertexArray(empty); gl.drawArrays(gl.TRIANGLES, 0, 3)
            gl.bindTexture(gl.TEXTURE_2D, skyTex); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            // Shadow map
            const SM = small ? 1024 : 2048, smTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, smTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SM, SM, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            const smFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, smFb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, smTex, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE); gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            // Geometry
            const geo = meshes().map((d: any) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); return { b, n: d.length / 6 } })
            const stride = 20 * 4
            const makeVao = (mesh: number, inst: any) => { const v = gl.createVertexArray(); gl.bindVertexArray(v); gl.bindBuffer(gl.ARRAY_BUFFER, geo[mesh].b); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12); gl.bindBuffer(gl.ARRAY_BUFFER, inst); [[2, 3, 0], [3, 3, 12], [4, 3, 24], [5, 3, 36], [6, 3, 48], [7, 2, 60], [8, 3, 68]].forEach((q) => { gl.enableVertexAttribArray(q[0]); gl.vertexAttribPointer(q[0], q[1], gl.FLOAT, false, stride, q[2]); gl.vertexAttribDivisor(q[0], 1) }); gl.bindVertexArray(null); return v }
            THEME = { crane: toHex(craneColor, "#eeb71c"), hoarding: toHex(hoardingColor, "#d9a70f"), stone: toHex(stoneColor, "#b8b2a4") }
            const scene = buildScene(small)
            const group = (lists: number[][]) => lists.map((l, m) => { if (!l.length) return null; const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(l), gl.STATIC_DRAW); return { vao: makeVao(m, b), n: l.length / 20, mesh: m } }).filter(Boolean) as any[]
            const gStatic = group(scene.static), gMast = group(scene.mast), gUpper = group(scene.upper), gFar = group(scene.far)
            const dynB = [0, 1, 2].map((m) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, 4, gl.DYNAMIC_DRAW); return { b, vao: makeVao(m, b), mesh: m, n: 0 } })
            const dynL: any = [[], [], [], []]
            const glowP = mkProg(gl, GLOW_VS, GLOW_FS), glowB = gl.createBuffer(), glowV = gl.createVertexArray(); gl.bindVertexArray(glowV); gl.bindBuffer(gl.ARRAY_BUFFER, glowB); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 28, 12); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 28, 16); gl.bindVertexArray(null)
            const sun = nrm([0.8, 0.2, 0.42]), lightV = lookAt(scl(sun, 190), [0, 8, 0], [0, 1, 0]), lightP = ortho(112, 10, 420), lightVP = mul(lightP, lightV)
            let w = 0, h = 0, cur = isCanvas ? cl(canvasStage / 100) : 0, frameN = 0, last = 0, visible = true, quality = (navigator as any).hardwareConcurrency <= 4 || (navigator as any).deviceMemory <= 4 ? 0.8 : 1, shadowEvery = small ? 3 : 2, lastDraw = 0, slowSum = 0, slowN = 0
            const size = () => { const box = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5) * quality; w = Math.max(240, Math.round((box.width || 1200) * dpr)); h = Math.max(240, Math.round((box.height || 800) * dpr)); const cap = Math.min(1, Math.sqrt(2600000 / (w * h))); w = Math.round(w * cap); h = Math.round(h * cap); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h } }
            const ident = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
            const key = (arr: number[], p: number) => { const f = cl(p) * (arr.length - 1), i = Math.min(arr.length - 2, Math.floor(f)), q = f - i; return mix(arr[i], arr[i + 1], q * q * (3 - 2 * q)) }
            const drawAll = (P: any, B: number, mMast: any, mUpper: any, withFar = false) => {
                gl.uniform1f(P.u.uB, B); gl.uniformMatrix4fv(P.u.uModel, false, ident)
                gStatic.forEach((g) => { gl.bindVertexArray(g.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, geo[g.mesh].n, g.n) }); if (withFar) gFar.forEach((g) => { gl.bindVertexArray(g.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, geo[g.mesh].n, g.n) })
                dynB.forEach((g) => { if (g.n) { gl.bindVertexArray(g.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, geo[g.mesh].n, g.n) } })
                gl.uniformMatrix4fv(P.u.uModel, false, mMast); gMast.forEach((g) => { gl.bindVertexArray(g.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, geo[g.mesh].n, g.n) })
                gl.uniformMatrix4fv(P.u.uModel, false, mUpper); gUpper.forEach((g) => { gl.bindVertexArray(g.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, geo[g.mesh].n, g.n) })
            }
            const draw = (p: number, t: number) => {
                const B = inline ? sm(0.1, 0.8, p) : sm(0.04, 0.96, p)
                seedR = () => 0.5
                dynL[0].length = dynL[1].length = dynL[2].length = dynL[3].length = 0
                dynamics(dynL, B, t)
                dynB.forEach((g, m) => { g.n = dynL[m].length / 20; gl.bindBuffer(gl.ARRAY_BUFFER, g.b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynL[m]), gl.DYNAMIC_DRAW) })
                // Crane pose
                const cycle = B * 22 + t * 0.055, idx = Math.floor(cycle), u = cycle - idx, dx = -9 + ((idx * 37) % 18), dz = -7 + ((idx * 23) % 14), a0 = Math.atan2(YARD[1] - CZ, YARD[0] - CX), a1 = Math.atan2(dz - CZ, dx - CX), go = sm(0.28, 0.56, u), back = sm(0.84, 1, u), th = B < 0.955 ? mix(a0, a1, go - back * go) : a1, c = Math.cos(th), s = Math.sin(th), drop = sm(0.955, 0.995, B) * 72
                const mMast = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, CX, -drop, CZ, 1]), mUpper = new Float32Array([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, CX, -drop, CZ, 1])
                gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE)
                if (frameN++ % shadowEvery === 0 || isCanvas) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, smFb); gl.viewport(0, 0, SM, SM); gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.6, 3)
                    gl.useProgram(shadow.p); gl.uniformMatrix4fv(shadow.u.uVP, false, lightVP); drawAll(shadow, B, mMast, mUpper); gl.disable(gl.POLYGON_OFFSET_FILL)
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h)
                const asp = w / h, portrait = asp < 1, fov = inline ? 0.66 : portrait ? 1.05 : 0.68
                const ang = 0.68 + p * Math.PI * 2 + (reduce ? 0 : Math.sin(t * 0.17) * 0.012), R = inline ? mix(118, 100, Math.sin(p * Math.PI)) * (asp < 0.9 ? 1.2 : 1) : key([108, 74, 66, 80, 96], p) * (portrait ? 1.06 : 1), Hh = (inline ? mix(34, 14, p) : key([8, 18, 50, 24, 7], p)) + (reduce ? 0 : Math.sin(t * 0.33) * 0.3), Ty = inline ? 16 : key([15, 9, 15, 21, 17], p)
                const eye = [Math.cos(ang) * R, Hh, Math.sin(ang) * R], tgt = [0, Ty, 0], view = lookAt(eye, tgt, [0, 1, 0]), proj = persp(fov, asp, 0.5, 1600), vp = mul(proj, view)
                gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, skyTex); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, smTex)
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
                // Sky
                gl.disable(gl.DEPTH_TEST); gl.useProgram(skyP.p); gl.bindVertexArray(empty)
                const F = nrm(sub(tgt, eye)), Rr = nrm(cross(F, [0, 1, 0])), U = cross(Rr, F), ty = Math.tan(fov / 2)
                gl.uniform3fv(skyP.u.uF, F); gl.uniform3fv(skyP.u.uR, Rr); gl.uniform3fv(skyP.u.uU, U); gl.uniform3fv(skyP.u.uSun, sun); gl.uniform1f(skyP.u.uTx, ty * asp); gl.uniform1f(skyP.u.uTy, ty); gl.uniform1i(skyP.u.uSky, 0); gl.drawArrays(gl.TRIANGLES, 0, 3)
                // Scene
                gl.enable(gl.DEPTH_TEST); gl.useProgram(main.p); gl.uniformMatrix4fv(main.u.uVP, false, vp); gl.uniform3fv(main.u.uCam, eye); gl.uniform3fv(main.u.uSun, sun); gl.uniformMatrix4fv(main.u.uLight, false, lightVP); gl.uniform1i(main.u.uSky, 0); gl.uniform1i(main.u.uShadow, 1); gl.uniform1f(main.u.uTop, 0.4 + Math.min(N, Math.floor(B / 0.072)) * FH); gl.uniform1f(main.u.uFlood, 1 - sm(0.95, 0.97, B)); gl.uniform4f(main.u.uWeld, WELD[0], WELD[1], WELD[2], WELD[3])
                drawAll(main, B, mMast, mUpper, true)
                // Additive light halos and particles
                const glowData = new Float32Array(scene.glows.length + dynL[3].length); glowData.set(scene.glows); glowData.set(dynL[3], scene.glows.length)
                gl.useProgram(glowP.p); gl.uniformMatrix4fv(glowP.u.uVP, false, vp); gl.uniform1f(glowP.u.uH, h / (2 * Math.tan(fov / 2)))
                gl.bindVertexArray(glowV); gl.bindBuffer(gl.ARRAY_BUFFER, glowB); gl.bufferData(gl.ARRAY_BUFFER, glowData, gl.DYNAMIC_DRAW)
                gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false); gl.drawArrays(gl.POINTS, 0, glowData.length / 7); gl.depthMask(true); gl.disable(gl.BLEND)
                gl.bindVertexArray(null)
                // Overlay
                const floors = Math.min(N, Math.floor(B / 0.072)), deg = Math.round(((p * 360) % 360 + 360) % 360)
                if (floorRef.current) floorRef.current.textContent = (B >= 0.955 ? doneLabel : levelLabel + " " + String(floors).padStart(2, "0") + " / " + N)
                if (angleRef.current) angleRef.current.textContent = (p >= 0.999 ? 360 : deg) + "°"
                if (barRef.current) barRef.current.style.transform = "scaleX(" + p.toFixed(4) + ")"
                if (hintRef.current) hintRef.current.style.opacity = String(1 - sm(0.005, 0.04, p))
                const n = stages.length
                capRefs.current.forEach((el, i) => { if (!el) return; const a = i / n, b = (i + 1) / n, fi = i === 0 ? 1 : sm(a, a + 0.035, p), fo = i === n - 1 ? 1 : 1 - sm(b - 0.035, b, p), o = fi * fo; el.style.opacity = o.toFixed(3); el.style.transform = "translateY(" + ((1 - fi) * 22 - (1 - fo) * 22).toFixed(1) + "px)"; el.style.visibility = o < 0.01 ? "hidden" : "visible" })
            }
            const stick = canvas.parentElement as HTMLElement; if (!inline && (window as any).CSS && CSS.supports("height", "100svh")) stick.style.height = "100svh"
            const scrollP = () => { const r = root.getBoundingClientRect(); if (inline) return cl((window.innerHeight - r.top) / (window.innerHeight + r.height)); const span = r.height - stick.offsetHeight; return span > 1 ? cl(-r.top / span) : 0 }
            const frame = (now: number) => {
                if (stopped) return; raf = requestAnimationFrame(frame)
                if (!visible || document.hidden) return
                const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now
                const target = scrollP(), moving = Math.abs(target - cur) > 0.0004
                if (!moving && now - lastDraw < 32) return
                const gap = now - lastDraw; lastDraw = now
                cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5))
                draw(cur, now / 1000)
                if (moving && gap < 200) { slowSum += gap; slowN++; if (slowN >= 40) { if (slowSum / slowN > 27 && quality > 0.55) { quality *= 0.84; shadowEvery = 3; size() } slowSum = 0; slowN = 0 } }
            }
            size()
            const ro = new ResizeObserver(() => { size(); if (isCanvas) draw(cur, 18) }); ro.observe(canvas)
            const io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true }); io.observe(canvas)
            if (isCanvas) draw(cur, 18); else { canvas.style.opacity = "0"; canvas.style.transition = "opacity 1.2s ease"; raf = requestAnimationFrame(frame); setTimeout(() => { canvas.style.opacity = "1" }, 120) }
            cleanup = () => { stopped = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext() }
        } catch (err) { console.error("ConstructionScroll3D", err); (window as any).__c3dErr = String(err); root.setAttribute("data-error", String(err).slice(0, 600)) } }
        let lazy: any = null, bootId: any = 0
        if (inline && !isCanvas) { lazy = new IntersectionObserver((e) => { if (e[0].isIntersecting) { lazy.disconnect(); boot() } }, { rootMargin: "500px" }); lazy.observe(root) } else bootId = setTimeout(boot, isCanvas ? 0 : 80)
        return () => { clearTimeout(bootId); if (lazy) lazy.disconnect(); stopped = true; if (cleanup) cleanup() }
    }, [canvasStage, stages.length, inline, craneColor, hoardingColor, stoneColor])
    const mono = fontFamily
    return (
        <div ref={rootRef} style={{ position: "relative", width: "100%", height: inline ? "100%" : "500vh", background: "#0f1012", fontFamily, ...style }}>
            <div style={{ position: inline ? "relative" : "sticky", top: 0, width: "100%", height: inline ? "100%" : "100vh", overflow: "hidden" }}>
                <canvas ref={canvasRef} role="img" aria-label="A 3D construction site. As you scroll, a ten storey building rises while the camera circles it through 360 degrees." style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />
                <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: inline ? "radial-gradient(ellipse 62% 58% at 50% 50%,rgba(15,16,18,0) 45%,rgba(15,16,18,.7) 76%,#0f1012 100%)" : "radial-gradient(ellipse at 50% 44%,rgba(3,6,10,0) 46%,rgba(3,6,10,.6) 100%),linear-gradient(180deg,rgba(3,6,10,.35),rgba(3,6,10,0) 22%)" }} />
                {!inline && <>
                <div style={{ position: "absolute", left: "clamp(20px,3.4vw,40px)", right: "clamp(20px,3.4vw,40px)", bottom: "clamp(40px,7vh,72px)", pointerEvents: "none" }}>
                    {stages.map((s, i) => (
                        <div key={i} ref={(el) => { capRefs.current[i] = el }} style={{ position: i === 0 ? "relative" : "absolute", left: 0, bottom: 0, maxWidth: "min(520px,100%)", boxSizing: "border-box", padding: "clamp(14px,2.2vw,22px) clamp(16px,2.4vw,24px)", borderRadius: 4, background: "rgba(15,16,18,.84)", color: "#f4f2ec", opacity: i === 0 ? 1 : 0, boxShadow: "0 18px 50px rgba(20,35,50,.14)" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>{s.eyebrow}</div>
                            <div style={{ fontSize: "clamp(25px,3.2vw,40px)", lineHeight: 1.06, fontWeight: 600, letterSpacing: "-.025em", marginBottom: 8 }}>{s.title}</div>
                            <div style={{ fontSize: "clamp(14px,1.4vw,15px)", lineHeight: 1.45, color: "#b5b3ab" }}>{s.text}</div>
                        </div>
                    ))}
                </div>
                <div style={{ position: "absolute", top: "clamp(74px,11vh,92px)", right: "clamp(20px,3.4vw,40px)", display: "flex", gap: 8, pointerEvents: "none", fontFamily: mono, fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "#f4f2ec" }}>
                    <span ref={floorRef} style={{ background: "rgba(15,16,18,.84)", padding: "8px 12px", borderRadius: 3 }}>Level 00 / 10</span>
                    <span ref={angleRef} style={{ background: "rgba(15,16,18,.84)", padding: "8px 12px", borderRadius: 3, minWidth: 46, textAlign: "center" }}>0°</span>
                </div>
                <div ref={hintRef} style={{ position: "absolute", left: "clamp(20px,3.4vw,40px)", top: "clamp(74px,11vh,92px)", fontSize: 13, fontWeight: 600, color: "#f4f2ec", background: "rgba(15,16,18,.84)", padding: "8px 12px", borderRadius: 3, pointerEvents: "none" }}>{hint}</div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(255,255,255,.14)" }}><div ref={barRef} style={{ height: "100%", background: accent, transformOrigin: "0 50%", transform: "scaleX(0)" }} /></div>
                </>}
            </div>
        </div>
    )
}

const DEFAULT_STAGES: Stage[] = [
    { eyebrow: "Ground broken", title: "Every building starts in the dirt.", text: "Scroll to raise ten storeys and circle the site as it comes together." },
    { eyebrow: "Structure", title: "A frame you can trust.", text: "Columns, slabs and core go up floor by floor, in a sequence planned before day one." },
    { eyebrow: "Envelope", title: "Weathertight, panel by panel.", text: "The curtain wall closes the building while the trades keep moving inside it." },
    { eyebrow: "Handover", title: "Crane gone. Keys ready.", text: "The site clears, the landscape grows in, and the building is ready to use." },
]

