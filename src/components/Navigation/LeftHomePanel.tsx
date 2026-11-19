/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { ArrowLeft, ArrowRight, ArrowUpRight, Cpu } from 'lucide-react';
import heroStudioImg from '../../assets/images/viracode_hero_studio_1794583903201.jpg';
import engineVisualImg from '../../assets/images/viracode_engine_visual_1794583903156.jpg';
import googleSqlImg from '../../assets/images/viracode_google_sql_visual_1794650719853.jpg';
import googleWorkspaceImg from '../../assets/images/viracode_google_workspace_visual_1794671373619.jpg';
import { ViraCodeLogo } from '../Branding/ViraCodeLogo';
import type { DevFeedTab } from '../Workspace/VbpDevFeedWorkspace';

interface LeftHomePanelProps {
  workspace: ProjectWorkspace;
  openFilesCount: number;
  onReturnToEditor: () => void;
  onGoToExplorer: () => void;
  onOpenHelp: () => void;
  onOpenReleaseNotes: () => void;
  onOpenTimeline: () => void;
  onOpenDatabaseCenter: () => void;
  onOpenQuantumCenter: () => void;
  onOpenLocalFolder: () => void;
  onOpenCopyrights?: () => void;
  onOpenDevFeed?: (initialTab?: DevFeedTab) => void;
}

