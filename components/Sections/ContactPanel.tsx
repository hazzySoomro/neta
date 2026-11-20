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

interface Props { [key: string]: any; emailLabel?: string; phoneLabel?: string; officeLabel?: string; hoursLabel?: string; nameField?: string; emailField?: string; typeField?: string; typeOptions?: string; detailsField?: string; heading?: string; submit?: string; note?: string; email?: string; phone?: string; address?: string; hours?: string; accent?: string; style?: any }
const field = { width: "100%", boxSizing: "border-box", padding: "15px 14px", background: "var(--ivCard,#1c1d20)", border: "1px solid var(--ivBorder,#333436)", borderRadius: 2, color: "var(--ivText,#f4f2ec)", font: "inherit", fontSize: 16, outlineColor: "#ffc400" } as any
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ContactPanel({ ivCard, ivBorder, ivText, ivSoft, ivBg, ivLine, ivBtnText, ivMuted, ivFontPick, ivScale, ivBright, emailLabel = "Email", phoneLabel = "Phone", officeLabel = "Office", hoursLabel = "Hours", nameField = "Name", emailField = "Email", typeField = "Project type", typeOptions = "New build, Refurbishment, Extension, Groundworks", detailsField = "Project details", heading = "Talk to the site team", submit = "Send enquiry", note = "This opens your email app with your message ready to send.", email = "hello@example.com", phone = "+00 000 000 000", address = "123 Sample Street, Demo City", hours = "Monday to Friday, 8am to 6pm", accent = "#ffc400", style }: Props) {
    const root = useRef<HTMLDivElement>(null); useReveal(root)
    const send = (e: any) => { e.preventDefault(); const f = new FormData(e.target); const body = "Name: " + f.get("name") + "\nEmail: " + f.get("email") + "\nProject: " + f.get("type") + "\n\n" + f.get("message"); window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent("Project enquiry") + "&body=" + encodeURIComponent(body) }
    const label = { display: "block", fontSize: 14, fontWeight: 600, color: "var(--ivSoft,#d2d0c8)", marginBottom: 8 } as any
    return <section ref={root} style={{ width: "100%", boxSizing: "border-box", background: "var(--ivBg,#131416)", padding: "clamp(64px,8vw,110px) " + GUT, display: "flex", flexWrap: "wrap", gap: "clamp(36px,6vw,88px)", fontFamily: FONT, ...ivVars({ "--ivCard": ivCard, "--ivBorder": ivBorder, "--ivText": ivText, "--ivSoft": ivSoft, "--ivBg": ivBg, "--ivLine": ivLine, "--ivBtnText": ivBtnText, "--ivMuted": ivMuted, "--ivFont": ivFontPick?.fontFamily, "--ivScale": ivScale, "--ivBright": ivBright }), ...style }}>
        <div style={{ flex: "1 1 280px" }}>
            <h2 data-rise style={{ margin: "0 0 28px", fontSize: "clamp(32px,4vw,56px)", lineHeight: 1.04, fontWeight: 600, letterSpacing: "-.03em", color: "var(--ivText,#f4f2ec)" }}>{heading}</h2>
            {[[emailLabel, email, "mailto:" + email], [phoneLabel, phone, "tel:" + phone.replace(/\s/g, "")], [officeLabel, address], [hoursLabel, hours]].map((r: any, i) => <div key={i} data-rise style={{ padding: "16px 0", borderTop: "1px solid var(--ivLine,#2e2e30)" }}><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: accent, marginBottom: 5 }}>{r[0]}</div>{r[2] ? <a href={r[2]} style={{ color: "var(--ivText,#f4f2ec)", fontSize: 18, textDecoration: "none" }}>{r[1]}</a> : <div style={{ color: "var(--ivText,#f4f2ec)", fontSize: 18 }}>{r[1]}</div>}</div>)}
        </div>
        <form data-rise onSubmit={send} style={{ flex: "2 1 340px", minWidth: 0, display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))" }}><div><label style={label} htmlFor="cp-name">{nameField}</label><input id="cp-name" name="name" required autoComplete="name" style={field} /></div><div><label style={label} htmlFor="cp-email">{emailField}</label><input id="cp-email" name="email" type="email" required autoComplete="email" style={field} /></div></div>
            <div><label style={label} htmlFor="cp-type">{typeField}</label><select id="cp-type" name="type" style={field}>{typeOptions.split(",").map((o) => o.trim()).filter(Boolean).map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={label} htmlFor="cp-msg">{detailsField}</label><textarea id="cp-msg" name="message" rows={6} required style={{ ...field, resize: "vertical" }} /></div>
            <button type="submit" style={{ justifySelf: "start", padding: "17px 28px", background: accent, color: "var(--ivBtnText,#0f1012)", border: 0, borderRadius: 2, font: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>{submit} →</button>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ivMuted,#8f8d85)" }}>{note}</p>
        </form>
    </section>
}
