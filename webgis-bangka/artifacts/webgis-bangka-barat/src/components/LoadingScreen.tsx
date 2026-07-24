import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinished: () => void;
}

const steps = [
  { text: 'Menginisialisasi modul Web GIS Bangka Barat...', duration: 600 },
  { text: 'Menghubungkan ke Google Earth Engine API...', duration: 800 },
  { text: 'Memuat dataset Sentinel-2 Surface Reflectance (SR)...', duration: 900 },
  { text: 'Menjalankan Cloud Masking & QA60 (Toleransi < 20%)...', duration: 700 },
  { text: 'Menghitung Indeks Spektral (NDVI & NDMI)...', duration: 800 },
  { text: 'Menyinkronkan batas wilayah administratif (batas_bangkabarat.shp)...', duration: 700 },
  { text: 'Mengekstrak 150 Ground Truth Training Samples...', duration: 800 },
  { text: 'Melatih Classifier Random Forest (100 Trees, Seed 123)...', duration: 900 },
  { text: 'Menjalankan Deteksi Perubahan Tutupan Lahan (2024 vs 2025)...', duration: 800 },
  { text: 'Merender peta interaktif dan overlay spasial...', duration: 600 },
  { text: 'Analisis selesai! Membuka Dasbor...', duration: 400 },
];

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let active = true;
    let stepTimer: NodeJS.Timeout;
    
    const runSteps = async () => {
      let totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
      let elapsed = 0;
      
      const interval = setInterval(() => {
        if (!active) return;
        elapsed += 50;
        const pct = Math.min((elapsed / totalDuration) * 100, 99);
        setProgress(pct);
      }, 50);

      for (let i = 0; i < steps.length; i++) {
        if (!active) break;
        setCurrentStepIdx(i);
        await new Promise(resolve => {
          stepTimer = setTimeout(resolve, steps[i].duration);
        });
      }

      clearInterval(interval);
      if (active) {
        setProgress(100);
        // Add a tiny delay for visual satisfaction
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            onFinished();
          }, 600); // match fade transition
        }, 300);
      }
    };

    runSteps();

    return () => {
      active = false;
      clearTimeout(stepTimer);
    };
  }, [onFinished]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#060b13',
      backgroundImage: 'radial-gradient(circle at 50% 30%, #0d1e36 0%, #05090f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>
      {/* Background Star Grid / Particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        backgroundImage: `
          radial-gradient(white 1px, transparent 0),
          radial-gradient(white 1px, transparent 0)
        `,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
        pointerEvents: 'none',
      }} />

      {/* Main Animation Orbit Container */}
      <div style={{
        position: 'relative',
        width: 240,
        height: 240,
        marginBottom: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Radar Ring */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '50%',
          animation: 'spin 12s linear infinite',
        }} />

        {/* Orbit Inner Path */}
        <div style={{
          position: 'absolute',
          width: '75%',
          height: '75%',
          border: '1px dashed rgba(56, 189, 248, 0.2)',
          borderRadius: '50%',
          animation: 'spin-reverse 8s linear infinite',
        }} />

        {/* Glowing Pulse Rings */}
        <div className="pulse-ring" />
        <div className="pulse-ring" style={{ animationDelay: '1s', width: 140, height: 140 }} />
        <div className="pulse-ring" style={{ animationDelay: '2s', width: 80, height: 80 }} />

        {/* Satellite Object */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 38,
          height: 38,
          background: '#0d1e3d',
          border: '2px solid #38bdf8',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)',
          animation: 'orbit 6s linear infinite',
          zIndex: 10,
        }}>
          <span style={{ fontSize: 16 }}>🛰️</span>
        </div>

        {/* Scanning Laser Beam */}
        <div style={{
          position: 'absolute',
          width: 4,
          height: 120,
          background: 'linear-gradient(to top, rgba(16, 185, 129, 0.8), transparent)',
          transformOrigin: 'top center',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%) rotate(0deg)',
          animation: 'scan 4s ease-in-out infinite alternate',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
        }} />

        {/* Earth Globe / Target Land (representing Bangka Barat) */}
        <div style={{
          position: 'relative',
          width: 90,
          height: 90,
          background: '#091526',
          border: '2.5px solid #10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Inner Land Mass Growth Effect */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
            opacity: 0.15 + (progress / 100) * 0.55,
            transition: 'opacity 0.3s ease',
          }} />
          
          {/* Stylized Island Grid representing Bangka Barat */}
          <div style={{
            fontSize: 36,
            zIndex: 3,
            filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.4))',
            animation: 'float 3s ease-in-out infinite',
          }}>
            🌿
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 20,
        fontWeight: 800,
        color: '#f8fafc',
        letterSpacing: '0.04em',
        margin: '0 0 8px',
        textTransform: 'uppercase',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}>
        Sensing Earth Observation
      </h2>
      <p style={{
        fontSize: 13,
        color: '#64748b',
        margin: '0 0 32px',
        letterSpacing: '0.02em',
      }}>
        Analisis Tutupan Vegetasi · Kabupaten Bangka Barat
      </p>

      {/* Progress Bar Container */}
      <div style={{
        width: 320,
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        borderRadius: 99,
        height: 6,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
          borderRadius: 99,
          transition: 'width 0.2s ease',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
        }} />
      </div>

      {/* Progress Text / Status Steps */}
      <div style={{
        marginTop: 18,
        height: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#34d399',
          marginBottom: 4,
          textAlign: 'center',
          animation: 'pulse-text 1.5s infinite',
        }}>
          {steps[currentStepIdx].text}
        </div>
        <div style={{
          fontSize: 12,
          fontFamily: 'monospace',
          color: '#475569',
        }}>
          Progress: {Math.round(progress)}%
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes scan {
          from { transform: translateX(-50%) rotate(-35deg); }
          to { transform: translateX(-50%) rotate(35deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .pulse-ring {
          position: absolute;
          width: 180px;
          height: 180px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 50%;
          animation: pulse-expand 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          pointer-events: none;
        }
        @keyframes pulse-expand {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
