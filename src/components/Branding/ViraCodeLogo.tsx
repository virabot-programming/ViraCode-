/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

export const VIRACODE_LOGO_SOURCE = '/assets/aistudio/viracodelogo_dfe8e49b.png';

let cachedCleanLogoUrl: string | null = null;
let pendingLogoPromise: Promise<string> | null = null;

function updateFavicon(href: string) {
  if (typeof document === 'undefined') return;
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link && link.href !== href) {
    link.href = href;
  }
}

export function getCleanViraCodeLogoUrl(): Promise<string> {
  if (cachedCleanLogoUrl) return Promise.resolve(cachedCleanLogoUrl);
  if (pendingLogoPromise) return pendingLogoPromise;

  pendingLogoPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(VIRACODE_LOGO_SOURCE);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = w;
        srcCanvas.height = h;
        const ctx = srcCanvas.getContext('2d');
        if (!ctx) {
          resolve(VIRACODE_LOGO_SOURCE);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        let minX = w;
        let maxX = -1;
        let minY = h;
        let maxY = -1;

        const PEAK_REF = 218;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const maxC = Math.max(r, g, b);

            if (maxC <= 6) {
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 0;
            } else {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              if (maxC < PEAK_REF) {
                const alphaFrac = maxC / PEAK_REF;
                data[idx] = Math.min(255, Math.round(r / alphaFrac));
                data[idx + 1] = Math.min(255, Math.round(g / alphaFrac));
                data[idx + 2] = Math.min(255, Math.round(b / alphaFrac));
                data[idx + 3] = Math.min(255, Math.round(alphaFrac * 255));
              } else {
                data[idx + 3] = 255;
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        if (maxX >= minX && maxY >= minY) {
          const pad = 2;
          const cx = Math.max(0, minX - pad);
          const cy = Math.max(0, minY - pad);
          const cw = Math.min(w - cx, maxX - minX + 1 + pad * 2);
          const ch = Math.min(h - cy, maxY - minY + 1 + pad * 2);

          const outCanvas = document.createElement('canvas');
          outCanvas.width = cw;
          outCanvas.height = ch;
          const outCtx = outCanvas.getContext('2d');
          if (outCtx) {
            outCtx.drawImage(srcCanvas, cx, cy, cw, ch, 0, 0, cw, ch);
            cachedCleanLogoUrl = outCanvas.toDataURL('image/png');
            updateFavicon(cachedCleanLogoUrl);
            resolve(cachedCleanLogoUrl);
            return;
          }
        }

        cachedCleanLogoUrl = srcCanvas.toDataURL('image/png');
        updateFavicon(cachedCleanLogoUrl);
        resolve(cachedCleanLogoUrl);
      } catch {
        resolve(VIRACODE_LOGO_SOURCE);
      }
    };
    img.onerror = () => resolve(VIRACODE_LOGO_SOURCE);
    img.src = VIRACODE_LOGO_SOURCE;
  });

  return pendingLogoPromise;
}

export function useViraCodeLogoSrc(): { src: string; isClean: boolean } {
  const [src, setSrc] = useState<string>(cachedCleanLogoUrl || VIRACODE_LOGO_SOURCE);
  const [isClean, setIsClean] = useState<boolean>(Boolean(cachedCleanLogoUrl));

  useEffect(() => {
    if (cachedCleanLogoUrl) {
      setSrc(cachedCleanLogoUrl);
      setIsClean(true);
      return;
    }
    let active = true;
    getCleanViraCodeLogoUrl().then((cleanUrl) => {
      if (active) {
        setSrc(cleanUrl);
        setIsClean(cleanUrl !== VIRACODE_LOGO_SOURCE);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { src, isClean };
}

interface ViraCodeLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  glow?: boolean;
  animated?: boolean;
  decorative?: boolean;
  style?: React.CSSProperties;
}

export const ViraCodeLogo: React.FC<ViraCodeLogoProps> = ({
  className = '',
  size = 'sm',
  glow = false,
  animated = false,
  decorative = false,
  style,
}) => {
  const { src, isClean } = useViraCodeLogoSrc();

  const sizeConfig = {
    xs: 'h-3.5 w-auto',
    sm: 'h-4 w-auto',
    md: 'h-6 w-auto',
    lg: 'h-9 w-auto',
    xl: 'h-12 w-auto',
    hero: 'h-16 w-auto',
  };

  const imgSize = sizeConfig[size] || sizeConfig.sm;

  return (
    <img
      src={src}
      alt={decorative ? '' : 'ViraCode'}
      aria-hidden={decorative ? true : undefined}
      referrerPolicy="no-referrer"
      style={{
        ...(isClean && glow
          ? { filter: 'drop-shadow(0 0 14px rgba(220, 38, 38, 0.45))' }
          : undefined),
        ...style,
      }}
      className={`object-contain shrink-0 select-none pointer-events-none ${imgSize} ${
        !isClean ? 'mix-blend-lighten' : ''
      } ${animated ? 'transition-transform duration-500 hover:scale-105' : ''} ${className}`}
    />
  );
};
