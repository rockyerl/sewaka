"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import {
  ListChecks, Wallet, Store, Users, CalendarDays, ScrollText, Crown, ArrowRight, Check,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

/* Brand: Royal Maroon #5B132B · Heritage Gold #D4AF37 · Ivory Silk #FDFBF7
   Deep Ebony #1C1917 · Sandstone Soft #F3EFE6 */

const features = [
  { icon: ListChecks, title: "Task & Checklist", description: "Kelola persiapan pernikahan dengan daftar tugas terstruktur dan template siap pakai." },
  { icon: Wallet, title: "Budget & Keuangan", description: "Rencanakan anggaran, catat pengeluaran, dan pantau laporan keuangan secara real-time." },
  { icon: Store, title: "Vendor Management", description: "Simpan vendor, bandingkan penawaran, kelola quotation dan pembayaran dalam satu tempat." },
  { icon: Users, title: "Tamu & Undangan", description: "Kelola daftar tamu, kirim undangan digital, dan pantau RSVP serta kehadiran." },
  { icon: CalendarDays, title: "Timeline & Rundown", description: "Buat rundown acara adat dan visualisasi timeline hari H pernikahan." },
  { icon: ScrollText, title: "Dokumen & Galeri", description: "Simpan kontrak, dokumen penting, dan galeri foto referensi pernikahan." },
];

const culturalFeatures = [
  { title: "Seserahan Tracker", description: "Kelola seserahan dan mahar adat sesuai tradisi keluarga." },
  { title: "Cultural Rundown", description: "Rundown acara pernikahan adat yang terstruktur dan detail." },
  { title: "Ensiklopedia Budaya", description: "Referensi tradisi adat Nusantara untuk inspirasi pernikahan." },
];

const plans = [
  { title: "Gratis", price: "Rp0", period: "selamanya", description: "Cocok untuk memulai perencanaan pernikahan.",
    features: ["1 Workspace", "Task & Checklist dasar", "Budget planning", "Guest management (100 tamu)", "Vendor directory"],
    cta: "Mulai Gratis", popular: false },
  { title: "Premium", price: "Rp99.000", period: "/bulan", description: "Untuk persiapan pernikahan yang lebih lengkap.",
    features: ["Semua fitur Gratis", "Workspace tanpa batas", "Guest management (500 tamu)", "Undangan digital", "QR Code & Check-in", "Export laporan", "Email notifikasi"],
    cta: "Coba 14 Hari Gratis", popular: true },
  { title: "Enterprise", price: "Hubungi Kami", period: "", description: "Untuk wedding planner dan organizer profesional.",
    features: ["Semua fitur Premium", "Tamu tanpa batas", "Multi-client management", "Branding kustom", "Priority support", "API access"],
    cta: "Hubungi Sales", popular: false },
];

const REGISTER = "/auth/signin?mode=register";