export const LeftHomePanel: React.FC<LeftHomePanelProps> = ({
  onReturnToEditor,
  onOpenHelp,
  onOpenReleaseNotes,
  onOpenTimeline,
  onOpenDatabaseCenter,
  onOpenQuantumCenter,
  onOpenCopyrights,
  onOpenDevFeed,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const containerRef = useRef<HTMLDivElement>(null);
  const hostedByRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const architectureRef = useRef<HTMLElement>(null);
  const googleSqlRef = useRef<HTMLElement>(null);
  const googleAppsRef = useRef<HTMLElement>(null);
  const highlightsRef = useRef<HTMLElement>(null);
  const v5SectionRef = useRef<HTMLElement>(null);
  const finaleRef = useRef<HTMLElement>(null);

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [drawProgress, setDrawProgress] = useState<number>(0);
  const [pageScrollRatio, setPageScrollRatio] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [revealed, setRevealed] = useState<Record<string, boolean>>({
    hostedBy: true,
    vision: true,
    architecture: false,
    googleSql: false,
    googleApps: false,
    highlights: false,
    finale: false,
  });

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDrawProgress(1);
      setRevealed({
        hostedBy: true,
        vision: true,
        architecture: true,
        googleSql: true,
        googleApps: true,
        highlights: true,
        finale: true,
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const updateScrollEffects = () => {
      if (!container) return;
      const top = container.scrollTop;
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
      setScrollY(top);
      setPageScrollRatio(Math.max(0, Math.min(1, top / maxScroll)));

      const section = v5SectionRef.current;
      if (section) {
        const cRect = container.getBoundingClientRect();
        const sRect = section.getBoundingClientRect();
        const relTop = sRect.top - cRect.top;
        const startY = cRect.height * 0.68;
        const endY = -(sRect.height - cRect.height * 0.96);
        const raw = (startY - relTop) / Math.max(1, startY - endY);
        setDrawProgress(Math.max(0, Math.min(1, raw)));
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollEffects);
    };

    updateScrollEffects();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-reveal-id');
            if (key) {
              setRevealed((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
            }
          }
        });
      },
      { root: container, threshold: 0.14 }
    );

    const targets: Array<[HTMLElement | null, string]> = [
      [hostedByRef.current, 'hostedBy'],
      [visionRef.current, 'vision'],
      [architectureRef.current, 'architecture'],
      [googleSqlRef.current, 'googleSql'],
      [googleAppsRef.current, 'googleApps'],
      [highlightsRef.current, 'highlights'],
      [finaleRef.current, 'finale'],
    ];
    targets.forEach(([el, id]) => {
      if (el) {
        el.setAttribute('data-reveal-id', id);
        observer.observe(el);
      }
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Strict non-overlapping sequential progress helper with smooth cubic easing
  const seq = (start: number, end: number) => {
    const t = Math.max(0, Math.min(1, (drawProgress - start) / Math.max(0.01, end - start)));
    return 1 - Math.pow(1 - t, 3);
  };

  // Helper to compute exact active spark coordinates along a circle
  const circleTip = (cx: number, cy: number, r: number, progress: number) => {
    const angle = progress * Math.PI * 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Helper to compute cubic Bezier tip for horizon arcs
  const cubicTip = (
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    t: number
  ) => {
    const u = 1 - t;
    const x =
      u * u * u * p0[0] +
      3 * u * u * t * p1[0] +
      3 * u * t * t * p2[0] +
      t * t * t * p3[0];
    const y =
      u * u * u * p0[1] +
      3 * u * u * t * p1[1] +
      3 * u * t * t * p2[1] +
      t * t * t * p3[1];
    return { x, y };
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const editorialHighlights = [
    {
      num: '01.',
      title: isTr ? 'Boş ve temiz başlangıç' : 'Clean, distraction-free start',
      desc: isTr
        ? 'Açılışta hazır yığınlar yerine yalnızca Default Project ve Sources alanlarıyla saf bir üretim tuvali.'
        : 'Starts cleanly with Default Project and Sources instead of pre-populated clutter.',
      action: onReturnToEditor,
    },
    {
      num: '02.',
      title: isTr ? 'Google SQL ve merkezde derinlik' : 'Google SQL & centered focus',
      desc: isTr
        ? 'Google Cloud SQL (PostgreSQL) uyumluluğu ve veritabanı düzenleyicisi gerektiğinde merkeze açılır, tek tıkla koda döner.'
        : 'Google Cloud SQL (PostgreSQL) compatibility and database editing expand into center stage when needed and return in one click.',
      action: onOpenDatabaseCenter,
    },
    {
      num: '03.',
      title: isTr ? 'Sürüm geçmişi ve rehberlik' : 'Release clarity and guidance',
      desc: isTr
        ? 'Release Timeline, v5.0.0 sürüm notları, ViraCode Assistant ve Lastik Ördek daima elinizin altında.'
        : 'Release Timeline, v5.0.0 notes, ViraCode Assistant, and Rubber Duck remain one click away.',
      action: onOpenTimeline,
    },
    {
      num: '04.',
      title: isTr ? 'VBP DevFeed & Google Uygulamaları' : 'VBP DevFeed & Google Apps',
      desc: isTr
        ? 'Google Chat, Gmail, Google Drive ve Google Meet tek tam ekran merkezde erişilebilir, yüksek kontrastlı ve onay korumalı olarak kontrol edilir.'
        : 'Control Google Chat, Gmail, Google Drive, and Google Meet in one full-screen, accessible, permission-gated studio.',
      action: () => onOpenDevFeed?.('overview'),
    },
  ];

  // Sequential pattern steps (drawn strictly one by one as user scrolls)
  const p1OuterRing = seq(0.0, 0.13);
  const p2HorizonArcTop = seq(0.13, 0.25);
  const p3HorizonArcBottom = seq(0.25, 0.37);
  const p4MiddleRing = seq(0.37, 0.49);
  const p5Diamond = seq(0.49, 0.61);
  const p6InnerSquare = seq(0.61, 0.73);
  const p7AxisRays = seq(0.73, 0.84);
  const p8InnerCrimson = seq(0.84, 0.94);
  const p9CenterBloom = seq(0.84, 1.0);

  const tip1 = circleTip(500, 260, 232, p1OuterRing);
  const tip2 = cubicTip([40, 260], [220, 62], [780, 62], [960, 260], p2HorizonArcTop);
  const tip3 = cubicTip([960, 260], [780, 458], [220, 458], [40, 260], p3HorizonArcBottom);
  const tip4 = circleTip(500, 260, 188, p4MiddleRing);
  const tip8 = circleTip(500, 260, 142, p8InnerCrimson);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPointer((prev) => ({ ...prev, active: false }))}
      className="h-full w-full overflow-y-auto bg-[#09090b] text-zinc-200 font-showcase-body antialiased selection:bg-red-600/40 selection:text-white relative"
    >
      {/* Interactive Cursor Spotlight Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: pointer.active ? 1 : 0,
          background: `radial-gradient(520px circle at ${pointer.x}px ${pointer.y}px, rgba(220, 38, 38, 0.085), transparent 65%)`,
        }}
      />

      {/* Subtle Ambient Atmospheric Crimson & Obsidian Backlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] overflow-hidden opacity-75"
      >
        <div className="viracode-aura mx-auto -mt-32 h-[420px] w-[760px] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.24)_0%,rgba(127,29,29,0.08)_45%,transparent_72%)] blur-3xl" />
      </div>

      {/* Editorial Three-Zone Website Header + Scroll Progress Hairline */}
      <header className="sticky top-0 z-20 bg-[#09090b]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Clean Brand Wordmark */}
          <button
            type="button"
            onClick={() => scrollToSection(visionRef)}
            className="font-showcase-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer hover:text-red-400 transition-colors flex items-center gap-2.5"
          >
            <ViraCodeLogo
              decorative
              className="!h-3.5 sm:!h-4"
            />
            <span>ViraCode</span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <button
              type="button"
              onClick={() => scrollToSection(visionRef)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isTr ? 'Vizyon' : 'Vision'}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(architectureRef)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isTr ? 'Mimari' : 'Architecture'}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(googleSqlRef)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Google SQL
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(googleAppsRef)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isTr ? 'Google Apps' : 'Google Apps'}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(v5SectionRef)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ViraCode 5
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onReturnToEditor}
              className="viracode-sheen-btn px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTr ? 'Editöre Dön' : 'Open Editor'}</span>
            </button>
          </div>
        </div>

        {/* Hairline Scroll Progress Bar */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full bg-gradient-to-r from-red-700 via-red-500 to-rose-400 origin-left transition-transform duration-75"
          style={{ transform: `scaleX(${pageScrollRatio})` }}
        />
      </header>

      {/* 1. Cinematic Full-Bleed Hero Banner with Subtle Scroll Parallax */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="relative max-w-[1180px] mx-auto px-6 sm:px-10 pt-14 pb-20 lg:pt-20 lg:pb-24">
          <div className="relative w-full aspect-[16/9] max-h-[540px] rounded-2xl overflow-hidden bg-zinc-950 group">
            {!imgErrors.hero ? (
              <img
                src={heroStudioImg}
                alt={isTr ? 'ViraCode IDE karanlık stüdyo çalışma ortamı' : 'ViraCode IDE dark engineering studio'}
                referrerPolicy="no-referrer"
                onError={() => setImgErrors((prev) => ({ ...prev, hero: true }))}
                style={{
                  transform: `translate3d(0, ${Math.min(36, scrollY * 0.08)}px, 0) scale(1.06)`,
                }}
                className="w-full h-full object-cover object-center transition-transform duration-300 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-red-950/30 to-zinc-900 flex items-center justify-center">
                <Cpu className="w-16 h-16 text-red-500/50" />
              </div>
            )}

            {/* Contrast Scrim & Subtle Crimson Rim Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/92 via-[#09090b]/45 to-transparent" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-red-600/20 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"
            />

            {/* Hero Editorial Copy Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14">
              <div className="max-w-2xl space-y-5">
                <p className="text-xs sm:text-sm font-medium text-red-400 tracking-wide">
                  {isTr ? 'VBP tarafından geliştirildi · ViraCode IDE 5.0.0' : 'Crafted by VBP · ViraCode IDE 5.0.0'}
                </p>

                <h1
                  style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.85rem)', textWrap: 'balance' }}
                  className="font-showcase-display font-bold leading-[1.06] tracking-tight text-white"
                >
                  {isTr
                    ? 'Karmaşayı geride bırakın. Saf hıza odaklanın.'
                    : 'Leave clutter behind. Focus on pure speed.'}
                </h1>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                  {isTr
                    ? 'ViraCode IDE; kod yazımı, gerçek zamanlı çalıştırma, Google Cloud SQL uyumluluğu ve veritabanı yönetimini sessiz ve kesintisiz bir çalışma yüzeyinde buluşturur.'
                    : 'ViraCode IDE brings writing code, live execution, Google Cloud SQL compatibility, and database management together on one quiet, uninterrupted surface.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-6">
                  <button
                    type="button"
                    onClick={onReturnToEditor}
                    className="viracode-sheen-btn px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 shadow-lg shadow-red-950/50 active:scale-[0.98]"
                  >
                    <span>{isTr ? 'Editöre Başla' : 'Launch Editor'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenReleaseNotes}
                    className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 underline underline-offset-4 decoration-zinc-700 hover:decoration-red-500"
                  >
                    <span>{isTr ? 'Yenilikleri keşfet' : 'Explore release notes'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Hosted Attribution Band right after the Hero Banner */}
      <section
        ref={hostedByRef}
        className="relative py-10 sm:py-12 border-b border-white/[0.06] bg-[#0b0b0e]/70 transition-all duration-700 ease-out"
        style={{
          opacity: revealed.hostedBy ? 1 : 0,
          transform: revealed.hostedBy ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
        }}
      >
        <div className="max-w-[960px] mx-auto px-6 sm:px-10 text-center">
          <p className="font-showcase-display text-base sm:text-xl font-medium tracking-wide text-zinc-200">
            A project hosted by{' '}
            <span className="text-white font-semibold">Ezel Deniz Soysal</span>{' '}
            and{' '}
            <span className="text-white font-semibold">Kaya Türkcan</span>
          </p>
        </div>
      </section>

      {/* 2. Unboxed Editorial Slogan Manifesto */}
      <section
        ref={visionRef}
        className="relative py-20 lg:py-28 border-b border-white/[0.06] transition-all duration-700 ease-out"
        style={{
          opacity: revealed.vision ? 1 : 0,
          transform: revealed.vision ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        }}
      >
        <div className="max-w-[920px] mx-auto px-6 sm:px-10 text-center space-y-6">
          <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <h2
            style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', textWrap: 'balance' }}
            className="font-showcase-display font-semibold tracking-tight text-white leading-tight"
          >
            {isTr
              ? 'Her piksel bir amaç taşır. Her araç yalnızca siz çağırdığınızda sahneye çıkar.'
              : 'Every pixel carries intent. Every tool steps forward only when called.'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {isTr
              ? 'Dağınık paneller ve gürültülü arayüzler yerine sade bir siyah-gri atmosfer, odaklı tipografi ve anında tepki veren modüler bir stüdyo.'
              : 'Instead of noisy panels and visual clutter, a composed obsidian canvas, focused typography, and an instantly responsive modular studio.'}
          </p>
        </div>
      </section>

      {/* 3. Visual Spread 01 — Engine & Execution */}
      <section
        ref={architectureRef}
        className="py-20 lg:py-28 border-b border-white/[0.06] transition-all duration-700 ease-out"
        style={{
          opacity: revealed.architecture ? 1 : 0,
          transform: revealed.architecture ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
        }}
      >
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
            <span className="text-xs font-medium text-red-400 tracking-wide">
              {isTr ? '01. Canlı Yürütme Mimarisi' : '01. Live Execution Architecture'}
            </span>
            <h3
              style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', textWrap: 'balance' }}
              className="font-showcase-display font-bold tracking-tight text-white leading-[1.12]"
            >
              {isTr
                ? 'Düşünceden çıktıya sıfır bekleme.'
                : 'Zero delay between thought and output.'}
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {isTr
                ? 'Çoklu kod sekmeleri arasında akıcı biçimde geçiş yapın, yazdığınız kodu gerçek zamanlı olarak çalıştırın ve ihtiyaç duyduğunuz özel JSON eklentilerini saniyeler içinde çalışma alanınıza dahil edin.'
                : 'Move effortlessly across multi-file tabs, execute code in real time, and bring custom JSON extensions into your workspace in seconds.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onReturnToEditor}
                className="text-sm font-semibold text-white hover:text-red-400 transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap group"
              >
                <span>{isTr ? 'Çalışma alanına geç' : 'Jump into workspace'}</span>
                <ArrowRight className="w-4 h-4 text-red-500 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative group">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_70%_50%,rgba(220,38,38,0.22),transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
            />
            <div className="relative w-full aspect-[16/9] lg:h-full rounded-2xl overflow-hidden bg-zinc-950">
              {!imgErrors.engine ? (
                <img
                  src={engineVisualImg}
                  alt={isTr ? 'Hassas titanyum ve kızıl optik prizma detayı' : 'Precision brushed titanium and crimson optical prism'}
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((prev) => ({ ...prev, engine: true }))}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090b]/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Visual Spread 02 — Google Cloud SQL Compatibility */}
      <section
        ref={googleSqlRef}
        className="py-20 lg:py-28 border-b border-white/[0.06] transition-all duration-700 ease-out"
        style={{
          opacity: revealed.googleSql ? 1 : 0,
          transform: revealed.googleSql ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
        }}
      >
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          <div className="lg:col-span-7 order-2 lg:order-1 relative group">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.22),transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
            />
            <div className="relative w-full aspect-[16/9] lg:h-full rounded-2xl overflow-hidden bg-zinc-950">
              {!imgErrors.googleSql ? (
                <img
                  src={googleSqlImg}
                  alt={isTr ? 'Google Cloud SQL uyumlu ilişkisel veri mimarisi' : 'Google Cloud SQL compatible relational data architecture'}
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((prev) => ({ ...prev, googleSql: true }))}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-bl from-zinc-950 via-red-950/30 to-zinc-900" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090b]/60 via-transparent to-transparent" />
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center space-y-5">
            <span className="text-xs font-medium text-red-400 tracking-wide">
              {isTr ? '02. Google SQL Uyumluluğu' : '02. Google SQL Compatibility'}
            </span>
            <h3
              style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', textWrap: 'balance' }}
              className="font-showcase-display font-bold tracking-tight text-white leading-[1.12]"
            >
              {isTr
                ? 'Google Cloud SQL ile tam uyumlu.'
                : 'Built for Google Cloud SQL compatibility.'}
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {isTr
                ? 'PostgreSQL tabanlı Google Cloud SQL altyapısı, Drizzle şema yönetimi ve Firebase kimlik doğrulamasıyla projelerinizi ve GitBox II depolarınızı kalıcı ilişkisel verilere doğrudan bağlayın.'
                : 'Connect your projects and GitBox II repositories directly to PostgreSQL-backed Google Cloud SQL, type-safe Drizzle schemas, and Firebase Authentication without breaking your flow.'}
            </p>
            <div className="pt-2 flex items-center gap-6">
              <button
                type="button"
                onClick={onOpenDatabaseCenter}
                className="text-sm font-semibold text-white hover:text-red-400 transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap group"
              >
                <span>{isTr ? 'Veritabanı Merkezini Aç' : 'Open Database Center'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Visual Spread 03 — Google Apps Accessibility & VBP DevFeed Integration */}
      <section
        ref={googleAppsRef}
        className="py-20 lg:py-28 border-b border-white/[0.06] transition-all duration-700 ease-out"
        style={{
          opacity: revealed.googleApps ? 1 : 0,
          transform: revealed.googleApps ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
        }}
      >
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
              <span className="text-xs font-medium text-red-400 tracking-wide">
                {isTr ? '03. Google Uygulamaları Erişilebilirliği' : '03. Google Apps Accessibility'}
              </span>
              <h3
                style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', textWrap: 'balance' }}
                className="font-showcase-display font-bold tracking-tight text-white leading-[1.12]"
              >
                {isTr
                  ? 'Google uygulamalarına engelsiz ve tek merkezden erişim.'
                  : 'Accessible Google apps, unified inside VBP DevFeed.'}
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {isTr
                  ? 'VBP DevFeed tam ekran alanı; Google Chat, Gmail, Google Drive ve Google Meet araçlarını yüksek kontrastlı tipografi, klavye odaklı gezinme, ekran okuyucu etiketleri ve açık onay diyaloglarıyla doğrudan geliştirici akışınıza taşır.'
                  : 'VBP DevFeed brings Google Chat, Gmail, Google Drive, and Google Meet into a full-screen, high-contrast, keyboard-accessible studio with screen-reader labels and explicit confirmation dialogs before every action.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => onOpenDevFeed?.('overview')}
                  className="text-sm font-semibold text-white hover:text-red-400 transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap group"
                >
                  <span>{isTr ? 'VBP DevFeed Alanını Aç' : 'Open VBP DevFeed Studio'}</span>
                  <ArrowRight className="w-4 h-4 text-red-500 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 relative group">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_60%_50%,rgba(220,38,38,0.22),transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
              />
              <div className="relative w-full aspect-[16/9] lg:h-full rounded-2xl overflow-hidden bg-zinc-950">
                {!imgErrors.googleApps ? (
                  <img
                    src={googleWorkspaceImg}
                    alt={
                      isTr
                        ? 'Google Chat, Gmail, Drive ve Meet erişilebilir çalışma ağı'
                        : 'Accessible Google Chat, Gmail, Drive, and Meet workspace mesh'
                    }
                    referrerPolicy="no-referrer"
                    onError={() => setImgErrors((prev) => ({ ...prev, googleApps: true }))}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-red-950/30 to-zinc-900" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090b]/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Direct Accessible Jump Rows for Google Chat, Gmail, Google Drive, Google Meet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden">
            {[
              {
                tab: 'googlechat' as DevFeedTab,
                title: 'Google Chat',
                meta: isTr ? 'Klavye Gezinimi · Ekip Alanları' : 'Keyboard Nav · Team Spaces',
                desc: isTr
                  ? 'Alanlar arasında hızlı geçiş yapın ve aktif kod parçacıklarını güvenle paylaşın.'
                  : 'Navigate team rooms cleanly and share code snippets with explicit send confirmation.',
              },
              {
                tab: 'gmail' as DevFeedTab,
                title: 'Gmail',
                meta: isTr ? 'Yüksek Kontrast · 3 Panelli Okuma' : 'High Contrast · 3-Pane Reader',
                desc: isTr
                  ? 'Okunaklı tipografiyle gelen kutusunu tarayın, etiketleyin ve kod ekiyle yanıtlayın.'
                  : 'Scan threads with high-legibility typography, filter labels, and reply with code.',
              },
              {
                tab: 'googledrive' as DevFeedTab,
                title: 'Google Drive',
                meta: isTr ? 'Tablo Düzeni · Editör Aktarımı' : 'Structured Table · Editor Sync',
                desc: isTr
                  ? 'Belgeleri önizleyin, dosya boyutlarını hizalı inceleyin ve tek tıkla editöre açın.'
                  : 'Preview files inline, inspect structured metadata, and open code straight into tabs.',
              },
              {
                tab: 'googlemeet' as DevFeedTab,
                title: 'Google Meet',
                meta: isTr ? 'Açık Erişim Kontrolleri · Geçmiş' : 'Clear Access Policies · History',
                desc: isTr
                  ? 'OPEN, TRUSTED veya RESTRICTED toplantı odaları açın ve kayıt geçmişini denetleyin.'
                  : 'Launch OPEN, TRUSTED, or RESTRICTED spaces and review structured session logs.',
              },
            ].map((item) => (
              <button
                key={item.tab}
                type="button"
                onClick={() => onOpenDevFeed?.(item.tab)}
                className="bg-[#09090b] hover:bg-[#111115] p-6 text-left flex flex-col justify-between space-y-4 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-red-500"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-showcase-display text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                      {item.title}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-red-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500">{item.meta}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
                <span className="text-xs font-medium text-red-400/90 group-hover:text-red-300">
                  {isTr ? 'DevFeed içinde aç' : 'Open in DevFeed'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Unboxed Editorial Feature Stream (Pure Flowing Typography Rows, No Boxes) */}
      <section
        ref={highlightsRef}
        className="py-20 lg:py-24 border-b border-white/[0.06] transition-all duration-700 ease-out"
        style={{
          opacity: revealed.highlights ? 1 : 0,
          transform: revealed.highlights ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
        }}
      >
        <div className="max-w-[1040px] mx-auto px-6 sm:px-10 space-y-10">
          <div className="max-w-xl space-y-2">
            <p className="text-xs font-medium text-red-400 tracking-wide">
              {isTr ? 'v5.0.0 Yenilikleri' : 'What is new in 5.0.0'}
            </p>
            <h3
              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', textWrap: 'balance' }}
              className="font-showcase-display font-bold tracking-tight text-white"
            >
              {isTr ? 'Daha az gürültü, daha yüksek ifade gücü.' : 'Less noise, sharper expression.'}
            </h3>
          </div>

          <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
            {editorialHighlights.map((item) => (
              <button
                key={item.num}
                type="button"
                onClick={item.action}
                className="w-full py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left group cursor-pointer transition-colors hover:bg-white/[0.02] px-3 -mx-3 rounded-lg"
              >
                <div className="flex items-baseline gap-5 md:w-5/12">
                  <span className="font-mono text-xs text-red-500/80 tabular-nums shrink-0">
                    {item.num}
                  </span>
                  <span className="font-showcase-display text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                </div>

                <p className="text-sm text-zinc-400 md:w-6/12 leading-relaxed">
                  {item.desc}
                </p>

                <span className="hidden md:flex items-center justify-end md:w-1/12 text-zinc-600 group-hover:text-red-400 transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5 Sticky Scroll-Track: Patterns Draw Strictly One By One & Reveal 'ViraCode 5: Launched on: 18.11.2026' */}
      <section
        ref={v5SectionRef}
        className="relative min-h-[1280px] border-b border-white/[0.06]"
      >
        <div className="sticky top-16 h-[calc(100vh-9rem)] min-h-[430px] max-h-[600px] flex flex-col items-center justify-center overflow-hidden px-6 sm:px-10">
          {/* Dynamic Crimson Halo Growing as Patterns Complete */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0.1 + p9CenterBloom * 0.9,
              transform: `scale(${0.86 + p9CenterBloom * 0.22})`,
            }}
          >
            <div className="h-[380px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.28)_0%,rgba(127,29,29,0.08)_52%,transparent_75%)] blur-3xl" />
          </div>

          <div className="relative w-full max-w-[1120px] h-[390px] sm:h-[490px] flex items-center justify-center">
            {/* Sequential One-By-One Scroll-Drawn SVG Geometry with Optical Glow */}
            <svg
              viewBox="0 0 1000 520"
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="v5CrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0.7" />
                </linearGradient>

                <linearGradient id="v5SilverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.42)" />
                </linearGradient>

                <filter id="v5Glow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="3.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Step 1: Outer Crimson Orbital Circle */}
              <circle
                cx="500"
                cy="260"
                r="232"
                fill="none"
                stroke="url(#v5CrimsonGrad)"
                strokeWidth="1.6"
                filter="url(#v5Glow)"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p1OuterRing}
                opacity={p1OuterRing > 0 ? 1 : 0}
              />
              {p1OuterRing > 0.01 && p1OuterRing < 0.99 && (
                <circle cx={tip1.x} cy={tip1.y} r="4" fill="#fca5a5" filter="url(#v5Glow)" />
              )}

              {/* Step 2: Upper Sweeping Horizon Bezier Arc */}
              <path
                d="M 40 260 C 220 62, 780 62, 960 260"
                fill="none"
                stroke="url(#v5CrimsonGrad)"
                strokeWidth="1.4"
                filter="url(#v5Glow)"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p2HorizonArcTop}
                opacity={p2HorizonArcTop > 0 ? 1 : 0}
              />
              {p2HorizonArcTop > 0.01 && p2HorizonArcTop < 0.99 && (
                <circle cx={tip2.x} cy={tip2.y} r="4" fill="#fca5a5" filter="url(#v5Glow)" />
              )}

              {/* Step 3: Lower Counter-Sweeping Bezier Arc */}
              <path
                d="M 960 260 C 780 458, 220 458, 40 260"
                fill="none"
                stroke="url(#v5SilverGrad)"
                strokeWidth="1.35"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p3HorizonArcBottom}
                opacity={p3HorizonArcBottom > 0 ? 1 : 0}
              />
              {p3HorizonArcBottom > 0.01 && p3HorizonArcBottom < 0.99 && (
                <circle cx={tip3.x} cy={tip3.y} r="3.5" fill="#ffffff" filter="url(#v5Glow)" />
              )}

              {/* Step 4: Middle Precision Ring + Gentle Orbit Calibration Ring */}
              <circle
                cx="500"
                cy="260"
                r="188"
                fill="none"
                stroke="url(#v5SilverGrad)"
                strokeWidth="1.2"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p4MiddleRing}
                opacity={p4MiddleRing > 0 ? 1 : 0}
              />
              <circle
                cx="500"
                cy="260"
                r="198"
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
                strokeDasharray="3 12"
                opacity={p4MiddleRing >= 0.92 ? (p4MiddleRing - 0.92) * 12.5 : 0}
                className="viracode-orbit-slow"
              />
              {p4MiddleRing > 0.01 && p4MiddleRing < 0.99 && (
                <circle cx={tip4.x} cy={tip4.y} r="3.5" fill="#e4e4e7" filter="url(#v5Glow)" />
              )}

              {/* Step 5: Rotated Architectural Diamond Lattice */}
              <polygon
                points="500,40 720,260 500,480 280,260"
                fill="none"
                stroke="url(#v5SilverGrad)"
                strokeWidth="1.25"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p5Diamond}
                opacity={p5Diamond > 0 ? 1 : 0}
              />

              {/* Step 6: Inner Crimson Frame Square */}
              <rect
                x="344"
                y="104"
                width="312"
                height="312"
                fill="none"
                stroke="rgba(239, 68, 68, 0.48)"
                strokeWidth="1.3"
                filter="url(#v5Glow)"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p6InnerSquare}
                opacity={p6InnerSquare > 0 ? 1 : 0}
              />

              {/* Step 7: Four Converging Axis Rays (stopping cleanly outside center text) */}
              <line
                x1="44"
                y1="260"
                x2="262"
                y2="260"
                stroke="url(#v5CrimsonGrad)"
                strokeWidth="1.4"
                filter="url(#v5Glow)"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p7AxisRays}
                opacity={p7AxisRays > 0 ? 1 : 0}
              />
              <line
                x1="956"
                y1="260"
                x2="738"
                y2="260"
                stroke="url(#v5CrimsonGrad)"
                strokeWidth="1.4"
                filter="url(#v5Glow)"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p7AxisRays}
                opacity={p7AxisRays > 0 ? 1 : 0}
              />
              <line
                x1="500"
                y1="16"
                x2="500"
                y2="112"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.2"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p7AxisRays}
                opacity={p7AxisRays > 0 ? 1 : 0}
              />
              <line
                x1="500"
                y1="504"
                x2="500"
                y2="408"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.2"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p7AxisRays}
                opacity={p7AxisRays > 0 ? 1 : 0}
              />

              {/* Step 8: Inner Crimson Harmonic Core Circle & Glowing Cardinal Nodes */}
              <circle
                cx="500"
                cy="260"
                r="142"
                fill="none"
                stroke="url(#v5CrimsonGrad)"
                strokeWidth="1.8"
                filter="url(#v5Glow)"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p8InnerCrimson}
                opacity={p8InnerCrimson > 0 ? 1 : 0}
              />
              {p8InnerCrimson > 0.01 && p8InnerCrimson < 0.99 && (
                <circle cx={tip8.x} cy={tip8.y} r="4.5" fill="#fecaca" filter="url(#v5Glow)" />
              )}

              {[
                { cx: 500, cy: 28 },
                { cx: 500, cy: 492 },
                { cx: 268, cy: 260 },
                { cx: 732, cy: 260 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r={2.5 + p8InnerCrimson * 2.2}
                  fill="#ef4444"
                  filter="url(#v5Glow)"
                  opacity={p8InnerCrimson}
                />
              ))}
            </svg>

            {/* Seamless Radial Sanctum & Centered Title (Zero Rectangular Box) */}
            <div
              className="relative z-10 text-center space-y-3 px-8 py-8 flex flex-col items-center"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(9,9,11,0.92) 38%, rgba(9,9,11,0.55) 72%, transparent 100%)',
                opacity: 0.1 + p9CenterBloom * 0.9,
                transform: `translate3d(0, ${(1 - p9CenterBloom) * 18}px, 0) scale(${0.93 + p9CenterBloom * 0.07})`,
              }}
            >
              <ViraCodeLogo
                decorative
                size="lg"
                glow
                style={{ opacity: p9CenterBloom }}
              />
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.8vw, 3.15rem)',
                  textWrap: 'balance',
                  textShadow: `0 0 ${Math.round(p9CenterBloom * 28)}px rgba(220, 38, 38, 0.35)`,
                }}
                className="font-showcase-display font-bold tracking-tight text-white leading-tight"
              >
                ViraCode <span className="text-red-500">5</span>: Launched on: 18.11.2026
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                {isTr
                  ? 'VBP ile yeni nesil mühendislik deneyimi şimdi yayında.'
                  : 'Next-generation engineering architecture by VBP is now live.'}
              </p>
            </div>
          </div>

          {/* Subtle Scroll Guidance (fades out once sequence completes) */}
          <p
            className="mt-2 text-[11px] font-medium text-zinc-500 tracking-wide transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - drawProgress * 1.35) }}
          >
            {isTr ? 'Desenleri tamamlamak için kaydırın' : 'Scroll to draw the sequence'}
          </p>
        </div>
      </section>

      {/* 6. Closing Slogan Finale & Quiet Website Footer */}
      <section
        ref={finaleRef}
        className="relative py-24 lg:py-32 overflow-hidden transition-all duration-700 ease-out"
        style={{
          opacity: revealed.finale ? 1 : 0,
          transform: revealed.finale ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(ellipse_at_bottom,rgba(220,38,38,0.2)_0%,transparent_70%)]"
        />

        <div className="relative max-w-[820px] mx-auto px-6 sm:px-10 text-center space-y-6">
          <h2
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', textWrap: 'balance' }}
            className="font-showcase-display font-bold tracking-tight text-white leading-[1.08]"
          >
            {isTr
              ? 'Fikirden üretime, tek nefeste.'
              : 'From first idea to production, in one breath.'}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
            {isTr
              ? 'Kodunuz sizi bekliyor. Üst çubuktaki geri dönüş düğmesiyle veya aşağıdaki adımla editöre dönebilirsiniz.'
              : 'Your workspace is ready. Return directly to the code editor whenever you are ready to build.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onReturnToEditor}
              className="viracode-sheen-btn px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2 shadow-xl shadow-red-950/60 active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isTr ? 'Kod Editörüne Dön' : 'Return to Code Editor'}</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-6 sm:px-10">
        <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <span className="font-showcase-display font-semibold text-zinc-300">
            VBP · ViraCode IDE 5.0.0
          </span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenHelp}
              className="hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isTr ? 'Yardım Merkezi' : 'Help Center'}
            </button>
            <button
              type="button"
              onClick={onOpenTimeline}
              className="hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isTr ? 'Zaman Çizelgesi' : 'Timeline'}
            </button>
            <button
              type="button"
              onClick={onOpenReleaseNotes}
              className="hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isTr ? 'Sürüm Notları' : 'Release Notes'}
            </button>
            {onOpenCopyrights && (
              <button
                type="button"
                onClick={onOpenCopyrights}
                className="hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Copyrights
              </button>
            )}
          </div>
          <span>© 2026 VBP</span>
        </div>
      </footer>
    </div>
  );
};
