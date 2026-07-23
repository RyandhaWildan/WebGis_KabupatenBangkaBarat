import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Data ──────────────────────────────────────────────────────────────── */

const COURSE = 'Maha Data — UAS 2025/2026';

const TEAM = [
  {
    no: '01', name: 'Ryandha Wildan', nim: '1232002008',
    role: 'Membuat WebGIS', emoji: '👨‍💻',
    accent: '#3b82f6', glow: 'rgba(59,130,246,0.20)',
    badge: 'rgba(59,130,246,0.12)', rim: 'rgba(59,130,246,0.32)',
    shimmer: 'rgba(59,130,246,0.08)',
  },
  {
    no: '02', name: 'Nazwa Putri Parashati', nim: '1232002089',
    role: 'Lead Spatial Data & Ground Truth', emoji: '👩‍🔬',
    accent: '#10b981', glow: 'rgba(16,185,129,0.16)',
    badge: 'rgba(16,185,129,0.10)', rim: 'rgba(16,185,129,0.30)',
    shimmer: 'rgba(16,185,129,0.07)',
  },
  {
    no: '03', name: 'Muhammad Aghis Alfarizi', nim: '1232002034',
    role: 'Machine Learning & Model Evaluation', emoji: '🤖',
    accent: '#a78bfa', glow: 'rgba(167,139,250,0.16)',
    badge: 'rgba(167,139,250,0.10)', rim: 'rgba(167,139,250,0.30)',
    shimmer: 'rgba(167,139,250,0.07)',
  },
];

const TECH = [
  { icon: '🗺️', label: 'Leaflet.js',          desc: 'Interactive mapping' },
  { icon: '⚛️', label: 'React + Vite',         desc: 'Frontend & build tool' },
  { icon: '🛰️', label: 'Sentinel-2 SR',        desc: 'Satellite imagery' },
  { icon: '☁️', label: 'Google Earth Engine',  desc: 'Cloud geo-processing' },
  { icon: '🌲', label: 'Random Forest',        desc: 'ML classification' },
  { icon: '🎨', label: 'Tailwind CSS',         desc: 'Utility-first styling' },
];

/* ─── CSS Keyframes injected once ─────────────────────────────────────── */

const STYLE_ID = 'tab-about-keyframes';

