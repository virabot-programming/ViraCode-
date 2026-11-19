/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { ViraCodeLogo } from './ViraCodeLogo';
import googleAiStudioLogo from '../../assets/copyrights/google_ai_studio_logo.png';
import vbpLogo from '../../assets/copyrights/logo_39_428x297.png';
import googleLogo from '../../assets/copyrights/logo_40_209x124.png';
import gemini38Logo from '../../assets/copyrights/logo_41_738x150.png';
import gemini4Logo from '../../assets/copyrights/logo_42_738x129.png';

type BlackBgMode = 'checker-flood' | 'checker-neutral' | 'white' | 'dark-gray' | 'black';

const BlackBgServiceLogo: React.FC<{
  src: string;
  alt: string;
  mode: BlackBgMode;
  className?: string;
}> = ({ src, alt, mode, className = '' }) => {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;

        const isOuterChecker = (idx: number) => {
          const r = d[idx];
          const g = d[idx + 1];
          const b = d[idx + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          return minC > 168 && maxC - minC < 40;
        };

        const visited = mode === 'checker-flood' ? new Uint8Array(w * h) : null;
        if (mode === 'checker-flood' && visited) {
          const queue = new Int32Array(w * h);
          let head = 0;
          let tail = 0;
          const pushIfBg = (x: number, y: number) => {
            const p = y * w + x;
            if (visited[p]) return;
            if (isOuterChecker(p * 4)) {
              visited[p] = 1;
              queue[tail++] = p;
            }
          };
          for (let x = 0; x < w; x++) {
            pushIfBg(x, 0);
            pushIfBg(x, h - 1);
          }
          for (let y = 0; y < h; y++) {
            pushIfBg(0, y);
            pushIfBg(w - 1, y);
          }
          while (head < tail) {
            const p = queue[head++];
            const x = p % w;
            const y = (p - x) / w;
            if (x > 0) pushIfBg(x - 1, y);
            if (x + 1 < w) pushIfBg(x + 1, y);
            if (y > 0) pushIfBg(x, y - 1);
            if (y + 1 < h) pushIfBg(x, y + 1);
          }
        }

        let minX = w;
        let minY = h;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const p = y * w + x;
            const i = p * 4;
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat = maxC - minC;

            let isBg = false;
            if (mode === 'checker-flood' && visited) {
              if (visited[p]) {
                isBg = true;
              }
            } else if (mode === 'checker-neutral') {
              if (sat < 38 && minC > 168) {
                isBg = true;
              }
            } else if (mode === 'white') {
              if (sat < 42 && minC > 190) {
                isBg = true;
              }
            } else if (mode === 'dark-gray') {
              if (maxC < 64 && sat < 24) {
                isBg = true;
              }
            } else if (mode === 'black') {
              if (maxC < 18) {
                isBg = true;
              }
            }

            if (isBg) {
              d[i] = 0;
              d[i + 1] = 0;
              d[i + 2] = 0;
              d[i + 3] = 255;
            } else {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Trim tightly around non-black artwork and composite on pure #000000 black
        if (maxX > minX && maxY > minY) {
          const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.12);
          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;
          const side = Math.max(cropW, cropH) + pad * 2;
          const out = document.createElement('canvas');
          out.width = side;
          out.height = side;
          const octx = out.getContext('2d');
          if (octx) {
            octx.fillStyle = '#000000';
            octx.fillRect(0, 0, side, side);
            const dx = Math.round((side - cropW) / 2);
            const dy = Math.round((side - cropH) / 2);
            octx.drawImage(canvas, minX, minY, cropW, cropH, dx, dy, cropW, cropH);
            if (!cancelled) {
              setProcessedSrc(out.toDataURL('image/png'));
            }
            return;
          }
        }

        if (!cancelled) {
          setProcessedSrc(canvas.toDataURL('image/png'));
        }
      } catch {
        // Fallback to raw image inside black container
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, mode]);

  return (
    <div className="bg-black rounded-lg flex items-center justify-center overflow-hidden">
      <img
        src={processedSrc || src}
        alt={alt}
        referrerPolicy="no-referrer"
        className={className}
      />
    </div>
  );
};

