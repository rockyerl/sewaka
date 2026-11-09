"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import {
  Flower2, ListChecks, Wallet, Store, Users, CalendarDays, ScrollText, Crown, ArrowRight, Check,
} from "lucide-react";

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
  return (
      <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-full border border-[#D4AF37] text-[#b8902a]">
        <Flower2 className="size-5" strokeWidth={1.6} />
      </span>
      <span className="font-serif text-[26px] tracking-tight text-[#5B132B]">sewaka<span className="text-[#D4AF37]">.</span></span>
    </span>
  );
}

function Header() {
  return (
      <header className="sticky top-0 z-40 border-b border-[#5B132B]/10 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin?mode=login" className="rounded-lg px-4 py-2 text-sm text-[#1C1917] transition hover:bg-[#F3EFE6]">Masuk</Link>
            <Link href={REGISTER} className="sw-btn rounded-lg bg-[#5B132B] px-4 py-2 text-sm font-medium text-[#FDFBF7] transition hover:bg-[#6d1a35]">Daftar Gratis</Link>
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

function HeroSection() {
  const floatingCards = [
    { icon: Check, text: "Seserahan selesai", delay: "0s", color: "#D4AF37" },
    { icon: Wallet, text: "Rp 18jt tersimpan", delay: "0.3s", color: "#5B132B" },
    { icon: CalendarDays, text: "Hari H lancar", delay: "0.6s", color: "#D4AF37" },
  ];

  return (
      <section className="relative overflow-hidden py-8 sm:py-12">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-[#D4AF37]/15 blur-3xl" style={{ animation: "sw-drift 14s ease-in-out infinite" }} />
          <div className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-[#5B132B]/8 blur-3xl" style={{ animation: "sw-drift 18s ease-in-out infinite reverse" }} />
        </div>
        <Petals />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Text Content */}
            <div className="max-w-xl">
              <p className="sw-in text-xs font-semibold tracking-[0.16em] text-[#a08f74]" style={{ animationDelay: ".1s" }}>
                KEMEWAHAN TRADISI, KEABADIAN CINTA
              </p>
              <h1 className="sw-in font-serif text-4xl font-normal leading-tight tracking-tight text-[#5B132B] sm:text-5xl lg:text-[3.6rem]" style={{ animationDelay: ".2s" }}>
                Pernikahan adat<br />
                <span className="sw-gold">tanpa kebingungan</span>
              </h1>
              <p className="sw-in mt-6 text-base leading-relaxed text-[#1C1917]/70 sm:text-lg" style={{ animationDelay: ".4s" }}>
                Bukan tentang fitur — ini tentang <strong className="text-[#1C1917]">hasil yang Anda dapatkan</strong>. Pasangan yang sudah menikah dengan Sewaka membuktikan: persiapan bisa tenang, terstruktur, dan menyenangkan.
              </p>

              {/* CTA Buttons */}
              <div className="sw-in mt-8 flex flex-col items-start gap-3 sm:flex-row" style={{ animationDelay: ".6s" }}>
                <Link href={REGISTER} className="sw-btn group inline-flex items-center gap-2 rounded-lg bg-[#5B132B] px-7 py-3 font-medium text-[#FDFBF7] shadow-[0_10px_30px_-10px_#5B132B] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_#5B132B]">
                  Mulai Gratis <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
                <Link href="#stories" className="rounded-lg border border-[#5B132B]/25 px-7 py-3 font-medium text-[#5B132B] transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:bg-[#F3EFE6]">
                  Lihat Cerita Mereka
                </Link>
              </div>

              {/* Stats Row */}
              <div className="sw-in mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2" style={{ animationDelay: ".8s" }}>
                <div className="rounded-xl border border-[#5B132B]/10 bg-white/80 p-4">
                  <div className="font-serif text-2xl tracking-tight text-[#5B132B] sm:text-3xl">
                    <AnimatedCounter target={120} suffix="+" />
                  </div>
                  <div className="mt-0.5 text-xs text-[#1C1917]/65">Pasangan telah menikah</div>
                </div>
                <div className="rounded-xl border border-[#5B132B]/10 bg-white/80 p-4">
                  <div className="font-serif text-2xl tracking-tight text-[#5B132B] sm:text-3xl">
                    <AnimatedCounter target={40} suffix="%" />
                  </div>
                  <div className="mt-0.5 text-xs text-[#1C1917]/65">Waktu terhemat</div>
                </div>
                <div className="rounded-xl border border-[#5B132B]/10 bg-white/80 p-4">
                  <div className="font-serif text-2xl tracking-tight text-[#5B132B] sm:text-3xl">
                    Rp <AnimatedCounter target={15} suffix="jt" />
                  </div>
                  <div className="mt-0.5 text-xs text-[#1C1917]/65">Budget tersimpan</div>
                </div>
                <div className="rounded-xl border border-[#5B132B]/10 bg-white/80 p-4">
                  <div className="font-serif text-2xl tracking-tight text-[#5B132B] sm:text-3xl">
                    <AnimatedCounter target={0} suffix="" />
                  </div>
                  <div className="mt-0.5 text-xs text-[#1C1917]/65">Stres hari H</div>
                </div>
              </div>
            </div>

            {/* Right: Visual Preview */}
            <div className="relative hidden lg:block">
              {/* Main dashboard mockup */}
              <div className="sw-in relative" style={{ animationDelay: ".5s" }}>
                {/* Browser chrome */}
                <div className="relative overflow-hidden rounded-2xl border border-[#5B132B]/15 bg-white shadow-[0_30px_60px_-30px_#5B132B/40]">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 border-b border-[#5B132B]/10 bg-[#F3EFE6]/60 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-[#b42318]/40" />
                      <span className="size-2.5 rounded-full bg-[#D4AF37]/60" />
                      <span className="size-2.5 rounded-full bg-[#5B132B]/30" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="mx-auto h-5 w-48 rounded-md bg-white/80" />
                    </div>
                  </div>
                  {/* Dashboard content mockup */}
                  <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F3EFE6]/40 p-6">
                    {/* Header */}
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className="h-4 w-32 rounded bg-[#5B132B]/15" />
                        <div className="mt-2 h-3 w-48 rounded bg-[#5B132B]/8" />
                      </div>
                      <div className="h-8 w-20 rounded-lg bg-[#5B132B]/20" />
                    </div>
                    {/* Stats cards */}
                    <div className="mb-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-[#D4AF37]/30 bg-white/80 p-3">
                        <div className="h-2 w-12 rounded bg-[#D4AF37]/40" />
                        <div className="mt-2 h-4 w-16 rounded bg-[#5B132B]/20" />
                      </div>
                      <div className="rounded-lg border border-[#5B132B]/10 bg-white/80 p-3">
                        <div className="h-2 w-12 rounded bg-[#5B132B]/20" />
                        <div className="mt-2 h-4 w-16 rounded bg-[#5B132B]/15" />
                      </div>
                      <div className="rounded-lg border border-[#5B132B]/10 bg-white/80 p-3">
                        <div className="h-2 w-12 rounded bg-[#5B132B]/20" />
                        <div className="mt-2 h-4 w-16 rounded bg-[#5B132B]/15" />
                      </div>
                    </div>
                    {/* Task list mockup */}
                    <div className="space-y-2">
                      {[80, 60, 45, 90, 30].map((w, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-[#5B132B]/8 bg-white/60 p-2.5">
                          <div className={`size-4 rounded-full border ${i < 3 ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#5B132B]/25"}`} />
                          <div className="h-2.5 flex-1 rounded bg-[#5B132B]/8" style={{ width: `${w}%` }} />
                        </div>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between">
                        <div className="h-2 w-20 rounded bg-[#5B132B]/12" />
                        <div className="h-2 w-10 rounded bg-[#D4AF37]/30" />
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#5B132B]/8">
                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#5B132B] to-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating impact cards */}
                {floatingCards.map((card, i) => (
                  <div
                    key={card.text}
                    className="sw-in absolute -right-4 -top-4 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-4 py-2.5 shadow-[0_10px_30px_-12px_#5B132B/30]"
                    style={{
                      animationDelay: `${1 + i * 0.2}s`,
                      top: `${i * 80 + 40}px`,
                      right: `${i === 1 ? '20px' : '0px'}`,
                    }}
                  >
                    <div className="flex size-7 items-center justify-center rounded-full" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                      <card.icon className="size-3.5" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-medium text-[#1C1917]">{card.text}</span>
                  </div>
                ))}

                {/* Floating couple avatar */}
                <div
                  className="sw-in absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_10px_30px_-12px_#5B132B/30]"
                  style={{ animationDelay: "1.4s" }}
                >
                  <div className="flex -space-x-2">
                    <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#5B132B] text-xs font-medium text-[#FDFBF7]">R</div>
                    <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#D4AF37] text-xs font-medium text-[#5B132B]">B</div>
                    <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#a08f74] text-xs font-medium text-white">+</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1C1917]">120+ pasangan</div>
                    <div className="text-[11px] text-[#1C1917]/55">sudah menikah</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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