function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes floatY {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes pulseGlow {
      0%,100% { opacity: 0.6; }
      50%      { opacity: 1; }
    }
    @keyframes rotateSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes shimmerSlide {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes dotPulse {
      0%,100% { transform: scale(1);   opacity: 1; }
      50%      { transform: scale(1.5); opacity: 0.6; }
    }
    @keyframes borderFlow {
      0%,100% { opacity: 0.4; }
      50%      { opacity: 1.0; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tech-card:hover {
      transform: translateY(-3px) scale(1.03);
      border-color: rgba(59,130,246,0.45) !important;
      box-shadow: 0 8px 24px rgba(59,130,246,0.15);
    }
    .team-card:hover .card-glow {
      opacity: 1 !important;
    }
    .team-card:hover {
      transform: translateX(4px);
    }
  `;
  document.head.appendChild(s);
}

/* ─── Variants ─────────────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const } },
};

const teamStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const teamCard = {
  hidden: { opacity: 0, x: -32, scale: 0.96 },
  show:   { opacity: 1,  x: 0,  scale: 1,    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const techStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const techItem = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ─── FloatingOrb sub-component ────────────────────────────────────────── */

function FloatingOrb({ color, size, top, left, delay }: {
  color: string; size: number; top: string; left: string; delay: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0], opacity: [0.18, 0.35, 0.18] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        position: 'absolute', top, left,
        width: size, height: size, borderRadius: '50%',
        background: color, filter: `blur(${size * 0.4}px)`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */

export function TabAbout() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => { injectKeyframes(); }, []);

  return (
    <div
      ref={ref}
      style={{
        width: '100%', height: '100%', overflowY: 'auto',
        background: '#0c1322', padding: '28px 36px 48px',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
      }}
    >
      {/* ── Ambient floating orbs (background decoration) ── */}
      <FloatingOrb color="rgba(59,130,246,0.5)"  size={160} top="-20px"  left="-40px"  delay={0} />
      <FloatingOrb color="rgba(16,185,129,0.4)"  size={120} top="40%"   left="80%"    delay={1.5} />
      <FloatingOrb color="rgba(167,139,250,0.4)" size={100} top="70%"   left="10%"    delay={2.5} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}
      >

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <motion.div variants={slideUp} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
            style={{
              width: 48, height: 48, borderRadius: 15, flexShrink: 0,
              background: 'linear-gradient(135deg,rgba(59,130,246,0.28),rgba(99,102,241,0.18))',
              border: '1.5px solid rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              boxShadow: '0 0 20px rgba(99,102,241,0.2)',
            }}
          >
            ℹ️
          </motion.div>
          <div>
            <h2 style={{ fontSize: 23, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.4px' }}>
              About
            </h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2 }}>
              Profil tim pembuat &amp; informasi platform WebGIS
            </p>
          </div>
        </motion.div>

        {/* ── Animated divider ────────────────────────────────────────── */}
        <motion.div
          variants={slideLeft}
          style={{ height: 1, background: 'linear-gradient(90deg,rgba(59,130,246,0.6),rgba(99,102,241,0.3),rgba(51,65,85,0.05))', borderRadius: 1 }}
        >
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
            style={{ height: '100%', width: '30%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', borderRadius: 1 }}
          />
        </motion.div>

        {/* ── Course Card ─────────────────────────────────────────────── */}
        <motion.div
          variants={slideUp}
          whileHover={{ scale: 1.015, boxShadow: '0 8px 30px rgba(59,130,246,0.2)' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            borderRadius: 18,
            background: 'linear-gradient(135deg,rgba(59,130,246,0.09),rgba(17,31,58,0.95))',
            border: '1px solid rgba(59,130,246,0.25)',
            padding: '16px 22px',
            display: 'flex', alignItems: 'center', gap: 16,
            cursor: 'default', boxShadow: '0 4px 20px rgba(59,130,246,0.10)',
          }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 26 }}
          >
            📚
          </motion.div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3b82f6', fontWeight: 700, marginBottom: 3 }}>
              Mata Kuliah
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0' }}>{COURSE}</div>
          </div>
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              flexShrink: 0, fontSize: 10, fontWeight: 800,
              padding: '5px 14px', borderRadius: 20,
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.35)',
              color: '#60a5fa', letterSpacing: '0.06em',
            }}
          >
            2025 / 2026
          </motion.div>
        </motion.div>

        {/* ── Team Section Header ─────────────────────────────────────── */}
        <motion.div variants={slideUp} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>👥 Pembuat Aplikasi</div>
          <div style={{ flex: 1, height: 1, background: 'rgba(51,65,85,0.45)' }} />
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 10px rgba(59,130,246,0.35)', '0 0 0px rgba(59,130,246,0)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontSize: 10, fontWeight: 700, color: '#3b82f6',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.28)',
              padding: '3px 12px', borderRadius: 20,
            }}
          >
            3 Members
          </motion.div>
        </motion.div>

        {/* ── Team Cards ──────────────────────────────────────────────── */}
        <motion.div variants={teamStagger} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TEAM.map((m, idx) => (
            <motion.div
              key={m.nim}
              variants={teamCard}
              whileHover={{
                x: 6, scale: 1.012,
                boxShadow: `0 6px 32px ${m.glow}, 0 0 0 1px ${m.rim}`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                borderRadius: 18,
                background: '#101c35',
                border: `1px solid ${m.rim}`,
                boxShadow: `0 2px 20px ${m.glow}`,
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'default', position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Card shimmer sweep on mount */}
              <motion.div
                initial={{ x: '-100%', opacity: 0.6 }}
                animate={{ x: '250%', opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.3 + idx * 0.14, ease: 'easeOut' }}
                style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(90deg,transparent,${m.shimmer},transparent)`,
                  pointerEvents: 'none', zIndex: 2,
                }}
              />

              {/* Number badge */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: idx * 0.8 }}
                style={{
                  flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
                  background: m.badge, border: `1.5px solid ${m.rim}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: m.accent,
                  boxShadow: `0 0 10px ${m.glow}`,
                }}
              >
                <span style={{ display: 'inline-block', animation: 'none', transform: `rotate(${0}deg)` }}>
                  {m.no}
                </span>
              </motion.div>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ y: { duration: 2.5 + idx * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
                style={{
                  flexShrink: 0, width: 50, height: 50, borderRadius: 15,
                  background: `linear-gradient(135deg,${m.glow},rgba(15,26,48,0.9))`,
                  border: `1.5px solid ${m.rim}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, boxShadow: `0 4px 12px ${m.glow}`,
                }}
              >
                {m.emoji}
              </motion.div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <motion.span
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                    style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: m.accent, boxShadow: `0 0 8px ${m.accent}`,
                      flexShrink: 0,
                    }}
                  />
                  {m.role}
                </div>
              </div>

              {/* NIM pill */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#334155', marginBottom: 4 }}>NIM</div>
                <motion.div
                  whileHover={{ scale: 1.06, boxShadow: `0 0 14px ${m.glow}` }}
                  style={{
                    fontSize: 12, fontWeight: 800, color: m.accent,
                    background: m.badge, border: `1px solid ${m.rim}`,
                    padding: '4px 13px', borderRadius: 20,
                    letterSpacing: '0.03em', cursor: 'default',
                  }}
                >
                  {m.nim}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Platform Info Card ──────────────────────────────────────── */}
        <motion.div
          variants={slideUp}
          whileHover={{ boxShadow: '0 8px 32px rgba(59,130,246,0.12)' }}
          style={{
            borderRadius: 18, background: '#0f1a30',
            border: '1px solid rgba(51,65,85,0.45)',
            overflow: 'hidden',
          }}
        >
          {/* Header strip */}
          <div
            style={{
              padding: '13px 22px',
              background: 'linear-gradient(90deg,rgba(59,130,246,0.10),transparent)',
              borderBottom: '1px solid rgba(51,65,85,0.45)',
              fontSize: 12, fontWeight: 700, color: '#94a3b8',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              style={{ fontSize: 16, display: 'inline-block' }}
            >
              🌐
            </motion.span>
            Tentang Platform WebGIS Ini
          </div>

          <div style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.8, margin: '0 0 18px' }}>
              WebGIS Analisis Perubahan Vegetasi Bangka Barat adalah aplikasi pemetaan interaktif
              berbasis web yang dikembangkan sebagai tugas akhir mata kuliah{' '}
              <span style={{ color: '#60a5fa', fontWeight: 700 }}>Maha Data</span>.
              Aplikasi ini memvisualisasikan hasil analisis perubahan tutupan vegetasi di Kabupaten
              Bangka Barat menggunakan citra satelit{' '}
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Sentinel-2</span> dan algoritma
              klasifikasi <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Random Forest</span>{' '}
              melalui Google Earth Engine.
            </p>

            {/* Tech grid */}
            <motion.div
              variants={techStagger}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}
            >
              {TECH.map((t) => (
                <motion.div
                  key={t.label}
                  variants={techItem}
                  whileHover={{ y: -4, scale: 1.04, borderColor: 'rgba(59,130,246,0.45)', boxShadow: '0 8px 20px rgba(59,130,246,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderRadius: 12, background: 'rgba(15,26,48,0.8)',
                    border: '1px solid rgba(51,65,85,0.45)',
                    padding: '10px 12px', cursor: 'default',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <motion.span
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: TECH.indexOf(t) * 0.25 }}
                    style={{ fontSize: 18, flexShrink: 0, display: 'inline-block' }}
                  >
                    {t.icon}
                  </motion.span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ── Disclaimer ──────────────────────────────────────────────── */}
        <motion.div
          variants={slideUp}
          style={{
            borderRadius: 12,
            background: 'rgba(30,41,59,0.35)',
            border: '1px solid rgba(51,65,85,0.22)',
            padding: '11px 16px', fontSize: 11,
            color: '#334155', lineHeight: 1.65,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ flexShrink: 0, marginTop: 1, display: 'inline-block' }}
          >
            ⚡
          </motion.span>
          <span>
            <strong style={{ color: '#475569' }}>Disclaimer:</strong> Data layer pada peta merupakan
            simulasi visual untuk keperluan demonstrasi tugas akademik. Hasil klasifikasi dan change
            detection bersumber dari analisis Google Earth Engine dengan citra Sentinel-2 asli.
          </span>
        </motion.div>

      </motion.div>
    </div>
  );
}