const css = `
/* Sewaka editorial hero — scoped, no additional dependencies. */
@keyframes sw-float-note{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-9px) rotate(-2deg)}}
@keyframes sw-orbit-breathe{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.55;transform:scale(1.035)}}
@keyframes sw-panel-enter{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
@keyframes sw-bar-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.sw-hero{position:relative;isolation:isolate;overflow:hidden;background:#FDFBF7}
.sw-hero::before{content:"";position:absolute;inset:0 0 0 52%;z-index:-2;background:radial-gradient(ellipse at 60% 40%,#792a43 0%,#5b132b 45%,#380c1b 100%)}
.sw-hero-glow{position:absolute;z-index:-1;right:5%;top:12%;width:400px;height:400px;filter:blur(80px);border-radius:50%;background:#d4af3726;animation:sw-drift 18s ease-in-out infinite;pointer-events:none}
.sw-heritage-pattern{position:absolute;z-index:-1;right:-40px;top:0;height:100%;width:48%;stroke:#d4af37;stroke-width:.6;opacity:.11;pointer-events:none}
.sw-hero-layout{max-width:1280px;margin:auto;display:grid;grid-template-columns:1.04fr 1fr;gap:70px;align-items:center;padding:72px 32px 82px}
.sw-hero-copy{padding-bottom:10px}
.sw-eyebrow{display:flex;align-items:center;gap:10px;font-size:10px;font-weight:650;letter-spacing:.23em;color:#80572f}
.sw-eyebrow>span{width:26px;height:1px;background:#b68d34}
.sw-hero h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(45px,4.8vw,68px);line-height:1.1;letter-spacing:-.045em;font-weight:400;color:#5b132b;margin:24px 0}
.sw-hero h1 em{font-weight:400;color:#98722d}
.sw-hero-description{font-size:14px;line-height:1.95;max-width:420px;color:#71635d}
.sw-hero-actions{display:flex;align-items:center;flex-wrap:wrap;gap:20px;margin-top:28px}
.sw-primary-cta{display:inline-flex;align-items:center;justify-content:center;gap:16px;background:linear-gradient(125deg,#76213e,#5b132b);padding:16px 22px;border:1px solid #8f4157;border-radius:8px;color:#fff9ed;font-size:12px;font-weight:600;box-shadow:0 8px 20px #5b132b20,inset 0 1px #ffffff25;transition:transform .25s,box-shadow .25s}
.sw-primary-cta:hover{transform:translateY(-3px);box-shadow:0 13px 25px #5b132b30}
.sw-secondary-cta{display:inline-flex;align-items:center;gap:9px;color:#5b132b;font-size:12px;font-weight:500}
.sw-secondary-cta>span{display:grid;place-items:center;width:30px;height:30px;border:1px solid #caba9b;border-radius:50%;transition:background .25s}
.sw-secondary-cta:hover>span{background:#efe6d6}
.sw-hero-reassurance{display:flex;gap:18px;font-size:10px;color:#796e62;margin-top:16px}
.sw-hero-reassurance>span{display:flex;align-items:center;gap:5px}
.sw-hero-reassurance svg{color:#9b7d36}
.sw-heritage-signature{display:flex;align-items:center;gap:15px;margin-top:38px;padding-top:24px;border-top:1px solid #d9cbb34d;max-width:400px}
.sw-signature-mark{font-size:38px;line-height:1;color:#ab873a}
.sw-heritage-signature strong{font:italic 16px Georgia,serif;color:#5b132b;font-weight:400}
.sw-heritage-signature p{font-size:10px;margin-top:5px;color:#8a7b6d}
.sw-hero-visual{min-width:0;scroll-margin-top:100px}
.sw-stage{position:relative;padding:25px 0 48px;perspective:1200px}
.sw-stage-label{color:#e7cd9a;font-size:8px;letter-spacing:.2em;margin:0 0 18px 14px;display:flex;gap:8px;align-items:center}
.sw-stage-label>span{width:5px;height:5px;background:#d4af37;border-radius:50%;box-shadow:0 0 12px #e8c354}
.sw-orbit{position:absolute;border:1px solid #d4af3755;border-radius:50%;z-index:-1;pointer-events:none;animation:sw-orbit-breathe 9s ease-in-out infinite}
.sw-orbit-one{width:540px;height:540px;left:-28px;top:-10px}
.sw-orbit-two{width:630px;height:630px;left:-73px;top:-55px;animation-delay:-4s}
.sw-dashboard{position:relative;transform:rotateY(-5deg) rotateX(2deg);border:1px solid #e5cfaa;border-radius:13px;background:#fdfbf7;box-shadow:16px 27px 0 -12px #d4af3729,0 35px 75px #16030b75,inset 0 1px #fff;overflow:hidden;transition:transform .65s cubic-bezier(.2,.7,.2,1)}
.sw-dashboard:hover,.sw-dashboard:focus-within{transform:rotateY(0) rotateX(0)}
.sw-windowbar{height:37px;border-bottom:1px solid #e8dfd2;display:flex;align-items:center;gap:15px;padding:0 17px;background:#f1ece3;color:#8c7f71;font-size:9px}
.sw-window-dots{font-size:19px;letter-spacing:2px;color:#baa789;line-height:0}
.sw-demo-label{margin-left:auto;font-size:7px;letter-spacing:.08em;background:#fffaf0;border:1px solid #dacdb5;border-radius:3px;padding:3px 5px;color:#856b39}
.sw-dash-content{padding:23px 23px 0}
.sw-couple-row{display:flex;align-items:center;justify-content:space-between}
.sw-couple-row p{font-size:7px;letter-spacing:.16em;color:#9b814e}
.sw-couple-row h2{font-family:Georgia,serif;font-size:29px;color:#5b132b;line-height:1.5;font-weight:400;letter-spacing:-.035em}
.sw-couple-row h2 em{color:#b18b3f;font-weight:400}
.sw-couple-row>div>span{font-size:9px;color:#8e8072}
.sw-monogram{width:55px;height:65px;border:1px solid #cfb97d;border-radius:50% 50% 5px 5px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:18px;color:#5b132b;background:linear-gradient(150deg,#fffaf0,#e9ddc4);box-shadow:inset 0 0 0 4px #f8f2e6}
.sw-monogram span{font-size:11px;color:#a78a45;margin:0 2px}
.sw-date-strip{display:flex;align-items:center;gap:8px;margin-top:18px;padding:11px 10px;background:#eee6d8;border:1px solid #e8dcc6;border-radius:5px;font-size:9px;color:#766047}
.sw-date-strip svg{color:#9d7d42}
.sw-date-pill{margin-left:auto;color:#5b132b;font-size:8px}
.sw-demo-tabs{display:flex;border-bottom:1px solid #e9e0d3;margin-top:19px;gap:5px}
.sw-demo-tabs button{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;flex:1;font-size:9px;padding:12px 2px;color:#877568;background:transparent;border:0;cursor:pointer;white-space:nowrap}
.sw-demo-tabs button[aria-selected=true]{color:#5b132b;font-weight:600}
.sw-demo-tabs button[aria-selected=true]::after{content:"";position:absolute;bottom:-1px;left:5px;right:5px;height:2px;background:#5b132b}
.sw-panel{height:263px;padding-top:20px}
.sw-panel-inner{animation:sw-panel-enter .45s ease both}
.sw-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:6px}
.sw-panel-heading p{font-size:7px;letter-spacing:.12em;color:#9b814e}
.sw-panel-heading h3{font:400 16px Georgia,serif;letter-spacing:-.01em;color:#5b132b;margin-top:5px}
.sw-progress-number{font-family:Georgia,serif;color:#5b132b;font-size:29px;line-height:1}
.sw-progress-number small{font-size:13px;color:#ad8f4a}
.sw-progress-track{height:4px;background:#eee7da;border-radius:4px;overflow:hidden;margin:13px 0 12px}
.sw-progress-track>span{display:block;height:100%;background:linear-gradient(90deg,#5b132b,#d4af37);border-radius:4px;transition:width .65s ease;animation:sw-bar-grow 1.2s ease both;transform-origin:left}
.sw-task{display:flex;position:relative;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid #eee8dd;cursor:pointer;font-size:10px;color:#54473d}
.sw-task input{position:absolute;opacity:0;width:16px;height:16px;left:0;cursor:pointer}
.sw-checkbox{display:grid;place-items:center;flex-shrink:0;width:15px;height:15px;border:1px solid #c9bfae;border-radius:4px;transition:background .3s,color .3s}
.sw-task input:focus-visible + .sw-checkbox{outline:2px solid #5b132b;outline-offset:3px}
.sw-task-done .sw-checkbox{background:#5b132b;border-color:#5b132b;color:#f8e8b8}
.sw-task-done>span:nth-last-child(2){color:#9d9080;text-decoration:line-through}
.sw-task-state{margin-left:auto;font-size:8px;color:#8b7a64}
.sw-panel-footnote{font-size:8px;line-height:1.6;color:#9b855d;margin-top:12px;display:flex;gap:6px;align-items:center}
.sw-panel-footnote>span{width:4px;height:4px;background:#a78d4e;border-radius:50%}
.sw-gold-icon{color:#b38b38}
.sw-budget-total{display:grid;grid-template-columns:1fr auto;margin-top:14px;align-items:center;font-size:9px;color:#8c7760;gap:5px}
.sw-budget-total strong{font:400 23px Georgia,serif;color:#5b132b}
.sw-budget-total small{grid-column:1/-1;font-size:8px}
.sw-budget-bars{display:grid;gap:10px;margin-top:15px}
.sw-budget-bars>div>div:first-child{display:flex;justify-content:space-between;font-size:9px;color:#7f6b55;margin-bottom:4px}
.sw-budget-bars strong{font-weight:500;color:#5b132b}
.sw-budget-track{height:5px;background:#eee5d7;border-radius:5px;overflow:hidden}
.sw-budget-track span{display:block;height:100%;background:#5b132b;animation:sw-bar-grow .9s ease both;transform-origin:left}
.sw-budget-bars>div:nth-child(2) .sw-budget-track span{background:#bd9651;animation-delay:.1s}
.sw-budget-bars>div:nth-child(3) .sw-budget-track span{background:#b85d43;animation-delay:.2s}
.sw-rituals{display:grid;margin-top:13px;gap:14px}
.sw-ritual{display:flex;position:relative;gap:12px}
.sw-ritual:not(:last-child)::after{content:"";position:absolute;left:11px;top:25px;height:33px;border-left:1px solid #d8c59e}
.sw-ritual-dot{display:grid;place-items:center;flex-shrink:0;border:1px solid #c8ad74;border-radius:50%;width:24px;height:24px;color:#93713a;font:12px Georgia,serif;background:#f4eddf}
.sw-ritual>div{flex:1}
.sw-ritual h4{font:15px Georgia,serif;color:#5b132b;display:flex;justify-content:space-between}
.sw-ritual h4>span{font:8px Arial,sans-serif;color:#9c845c}
.sw-ritual p{font-size:9px;line-height:1.6;color:#8b7969;margin-top:4px;max-width:260px}
.sw-dash-footer{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid #eae1d3;color:#9c8a73;font-size:7px;gap:5px}
.sw-dash-footer button{display:flex;align-items:center;gap:7px;color:#7c6440;cursor:pointer;background:none;border:0;padding:4px;font-size:8px}
.sw-floating-note{position:absolute;bottom:13px;left:-30px;display:flex;gap:12px;align-items:center;padding:17px 22px;border:1px solid #d2b773;border-radius:9px;background:linear-gradient(125deg,#f6eddb,#e4ce9b);box-shadow:0 18px 35px #25040f60;animation:sw-float-note 7s ease-in-out infinite;pointer-events:none}
.sw-note-icon{display:grid;place-items:center;width:37px;height:37px;color:#795523;border-radius:50%;border:1px solid #c8ad73}
.sw-floating-note small{display:block;font-size:7px;letter-spacing:.12em;color:#896b37;margin-bottom:4px}
.sw-floating-note strong{font:400 17px/1.2 Georgia,serif;color:#5b132b}
.sw-note-star{font-size:30px;color:#ae8c45;margin-left:14px}
.sw-preview-caption{display:flex;align-items:center;gap:10px;color:#e6cfac;font-size:8px;position:absolute;bottom:-18px;right:0;letter-spacing:.02em}
.sw-preview-caption>span{font-size:7px;letter-spacing:.1em;color:#bd9651}
.sw-hero-bottom{position:relative;max-width:1280px;margin:auto;display:flex;align-items:center;justify-content:space-between;padding:22px 32px;border-top:1px solid #b5986529}
.sw-hero-bottom>span{font-size:8px;letter-spacing:.18em;color:#9b814e}
.sw-hero-bottom>div{display:flex;gap:28px;align-items:center;margin-left:-110px}
.sw-hero-bottom>div>span{font:italic 20px Georgia,serif;color:#866f4c}
.sw-hero-bottom i{color:#bca36b;font-size:12px;font-style:normal}
.sw-hero-bottom>a{font-size:9px;color:#e6cfac;display:flex;gap:22px}
.sw-hero button:focus-visible,.sw-hero a:focus-visible{outline:2px solid #b78f36;outline-offset:4px}
@media(min-width:1400px){.sw-hero-layout{gap:90px;padding-top:85px;padding-bottom:95px}}
@media(max-width:1100px){.sw-hero-layout{gap:38px;padding-left:25px;padding-right:25px}.sw-hero h1{font-size:51px}.sw-dash-content{padding:18px 17px 0}.sw-hero-actions{gap:15px}.sw-primary-cta{padding:15px}.sw-floating-note{left:-16px}.sw-couple-row h2{font-size:26px}.sw-hero-bottom>div{margin-left:0;gap:16px}}
@media(max-width:800px){.sw-hero::before{inset:52% 0 0}.sw-hero-layout{grid-template-columns:1fr;gap:30px;padding:48px 24px 65px}.sw-hero-copy{max-width:540px;margin:auto;width:100%}.sw-hero h1{font-size:clamp(47px,8vw,66px)}.sw-hero-description{max-width:460px}.sw-hero-visual{width:100%;max-width:490px;margin:auto}.sw-stage{padding-top:25px}.sw-dashboard{transform:rotateY(-3deg)}.sw-heritage-pattern{top:52%;width:100%;height:50%}.sw-hero-glow{top:65%}.sw-hero-bottom{background:#400e20;padding:20px 24px;flex-wrap:wrap;gap:20px}.sw-hero-bottom>span{color:#c7a96a;font-size:7px}.sw-hero-bottom>div>span{color:#e6cfac;font-size:18px}.sw-hero-bottom>a{display:none}.sw-orbit-one{left:50%;transform:translateX(-50%);animation:none}.sw-orbit-two{display:none}.sw-heritage-signature{margin-top:28px}.sw-preview-caption{bottom:-20px}}
@media(max-width:420px){.sw-hero-layout{padding-left:19px;padding-right:19px}.sw-hero h1{font-size:46px}.sw-hero-description{font-size:13px}.sw-hero-actions{gap:18px}.sw-primary-cta{font-size:11px}.sw-secondary-cta{font-size:11px}.sw-stage-label{font-size:7px;letter-spacing:.15em;margin-left:4px}.sw-dash-content{padding:16px 14px 0}.sw-couple-row h2{font-size:26px}.sw-windowbar{gap:7px;padding:0 12px}.sw-demo-label{font-size:6px}.sw-floating-note{left:-4px;padding:14px 16px}.sw-floating-note strong{font-size:15px}.sw-note-star{margin-left:5px}.sw-task{font-size:9px}.sw-panel-heading h3{font-size:15px}.sw-date-strip{font-size:8px}.sw-hero-bottom>div{gap:14px}.sw-hero-bottom{gap:13px}.sw-hero-bottom>span{font-size:6px}.sw-dash-footer{font-size:6px}.sw-hero-reassurance{font-size:9px}}
@media(max-width:360px){.sw-hero h1{font-size:clamp(37px,12vw,42px);line-height:1.08}}
@media(prefers-reduced-motion:reduce){.sw-hero *,.sw-hero *::before,.sw-hero *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.sw-dashboard{transform:none}.sw-in{opacity:1}.sw-floating-note{transform:rotate(-3deg)}}

@keyframes sw-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes sw-shine{to{background-position:200% center}}
@keyframes sw-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-24px) scale(1.12)}}
@keyframes sw-petal{0%{transform:translateY(-10vh) translateX(0) rotate(0);opacity:0}10%{opacity:.8}100%{transform:translateY(110vh) translateX(var(--dx)) rotate(540deg);opacity:0}}
@keyframes sw-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes sw-sweep{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(320%) skewX(-20deg)}}
@keyframes sw-spin{to{transform:rotate(360deg)}}
.sw-in{opacity:0;animation:sw-up .85s cubic-bezier(.2,.7,.2,1) forwards}
.sw-gold{background:linear-gradient(100deg,#b8902a 20%,#f3dc8a 42%,#D4AF37 52%,#b8902a 80%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sw-shine 4.5s linear infinite}
.sw-reveal{opacity:0;transform:translateY(28px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.sw-reveal.on{opacity:1;transform:none}
.sw-card{position:relative;overflow:hidden}
.sw-card::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s;background:radial-gradient(320px circle at var(--mx,50%) var(--my,50%),rgba(212,175,55,.18),transparent 60%);pointer-events:none}
.sw-card:hover::before{opacity:1}
.sw-btn{position:relative;overflow:hidden}
.sw-btn::after{content:"";position:absolute;top:0;left:0;width:30%;height:100%;background:rgba(255,255,255,.35);transform:translateX(-120%) skewX(-20deg)}
.sw-btn:hover::after{animation:sw-sweep .9s ease}
.sw-ring{background:conic-gradient(from 0deg,#D4AF37,#5B132B,#D4AF37,#f3dc8a,#D4AF37);animation:sw-spin 6s linear infinite}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.sw-in,.sw-reveal{opacity:1;transform:none}}
`;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`sw-reveal ${on ? "on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const spot = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

function Petals({ count = 9 }: { count?: number }) {
  return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
            <span key={i} className="absolute top-0 block rounded-[100%_0_100%_0] bg-[#D4AF37]"
                  style={{
                    left: `${(i * 97) % 100}%`, width: 8 + (i % 3) * 3, height: 12 + (i % 3) * 4,
                    ["--dx" as string]: `${(i % 2 ? 1 : -1) * (40 + i * 6)}px`,
                    animation: `sw-petal ${14 + (i % 5) * 3}s linear ${i * 1.7}s infinite`,
                  }} />
        ))}
      </div>
  );
}

function ScrollBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => setP(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#D4AF37]" style={{ transform: `scaleX(${p})` }} />;
}

function Logo() {
  return <BrandLogo className="h-10 w-auto max-[360px]:h-8" priority />;
}

function Header() {
  return (
      <header className="sticky top-0 z-40 border-b border-[#5B132B]/10 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <div className="flex shrink-0 items-center gap-2 max-[360px]:gap-1">
            <Link href="/auth/signin?mode=login" className="rounded-lg px-4 py-2 text-sm text-[#1C1917] transition hover:bg-[#F3EFE6] max-[360px]:px-2 max-[360px]:text-xs">Masuk</Link>
            <Link href={REGISTER} className="sw-btn whitespace-nowrap rounded-lg bg-[#5B132B] px-4 py-2 text-sm font-medium text-[#FDFBF7] transition hover:bg-[#6d1a35] max-[360px]:px-2 max-[360px]:text-xs">Daftar Gratis</Link>
          </div>
          <ScrollBar />
        </div>
      </header>
  );
}

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}


const demoTabs = [
  { label: "Persiapan", icon: ListChecks },
  { label: "Anggaran", icon: Wallet },
  { label: "Prosesi adat", icon: CalendarDays },
];
const demoTasks = ["Tentukan pemaes & busana", "Siapkan perlengkapan siraman", "Konfirmasi lokasi akad", "Susun daftar seserahan"];

function WeddingPreview() {
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState([true, true, false, false]);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const completed = done.filter(Boolean).length;
  useEffect(() => {
    if (!playing || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setTab(value => (value + 1) % 3), 6500);
    return () => window.clearInterval(timer);
  }, [playing, paused]);
  function selectTab(index: number) { setTab(index); setPlaying(false); }
  return (
      <div className="sw-stage sw-in" style={{ animationDelay: ".35s" }}>
        <div className="sw-orbit sw-orbit-one" aria-hidden="true" />
        <div className="sw-orbit sw-orbit-two" aria-hidden="true" />
        <div className="sw-stage-label"><span /> TRADISI TERJAGA. RENCANA TERTATA.</div>
        <div className="sw-dashboard" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
          <div className="sw-windowbar"><span className="sw-window-dots" aria-hidden="true">•••</span><span>Ruang bahagia Anda</span><span className="sw-demo-label">DEMO INTERAKTIF</span></div>
          <div className="sw-dash-content">
            <div className="sw-couple-row"><div><p>SEBUAH PERJALANAN MENUJU</p><h2>Alya <em>&</em> Rangga</h2><span>Adat Jawa · Yogyakarta</span></div><div className="sw-monogram" aria-hidden="true">A<span>&</span>R</div></div>
            <div className="sw-date-strip"><CalendarDays width={15} height={15} /><span>Sabtu, 12 Desember 2026</span><span className="sw-date-pill">Hari bahagia</span></div>
            <div className="sw-demo-tabs" role="tablist" aria-label="Jelajahi fitur Sewaka">
              {demoTabs.map(({label, icon: Icon}, index) => <button key={label} id={`sw-tab-${index}`} role="tab" aria-selected={tab === index} aria-controls="sw-demo-panel" tabIndex={tab === index ? 0 : -1} onKeyDown={event => { const next = event.key === "ArrowRight" ? (tab + 1) % 3 : event.key === "ArrowLeft" ? (tab + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null; if (next !== null) { event.preventDefault(); selectTab(next); document.getElementById(`sw-tab-${next}`)?.focus(); } }} onClick={() => selectTab(index)}><Icon width={14} height={14} />{label}</button>)}
            </div>
            <div id="sw-demo-panel" role="tabpanel" aria-labelledby={`sw-tab-${tab}`} tabIndex={0} className="sw-panel">
              <div className="sw-panel-inner" key={tab}>
                {tab === 0 && <>
                  <div className="sw-panel-heading"><div><p>SELANGKAH LEBIH DEKAT</p><h3>Rencana kecil, hari yang besar.</h3></div><span className="sw-progress-number">{Math.round(completed / 4 * 100)}<small>%</small></span></div>
                  <div className="sw-progress-track"><span style={{ width: `${completed / 4 * 100}%` }} /></div>
                  <div className="sw-task-list">{demoTasks.map((task, index) => <label key={task} className={done[index] ? "sw-task sw-task-done" : "sw-task"}><input type="checkbox" checked={done[index]} onChange={() => { setPlaying(false); setDone(values => values.map((value, i) => i === index ? !value : value)); }} /><span className="sw-checkbox" aria-hidden="true">{done[index] && <Check width={12} height={12} />}</span><span>{task}</span><span className="sw-task-state">{done[index] ? "Selesai" : "Menanti"}</span></label>)}</div>
                  <p className="sw-panel-footnote"><span />{completed} dari 4 persiapan selesai · Coba centang tugas Anda</p>
                </>}
                {tab === 1 && <>
                  <div className="sw-panel-heading"><div><p>SETIAP DETAIL, TERENCANA</p><h3>Tenang dalam anggaran.</h3></div><Wallet width={25} height={25} className="sw-gold-icon" /></div>
                  <div className="sw-budget-total"><span>Alokasi anggaran</span><strong>Rp120.000.000</strong><small>Rp84.000.000 dialokasikan · 70%</small></div>
                  <div className="sw-budget-bars">{[{label:"Venue & jamuan",value:"Rp54 jt",width:64},{label:"Busana & rias adat",value:"Rp18 jt",width:22},{label:"Dokumentasi",value:"Rp12 jt",width:14}].map(item => <div key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><div className="sw-budget-track"><span style={{width:`${item.width}%`}} /></div></div>)}</div>
                  <p className="sw-panel-footnote"><span />Sisa anggaran Rp36.000.000</p>
                </>}
                {tab === 2 && <>
                  <div className="sw-panel-heading"><div><p>PAHAMI MAKNA DI SETIAP LANGKAH</p><h3>Tradisi yang bercerita.</h3></div><ScrollText width={25} height={25} className="sw-gold-icon" /></div>
                  <div className="sw-rituals">{[{time:"H−1",title:"Siraman",desc:"Doa dan penyucian diri menjelang hari pernikahan."},{time:"H−1",title:"Midodareni",desc:"Malam doa bersama dan restu keluarga."},{time:"Hari H",title:"Panggih",desc:"Pertemuan kedua mempelai setelah akad."}].map((item,index) => <div className="sw-ritual" key={item.title}><span className="sw-ritual-dot">{index + 1}</span><div><h4>{item.title}<span>{item.time}</span></h4><p>{item.desc}</p></div></div>)}</div>
                  <p className="sw-panel-footnote">Contoh alur Jawa; sesuaikan bersama keluarga & pemandu adat.</p>
                </>}
              </div>
            </div>
            <div className="sw-dash-footer"><span>Ilustrasi data pasangan & perencanaan</span><button onClick={() => setPlaying(value => !value)} aria-pressed={playing}>{playing ? "Jeda animasi" : "Putar demo"}<span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button></div>
          </div>
        </div>
        <div className="sw-floating-note"><span className="sw-note-icon"><Crown width={19} height={19} /></span><div><small>RUANG UNTUK TRADISI</small><strong>Adat bermakna.<br />Persiapan lebih tenang.</strong></div><span className="sw-note-star" aria-hidden="true">✧</span></div>
        <div className="sw-preview-caption"><span>01 — 03</span> Jelajahi demo, rasakan kemudahannya <ArrowRight width={14} height={14} /></div>
      </div>
  );
}

function HeroSection() {
  return (
      <section className="sw-hero">
        <div className="sw-hero-glow" aria-hidden="true" />
        <svg className="sw-heritage-pattern" viewBox="0 0 600 600" fill="none" aria-hidden="true"><defs><pattern id="sw-kawung" width="80" height="80" patternUnits="userSpaceOnUse"><ellipse cx="40" cy="20" rx="16" ry="25" transform="rotate(-45 40 20)"/><ellipse cx="60" cy="40" rx="16" ry="25" transform="rotate(45 60 40)"/><ellipse cx="40" cy="60" rx="16" ry="25" transform="rotate(-45 40 60)"/><ellipse cx="20" cy="40" rx="16" ry="25" transform="rotate(45 20 40)"/></pattern></defs><rect width="600" height="600" fill="url(#sw-kawung)" /></svg>
        <div className="sw-hero-layout">
          <div className="sw-hero-copy">
            <div className="sw-in sw-eyebrow" style={{animationDelay:".1s"}}><span /> DIGITAL WEDDING ASSISTANT</div>
            <h1 className="sw-in" style={{animationDelay:".2s"}}>Cinta Anda.<br />Keagungan adat.<br /><em>Satu cerita indah.</em></h1>
            <p className="sw-in sw-hero-description" style={{animationDelay:".35s"}}>Merangkai pernikahan adat, kini lebih tenang. Dari vendor pilihan hingga prosesi penuh makna—Sewaka menemani setiap langkah menuju hari bahagia Anda.</p>
            <div className="sw-in sw-hero-actions" style={{animationDelay:".5s"}}><Link href={REGISTER} className="sw-btn sw-primary-cta">Rencanakan Hari Bahagia <ArrowRight width={17} height={17} /></Link><a href="#fitur-preview" className="sw-secondary-cta" onClick={() => document.getElementById("sw-tab-0")?.focus({preventScroll:true})}><span aria-hidden="true">▷</span> Jelajahi Sewaka</a></div>
            <div className="sw-in sw-hero-reassurance" style={{animationDelay:".65s"}}><span><Check width={13} height={13} />Mulai gratis</span><span><Check width={13} height={13} />Tanpa kartu kredit</span></div>
            <div className="sw-in sw-heritage-signature" style={{animationDelay:".8s"}}><span className="sw-signature-mark" aria-hidden="true">✧</span><div><strong>Kemewahan Tradisi, Keabadian Cinta.</strong><p>Diciptakan untuk merayakan akar budaya Anda.</p></div></div>
          </div>
          <div id="fitur-preview" className="sw-hero-visual"><WeddingPreview /></div>
        </div>
        <div className="sw-hero-bottom"><span>BERAKAR PADA TRADISI</span><div><span>Jawa</span><i>✧</i><span>Sunda</span><i>✧</i><span>Minang</span></div><a href="#features">Temukan kemudahannya <span aria-hidden="true">↓</span></a></div>
      </section>
  );
}

const caseStudies = [
  {
    couple: "Rina & Budi — Jakarta",
    tradition: "Pernikahan Adat Jawa",
    quote: "Saya hampir menyerah mengurus seserahan dan keboncohan. Dengan Sewaka, semua checklist adat otomatis muncul dan saya tinggal ikuti. Keluarga besar juga bisa lihat progressnya.",
    impact: "Hemat 60 jam persiapan seserahan",
    avatar: "R",
  },
  {
    couple: "Dewi & Andi — Surabaya",
    tradition: "Pernikahan Adat Madura",
    quote: "Budget kami terbatas, tapi berkat tracking pengeluaran di Sewaka, kami tahu persis uang pergi ke mana. Ternyata ada 3 vendor yang bisa kami ganti dengan yang lebih murah tanpa mengurangi kualitas.",
    impact: "Budget tersimpan Rp 18 juta dari rencana awal",
    avatar: "D",
  },
  {
    couple: "Sari & Reza — Bandung",
    tradition: "Pernikahan Adat Sunda",
    quote: "Rundown Ngahiang, Pangruyat, dan Pupuan sangat rumit. Sewaka membantu kami buat timeline detail dan bagikan ke semua pihak. Hari H berjalan lancar tanpa kebingungan.",
    impact: "Hari H berjalan 100% sesuai jadwal",
    avatar: "S",
  },
];

function CaseStudiesSection() {
  return (
      <section id="stories" className="border-t border-[#5B132B]/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="CERITA MEREKA" sub="Bukan janji kosong — ini pengalaman nyata pasangan yang sudah menikah dengan bantuan Sewaka.">
            Lihat apa yang mereka <span className="text-[#b8902a]">rasakan</span>
          </SectionTitle>
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {caseStudies.map((cs, i) => (
                <Reveal key={cs.couple} delay={i * 150}>
                  <div onMouseMove={spot} className="sw-card group h-full flex flex-col rounded-2xl border border-[#5B132B]/10 bg-white/60 p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_20px_40px_-24px_#5B132B]">
                    {/* Impact badge */}
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-[#5B132B] self-start">
                      <span className="inline-block size-1.5 rounded-full bg-[#D4AF37]" />
                      {cs.impact}
                    </div>
                    {/* Quote */}
                    <blockquote className="flex-1 text-sm leading-relaxed text-[#1C1917]/75 italic">
                      &ldquo;{cs.quote}&rdquo;
                    </blockquote>
                    {/* Author */}
                    <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[#5B132B]/10">
                      <div className="flex size-10 items-center justify-center rounded-full bg-[#5B132B] text-sm font-medium text-[#FDFBF7]">
                        {cs.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1C1917]">{cs.couple}</div>
                        <div className="text-xs text-[#1C1917]/55">{cs.tradition}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}

function SectionTitle({ eyebrow, children, sub }: { eyebrow: string; children: ReactNode; sub: string }) {
  return (
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#a08f74]">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#5B132B] sm:text-4xl">{children}</h2>
        <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <p className="mt-4 text-[#1C1917]/65">{sub}</p>
      </Reveal>
  );
}

function FeaturesSection() {
  return (
      <section id="features" className="border-t border-[#5B132B]/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="FITUR LENGKAP" sub="Dari checklist hingga hari H, Sewaka menemani setiap langkah persiapan pernikahan Anda.">
            Semua yang Anda butuhkan,<br />dalam satu platform
          </SectionTitle>
          {/* How it works — before/after comparison */}
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0}>
              <div className="rounded-2xl border border-[#5B132B]/10 bg-white/60 p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#b42318]/10 px-3 py-1 text-xs font-semibold text-[#b42318]">
                  <span className="inline-block size-2 rounded-full bg-[#b42318]" /> Tanpa Sewaka
                </div>
                <ul className="space-y-3">
                  {[
                    "5+ aplikasi berbeda untuk kelola tamu, budget, dan vendor",
                    "Spreadsheet berantakan yang tidak ter-update",
                    "Stres mencari seserahan dan rundown adat di menit terakhir",
                    "Budget meledak karena tidak ada tracking pengeluaran",
                    "Keluarga besar bingung dengan jadwal dan tugas masing-masing",
                  ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#1C1917]/70">
                        <span className="mt-0.5 text-[#b42318]">✗</span>
                        {item}
                      </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#F3EFE6]/50 p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-semibold text-[#5B132B]">
                  <span className="inline-block size-2 rounded-full bg-[#D4AF37]" /> Dengan Sewaka
                </div>
                <ul className="space-y-3">
                  {[
                    "Semua dalam satu tempat: tamu, budget, vendor, tugas, adat",
                    "Template checklist otomatis sesuai hitung mundur hari H",
                    "Rundown adat detail yang bisa dibagikan ke keluarga besar",
                    "Tracking budget real-time — tahu persis berapa yang tersisa",
                    "Setiap orang tahu tugasnya — tidak ada yang terlewat",
                  ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#1C1917]/70">
                        <span className="mt-0.5 text-[#D4AF37]">✓</span>
                        {item}
                      </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Feature cards remain but repositioned */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 110}>
                  <div onMouseMove={spot} className="sw-card group h-full rounded-2xl border border-[#5B132B]/10 bg-white/60 p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_20px_40px_-24px_#5B132B]">
                    <div className="relative mb-4 inline-grid size-11 place-items-center rounded-xl bg-[#F3EFE6] text-[#5B132B] transition duration-300 group-hover:rotate-[-6deg] group-hover:bg-[#5B132B] group-hover:text-[#D4AF37]">
                      <f.icon className="size-5" strokeWidth={1.6} />
                    </div>
                    <h3 className="relative mb-2 font-medium text-[#1C1917]">{f.title}</h3>
                    <p className="relative text-sm leading-relaxed text-[#1C1917]/65">{f.description}</p>
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}

function CulturalSection() {
  return (
      <section className="border-t border-[#5B132B]/10 bg-[#F3EFE6] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="KHAS SEWAKA" sub="Fitur khusus yang menghormati dan melestarikan tradisi adat Indonesia dalam setiap persiapan pernikahan.">
            Dirancang untuk tradisi <span className="text-[#b8902a]">Nusantara</span>
          </SectionTitle>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {culturalFeatures.map((c, i) => (
                <Reveal key={c.title} delay={i * 130}>
                  <div onMouseMove={spot} className="sw-card h-full rounded-2xl border border-[#5B132B]/10 bg-[#FDFBF7] p-6 text-center transition duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_20px_40px_-24px_#5B132B]">
                    <Crown className="relative mx-auto mb-4 size-8 text-[#D4AF37]" strokeWidth={1.6} style={{ animation: `sw-pulse 3.2s ease-in-out ${i * 0.5}s infinite` }} />
                    <h3 className="relative mb-2 font-medium text-[#1C1917]">{c.title}</h3>
                    <p className="relative text-sm leading-relaxed text-[#1C1917]/65">{c.description}</p>
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}

function PricingSection() {
  return (
      <section id="pricing" className="border-t border-[#5B132B]/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="PAKET & HARGA" sub="Pilih paket yang sesuai dengan kebutuhan persiapan pernikahan Anda.">
            Mulai gratis, upgrade kapan saja
          </SectionTitle>
          <div className="mt-16 grid items-stretch gap-6 sm:grid-cols-3">
            {plans.map((p, i) => (
                <Reveal key={p.title} delay={i * 130} className="h-full">
                  <div className={`relative h-full rounded-2xl p-[1.5px] transition duration-300 hover:-translate-y-1.5 ${p.popular ? "overflow-hidden shadow-[0_24px_50px_-28px_#5B132B]" : "border border-[#5B132B]/10"}`}>
                    {p.popular && <div className="sw-ring absolute -inset-[100%]" />}
                    <div className="relative flex h-full flex-col rounded-[14px] bg-[#FDFBF7] p-6">
                      {p.popular && <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-lg bg-[#D4AF37] px-3 py-0.5 text-xs font-medium text-[#5B132B]">Paling Populer</span>}
                      <h3 className="mt-1 font-medium text-[#1C1917]">{p.title}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="font-serif text-3xl tracking-tight text-[#5B132B]">{p.price}</span>
                        {p.period && <span className="text-sm text-[#1C1917]/60">{p.period}</span>}
                      </div>
                      <p className="mt-2 text-sm text-[#1C1917]/65">{p.description}</p>
                      <Link href={REGISTER} className={`sw-btn mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition ${p.popular ? "bg-[#5B132B] text-[#FDFBF7] hover:bg-[#6d1a35]" : "border border-[#5B132B]/30 text-[#5B132B] hover:bg-[#F3EFE6]"}`}>
                        {p.cta}
                      </Link>
                      <ul className="mt-6 space-y-3">
                        {p.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" strokeWidth={2.5} />
                              <span className="text-[#1C1917]/70">{f}</span>
                            </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}

function CTASection() {
  return (
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#5B132B] px-6 py-16 text-center sm:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#D4AF37]/25 blur-3xl" style={{ animation: "sw-drift 12s ease-in-out infinite" }} />
            <Petals count={6} />
            <div className="relative">
              <h2 className="font-serif text-3xl font-normal tracking-tight text-[#FDFBF7] sm:text-4xl">
                Siap merangkai hari <span className="sw-gold">bahagia</span> Anda?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#FDFBF7]/75">Daftar sekarang dan mulai rencanakan pernikahan impian Anda bersama Sewaka.</p>
              <Link href={REGISTER} className="sw-btn group mt-8 inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-7 py-3 font-medium text-[#5B132B] transition hover:-translate-y-0.5 hover:brightness-110">
                Daftar Gratis Sekarang <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
  );
}

function Footer() {
  return (
      <footer className="border-t border-[#5B132B]/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Link href="/"><Logo /></Link>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#1C1917]/60">
              <Link href="/internals/changelog" className="transition hover:text-[#5B132B]">Changelog</Link>
              <Link href="/internals/special-thanks" className="transition hover:text-[#5B132B]">Special Thanks</Link>
            </div>
            <p className="text-sm text-[#1C1917]/60">© 2026 Sewaka. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
  );
}

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917]">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <Header />
        <HeroSection />
        <CaseStudiesSection />
        <FeaturesSection />
        <CulturalSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
  );
}