interface CopyrightsPageProps {
  onReturnToEditor: () => void;
  onOpenHome?: () => void;
}

export const CopyrightsPage: React.FC<CopyrightsPageProps> = ({
  onReturnToEditor,
  onOpenHome,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const v421Ref = useRef<HTMLElement>(null);
  const v480Ref = useRef<HTMLElement>(null);
  const v500Ref = useRef<HTMLElement>(null);
  const connectedAppsRef = useRef<HTMLElement>(null);
  const thanksRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);

  const [scrollRatio, setScrollRatio] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({
    hero: true,
    v421: false,
    v480: false,
    v500: false,
    connectedApps: false,
    thanks: false,
    links: false,
    partners: false,
  });

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setReducedMotion(true);
      setRevealed({
        hero: true,
        v421: true,
        v480: true,
        v500: true,
        connectedApps: true,
        thanks: true,
        links: true,
        partners: true,
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const updateScroll = () => {
      if (!container) return;
      const top = container.scrollTop;
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
      setScrollY(top);
      setScrollRatio(Math.max(0, Math.min(1, top / maxScroll)));
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
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
      { root: container, threshold: 0.08 }
    );

    const targets: Array<[HTMLElement | null, string]> = [
      [heroRef.current, 'hero'],
      [v421Ref.current, 'v421'],
      [v480Ref.current, 'v480'],
      [v500Ref.current, 'v500'],
      [connectedAppsRef.current, 'connectedApps'],
      [thanksRef.current, 'thanks'],
      [linksRef.current, 'links'],
      [partnersRef.current, 'partners'],
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const v421Credits = [
    { role: 'MAIN DEVELOPER', value: 'EZEL DENİZ SOYSAL' },
    { role: 'FIRST CODE', value: 'EZEL DENİZ SOYSAL' },
    { role: 'PUBLISHED IN', value: 'GOOGLE CLOUD' },
    { role: 'DEVELOPED IN', value: 'GOOGLE AI STUDIO' },
    { role: 'SECONDARY DEVELOPER', value: 'KAYA TÜRKCAN' },
    { role: 'PROMPT BY', value: 'MICROSOFT COPILOT' },
    { role: 'SERVER DOMAIN BY', value: 'GOOGLE AI STUDIO' },
    { role: 'AI MODEL', value: 'GEMINI 3.8 FLASH' },
  ];

  const v480Credits = [
    { role: 'AI MODEL', value: 'GEMINI 4.0 HYDROGEN' },
    { role: 'AI DEVELOPER', value: 'NEVZAT TUNA SOĞUKKUYU' },
    { role: 'ADDED IN', value: 'METABASE BY VBP' },
  ];

  const v500Credits = [
    { role: 'LAUNCHED ON', value: '18.11.2026' },
    { role: 'HOSTED BY', value: 'EZEL DENİZ SOYSAL & KAYA TÜRKCAN' },
    { role: 'WORKSPACE HUB', value: 'VBP DEVFEED FULL-SCREEN STUDIO' },
    { role: 'SQL ENGINE', value: 'GOOGLE CLOUD SQL (POSTGRESQL · EUROPE-WEST2)' },
  ];

  const connectedGoogleApps = [
    {
      name: 'Google Chat',
      scope: isTr ? 'VBP DevFeed Alanlar & Ekip Mesajlaşması' : 'VBP DevFeed Spaces & Team Messaging',
    },
    {
      name: 'Gmail',
      scope: isTr ? 'VBP DevFeed Gelen Kutusu, Arama, Taslak & Gönderim' : 'VBP DevFeed Inbox, Search, Drafts & Email Dispatch',
    },
    {
      name: 'Google Drive',
      scope: isTr ? 'VBP DevFeed Bulut Dosyaları & Editör Senkronizasyonu' : 'VBP DevFeed Cloud Files & Editor Sync',
    },
    {
      name: 'Google Meet',
      scope: isTr ? 'VBP DevFeed Toplantı Alanları & Erişim Kontrolü' : 'VBP DevFeed Meeting Spaces & Access Control',
    },
    {
      name: 'Google Cloud SQL',
      scope: isTr ? 'Yönetilen PostgreSQL İlişkisel Veritabanı (snappy-micron-r0w9t)' : 'Managed PostgreSQL Relational Database (snappy-micron-r0w9t)',
    },
    {
      name: 'Firebase Authentication',
      scope: isTr ? 'Google Oturum Doğrulama & Güvenli Kimlik Yönetimi' : 'Google Sign-In Verification & Session Identity',
    },
  ];

  const partnerServiceLogos: Array<{ title: string; src: string; mode: BlackBgMode }> = [
    {
      title: 'Google Chat',
      src: '/assets/aistudio/CHAT_a603ec84.jfif',
      mode: 'checker-flood',
    },
    {
      title: 'Gmail',
      src: '/assets/aistudio/GMAIL_3beac35f.jfif',
      mode: 'checker-neutral',
    },
    {
      title: 'Google Drive',
      src: '/assets/aistudio/DRIVE_a9285b2a.jfif',
      mode: 'black',
    },
    {
      title: 'Google Meet',
      src: '/assets/aistudio/MEET_857b53e2.jfif',
      mode: 'dark-gray',
    },
    {
      title: 'Google Cloud SQL',
      src: '/assets/aistudio/SQL_1593f059.jpeg',
      mode: 'white',
    },
  ];

  const thanksGroup = [
    'EZEL DENİZ SOYSAL',
    'KAYA TÜRKCAN',
    'CELİL GÖKTUĞ MADRAN',
    'YEKTA KEMAL SAYGILI',
    'NEVZAT TUNA SOĞUKKUYU',
    'AHMED SELİM YAŞAR',
    'ERTUĞRUL ARIKAN',
  ];

  const otherLinks = [
    {
      label: 'SCRATCH STUDIO',
      url: 'https://scratch.mit.edu/studios/52051953/',
    },
    {
      label: 'PRODUCT IN',
      url: 'https://viracode.ai.studio/',
    },
    {
      label: 'LIGHTHOUSE REPORT',
      url: 'https://pagespeed.web.dev/analysis/https-viracode-ai-studio/rbjyp343b2?hl=tr&form_factor=desktop',
    },
    {
      label: 'MAIN SITE',
      url: 'https://beta-tanitim.my.canva.site/virabotprogramming',
    },
    {
      label: 'DEVELOP HERE',
      url: 'https://aistudio.google.com/apps/ea3d14e2-6882-451b-9ebd-19ff17cd4f5d?showAssistant=true&showPreview=true',
    },
  ];

  const heroParallaxY = reducedMotion ? 0 : Math.min(28, scrollY * 0.08);
  const heroScale = reducedMotion ? 1 : Math.max(0.95, 1 - scrollY * 0.00025);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPointer((prev) => ({ ...prev, active: false }))}
      className="h-full w-full overflow-y-auto bg-[#000000] text-zinc-200 font-showcase-body antialiased selection:bg-red-600/40 selection:text-white relative"
    >
      {/* Interactive Cursor Crimson Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: pointer.active && !reducedMotion ? 1 : 0,
          background: `radial-gradient(500px circle at ${pointer.x}px ${pointer.y}px, rgba(220, 38, 38, 0.09), transparent 65%)`,
        }}
      />

      {/* Ambient Atmospheric Crimson Backlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] overflow-hidden opacity-75"
      >
        <div className="viracode-aura mx-auto -mt-36 h-[400px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.22)_0%,rgba(127,29,29,0.07)_48%,transparent_72%)] blur-3xl" />
      </div>

      {/* Top Sticky Minimal Return Bar + Hairline Scroll Progress */}
      <div className="sticky top-0 z-20 bg-black/88 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="font-showcase-display font-bold text-white tracking-wide">
              ViraCode · Copyrights
            </span>
            {onOpenHome && (
              <button
                type="button"
                onClick={onOpenHome}
                className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {isTr ? 'Ana Sayfa' : 'Home'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onReturnToEditor}
              className="viracode-sheen-btn px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-red-950/40 active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTr ? 'Editöre Dön' : 'Return to Editor'}</span>
            </button>
          </div>
        </div>

        {/* Hairline Scroll Progress Bar */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full bg-gradient-to-r from-red-800 via-red-500 to-rose-400 origin-left transition-transform duration-75"
          style={{ transform: `scaleX(${scrollRatio})` }}
        />
      </div>

      {/* Faithful Source Copyrights Document Presentation with Scroll & Hover Choreography */}
      <div className="relative z-10 max-w-[780px] mx-auto px-6 py-14 sm:py-20 text-center space-y-12">
        {/* Emblem + Centered ViraCode Typography with Subtle Precision Orbit Geometry */}
        <div
          ref={heroRef}
          className="relative flex flex-col items-center space-y-4 pt-2 pb-4 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.hero ? 1 : 0,
            transform: `translate3d(0, ${heroParallaxY}px, 0) scale(${heroScale})`,
          }}
        >
          {/* Decorative Ambient Geometric Halo Ring Behind Title */}
          <svg
            viewBox="0 0 600 180"
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-[480px] sm:w-[580px] h-40 opacity-50 select-none"
          >
            <defs>
              <linearGradient id="crArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(220,38,38,0)" />
                <stop offset="50%" stopColor="rgba(239,68,68,0.45)" />
                <stop offset="100%" stopColor="rgba(220,38,38,0)" />
              </linearGradient>
            </defs>
            <path
              d="M 40 120 Q 300 10 560 120"
              fill="none"
              stroke="url(#crArcGrad)"
              strokeWidth="1.2"
            />
            <path
              d="M 90 140 Q 300 45 510 140"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle cx="300" cy="65" r="2.5" fill="#ef4444" opacity="0.65" />
          </svg>

          <div className="relative flex items-center justify-center gap-4 sm:gap-5 group">
            <div className="transition-transform duration-500 ease-out group-hover:scale-105">
              <ViraCodeLogo
                decorative
                glow
                className="!h-8 sm:!h-11"
              />
            </div>
            <h1
              className="font-showcase-display text-4xl sm:text-6xl font-semibold tracking-tight leading-none text-[#e03e36] select-none transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              style={{
                textShadow: '0 0 28px rgba(220, 38, 38, 0.34)',
              }}
            >
              ViraCode
            </h1>
          </div>

          <p className="text-sm sm:text-base font-medium text-zinc-200 tracking-wide pt-2">
            v5.0.0 Copyrights
          </p>

          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-zinc-400/75 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.hero ? 1 : 0})` }}
          />

          <p className="text-xs sm:text-sm text-zinc-500 font-mono">
            [v1.0 to v 4.0 removed]
          </p>
        </div>

        {/* v4.2.1 Section */}
        <section
          ref={v421Ref}
          className="space-y-5 pt-2 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.v421 ? 1 : 0,
            transform: revealed.v421 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 22px, 0)',
          }}
        >
          <h2 className="text-sm font-bold text-red-500 tracking-wider">v4.2.1</h2>
          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-red-600/85 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.v421 ? 1 : 0})` }}
          />

          <div className="space-y-3 pt-1">
            {v421Credits.map((item, idx) => (
              <div
                key={`${item.role}-${item.value}`}
                className="group py-1.5 px-4 rounded-lg transition-all duration-300 ease-out hover:bg-red-950/15"
                style={{
                  opacity: revealed.v421 ? 1 : 0,
                  transform: revealed.v421 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                  transitionDelay: reducedMotion ? '0ms' : `${idx * 45}ms`,
                }}
              >
                <div className="text-[11px] sm:text-xs font-medium tracking-widest text-zinc-400 group-hover:text-red-300/90 transition-colors">
                  {item.role}
                </div>
                <div className="text-sm sm:text-base font-bold tracking-wide text-white group-hover:translate-y-[-1px] transition-transform duration-200">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* v4.8.0 Section */}
        <section
          ref={v480Ref}
          className="space-y-5 pt-4 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.v480 ? 1 : 0,
            transform: revealed.v480 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 22px, 0)',
          }}
        >
          <h2 className="text-sm font-bold text-red-500 tracking-wider">v4.8.0</h2>
          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-red-600/85 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.v480 ? 1 : 0})` }}
          />

          <div className="space-y-3 pt-1">
            {v480Credits.map((item, idx) => (
              <div
                key={`${item.role}-${item.value}`}
                className="group py-1.5 px-4 rounded-lg transition-all duration-300 ease-out hover:bg-red-950/15"
                style={{
                  opacity: revealed.v480 ? 1 : 0,
                  transform: revealed.v480 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                  transitionDelay: reducedMotion ? '0ms' : `${idx * 65}ms`,
                }}
              >
                <div className="text-[11px] sm:text-xs font-medium tracking-widest text-zinc-400 group-hover:text-red-300/90 transition-colors">
                  {item.role}
                </div>
                <div className="text-sm sm:text-base font-bold tracking-wide text-white group-hover:translate-y-[-1px] transition-transform duration-200">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* v5.0.0 Section */}
        <section
          ref={v500Ref}
          className="space-y-5 pt-4 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.v500 ? 1 : 0,
            transform: revealed.v500 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 22px, 0)',
          }}
        >
          <h2 className="text-sm font-bold text-red-500 tracking-wider">v5.0.0</h2>
          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-red-600/85 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.v500 ? 1 : 0})` }}
          />

          <div className="space-y-3 pt-1">
            {v500Credits.map((item, idx) => (
              <div
                key={`${item.role}-${item.value}`}
                className="group py-1.5 px-4 rounded-lg transition-all duration-300 ease-out hover:bg-red-950/15"
                style={{
                  opacity: revealed.v500 ? 1 : 0,
                  transform: revealed.v500 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                  transitionDelay: reducedMotion ? '0ms' : `${idx * 65}ms`,
                }}
              >
                <div className="text-[11px] sm:text-xs font-medium tracking-widest text-zinc-400 group-hover:text-red-300/90 transition-colors">
                  {item.role}
                </div>
                <div className="text-sm sm:text-base font-bold tracking-wide text-white group-hover:translate-y-[-1px] transition-transform duration-200">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Connected Google Apps directly beneath v5.0.0 */}
          <div
            ref={connectedAppsRef as React.RefObject<HTMLDivElement>}
            className="pt-8 space-y-5 transition-all duration-700 ease-out"
            style={{
              opacity: revealed.connectedApps ? 1 : 0,
              transform: revealed.connectedApps ? 'translate3d(0, 0, 0)' : 'translate3d(0, 18px, 0)',
            }}
          >
            <h3 className="text-sm font-bold text-red-500 tracking-wider uppercase">
              Connected Google Apps
            </h3>
            <div
              className="w-full h-px bg-gradient-to-r from-transparent via-red-600/70 to-transparent transition-transform duration-700 ease-out origin-center"
              style={{ transform: `scaleX(${revealed.connectedApps ? 1 : 0})` }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
              {connectedGoogleApps.map((app, idx) => (
                <div
                  key={app.name}
                  className="group p-3.5 rounded-xl border border-white/[0.08] bg-zinc-950/70 hover:border-red-500/40 hover:bg-red-950/15 transition-all duration-300 ease-out"
                  style={{
                    opacity: revealed.connectedApps ? 1 : 0,
                    transform: revealed.connectedApps ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                    transitionDelay: reducedMotion ? '0ms' : `${idx * 55}ms`,
                  }}
                >
                  <div className="text-sm font-bold tracking-wide text-white group-hover:text-red-300 transition-colors">
                    {app.name}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {app.scope}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THANKS Section */}
        <section
          ref={thanksRef}
          className="space-y-5 pt-4 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.thanks ? 1 : 0,
            transform: revealed.thanks ? 'translate3d(0, 0, 0)' : 'translate3d(0, 22px, 0)',
          }}
        >
          <h2 className="text-sm font-bold text-red-500 tracking-wider">THANKS</h2>
          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-red-600/85 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.thanks ? 1 : 0})` }}
          />

          <div className="space-y-5 pt-1">
            <div className="text-sm sm:text-base font-medium tracking-wider text-zinc-200">
              VIRABOT PROGRAMMING DEVELOPING GROUP
            </div>

            <div className="space-y-1.5 pt-1">
              {thanksGroup.map((name, idx) => (
                <div
                  key={name}
                  className="py-1 text-sm sm:text-base font-bold tracking-wide text-white hover:text-red-300 transition-all duration-300 ease-out hover:scale-[1.03]"
                  style={{
                    opacity: revealed.thanks ? 1 : 0,
                    transform: revealed.thanks ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
                    transitionDelay: reducedMotion ? '0ms' : `${idx * 55}ms`,
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OTHER LINKS Section */}
        <section
          ref={linksRef}
          className="space-y-5 pt-4 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.links ? 1 : 0,
            transform: revealed.links ? 'translate3d(0, 0, 0)' : 'translate3d(0, 22px, 0)',
          }}
        >
          <h2 className="text-sm font-bold text-red-500 tracking-wider">OTHER LINKS</h2>
          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-red-600/85 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.links ? 1 : 0})` }}
          />

          <div className="space-y-5 pt-1">
            {otherLinks.map((link, idx) => (
              <div
                key={link.label}
                className="space-y-1 transition-all duration-500 ease-out"
                style={{
                  opacity: revealed.links ? 1 : 0,
                  transform: revealed.links ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                  transitionDelay: reducedMotion ? '0ms' : `${idx * 60}ms`,
                }}
              >
                <div className="text-[11px] sm:text-xs font-medium tracking-widest text-zinc-400">
                  {link.label}
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#e6a49d] hover:text-red-300 underline underline-offset-4 decoration-[#e6a49d]/60 hover:decoration-red-400 break-all transition-colors"
                >
                  <span>{link.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Divider & Original Partner Logos with Smooth Hover Elevation */}
        <div
          ref={partnersRef}
          className="pt-4 space-y-10 transition-all duration-700 ease-out"
          style={{
            opacity: revealed.partners ? 1 : 0,
            transform: revealed.partners ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
          }}
        >
          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-zinc-400/75 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.partners ? 1 : 0})` }}
          />

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <img
              src={googleAiStudioLogo}
              alt="Google AI Studio"
              referrerPolicy="no-referrer"
              className="h-9 sm:h-11 w-auto object-contain select-none opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out"
            />
            <img
              src={vbpLogo}
              alt="VBP Virabot Programming"
              referrerPolicy="no-referrer"
              className="h-20 sm:h-24 w-auto object-contain select-none opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out"
            />
            <img
              src={googleLogo}
              alt="Google"
              referrerPolicy="no-referrer"
              className="h-16 sm:h-20 w-auto object-contain select-none opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <img
              src={gemini38Logo}
              alt="Gemini 3.8 Flash"
              referrerPolicy="no-referrer"
              className="h-10 sm:h-12 w-auto object-contain select-none opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out"
            />
            <img
              src={gemini4Logo}
              alt="Gemini 4 Hydrogen"
              referrerPolicy="no-referrer"
              className="h-9 sm:h-11 w-auto object-contain select-none opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 pt-2">
            {partnerServiceLogos.map((logo) => (
              <BlackBgServiceLogo
                key={logo.title}
                src={logo.src}
                alt={logo.title}
                mode={logo.mode}
                className="h-12 sm:h-14 w-auto object-contain select-none opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out"
              />
            ))}
          </div>

          <div
            className="w-full h-px bg-gradient-to-r from-transparent via-zinc-400/75 to-transparent transition-transform duration-700 ease-out origin-center"
            style={{ transform: `scaleX(${revealed.partners ? 1 : 0})` }}
          />

          <div className="text-left max-w-[660px] mx-auto space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed pb-4">
            <div className="space-y-1 text-center">
              <p className="font-semibold text-zinc-200">
                Copyright © 2026 VBP. All rights reserved.
              </p>
              <p>
                Unauthorized copying, modification, distribution, or reverse engineering of this software, via any medium, is strictly prohibited.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 text-xs text-zinc-400">
              <p>
                • This software utilizes Google Cloud SQL for database infrastructure. Google Cloud is a trademark of Google LLC.
              </p>
              <p>
                • Database connectors and client libraries used in this application (e.g., MySQL Connector, PostgreSQL Npgsql, Google Cloud SDK) are licensed under their respective open-source licenses (Apache License 2.0, MIT License, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
