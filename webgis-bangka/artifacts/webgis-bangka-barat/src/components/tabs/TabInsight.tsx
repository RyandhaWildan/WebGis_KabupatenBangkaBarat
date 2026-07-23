import React from 'react';

const lossAreas = [
  { name: 'Muntok', value: '−4.820 Ha', pct: 26.2, cause: 'Aktivitas utama pertambangan timah darat & pemukiman baru', color: '#f87171' },
  { name: 'Jebus', value: '−3.940 Ha', pct: 21.4, cause: 'Pertambangan rakyat terbuka (open-cast) & perluasan perkebunan', color: '#f87171' },
  { name: 'Kelapa', value: '−2.610 Ha', pct: 14.2, cause: 'Konversi lahan perkebunan kelapa sawit & lada rakyat', color: '#fb923c' },
];

const gainAreas = [
  { name: 'Tempilang', value: '+4.210 Ha', pct: 34.6, cause: 'Revegetasi alami di area tambang terlantar & penanaman kembali', color: '#34d399' },
  { name: 'Parittiga', value: '+3.980 Ha', pct: 32.7, cause: 'Suksesi hutan sekunder sekunder di lahan bera pertanian', color: '#34d399' },
  { name: 'Simpang Teritip', value: '+2.810 Ha', pct: 23.1, cause: 'Rehabilitasi mangrove & sabuk hijau pantai oleh komunitas', color: '#60a5fa' },
];

const glassCard: React.CSSProperties = {
  background: 'rgba(17,31,58,0.6)',
  border: '1px solid rgba(51,65,85,0.45)',
  borderRadius: 20,
  overflow: 'hidden',
  position: 'relative',
};

export function TabInsight() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      background: 'radial-gradient(ellipse at 10% 10%, rgba(16,185,129,0.05) 0%, transparent 55%), #0d1628',
      padding: '28px 32px'
    }}>
      <style>{`
        .insight-card:hover {
          border-color: rgba(16,185,129,0.28) !important;
          box-shadow: 0 0 24px rgba(16,185,129,0.08), 0 8px 32px rgba(0,0,0,0.35) !important;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── HEADER ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              fontSize: 20,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(16,185,129,0.2)',
            }}>💡</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: 0, lineHeight: 1.2 }}>Insight &amp; Analisis Spasial</h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                Narasi spasial perubahan vegetasi, pola distribusi, interpretasi penyebab, dan rekomendasi kebijakan
              </p>
            </div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(16,185,129,0.4), transparent)', marginTop: 16 }} />
        </div>

        {/* ── ALERTS BANNER ── */}
        <div style={{
          borderRadius: 16,
          padding: '18px 22px',
          background: 'rgba(248,113,113,0.09)',
          border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: 28, marginTop: 2 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Tren Penurunan Tutupan Vegetasi Bersih (Net Forest/Veg Loss)</div>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Analisis overlay spasial menunjukkan Kabupaten Bangka Barat mengalami kehilangan vegetasi bersih sebesar <strong style={{ color: '#f87171' }}>−6.270 Hektar (−2.2% dari luas wilayah)</strong> dalam setahun terakhir. Walaupun ada upaya revegetasi, kecepatan konversi vegetasi jauh melampaui laju pemulihannya.
            </p>
          </div>
        </div>

        {/* ── ROW 1: AREA & CHANGE SUMMARY ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Card A: Ringkasan Transisi Luas Wilayah */}
          <div className="insight-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>📋 Tabel Ringkasan Transisi Tutupan Lahan</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Statistik perubahan tutupan lahan 2024 vs 2025</div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.5)', color: '#64748b' }}>
                    <th style={{ padding: '8px 0', fontWeight: 'bold' }}>Kelas Lahan</th>
                    <th style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>2024 (Ha)</th>
                    <th style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>2025 (Ha)</th>
                    <th style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>Perubahan Bersih</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.3)', color: '#cbd5e1' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>🌲 Vegetasi</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'monospace' }}>201.670 Ha</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'monospace' }}>195.400 Ha</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>−6.270 Ha (−3.11%)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.3)', color: '#cbd5e1' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>⛏️ Non-Vegetasi</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'monospace' }}>84.560 Ha</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'monospace' }}>90.830 Ha</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>+6.270 Ha (+7.41%)</td>
                  </tr>
                  <tr style={{ color: '#e2e8f0', fontWeight: 'bold' }}>
                    <td style={{ padding: '12px 0' }}>🗺️ Total Wilayah</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: 'monospace' }}>286.230 Ha</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: 'monospace' }}>286.230 Ha</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>Stabil (0)</td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', padding: 10, borderRadius: 10 }}>
                  <span style={{ fontSize: 9, color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>Vegetasi Rusak (Loss)</span>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#f87171', fontFamily: 'monospace', marginTop: 2 }}>18.420 Ha</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: 10, borderRadius: 10 }}>
                  <span style={{ fontSize: 9, color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>Vegetasi Tumbuh (Gain)</span>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#34d399', fontFamily: 'monospace', marginTop: 2 }}>12.150 Ha</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Pola Distribusi Spasial */}
          <div className="insight-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>📍 Pola Distribusi Spasial Perubahan</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Kecenderungan arah sebaran kerusakan vegetasi secara geografis</div>
            </div>
            
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                <strong>• Pola Terkonsentrasi (Kluster):</strong> Degradasi vegetasi didominasi oleh pola terkluster pekat di wilayah pesisir barat (Muntok) dan pesisir utara (Jebus), berhimpitan langsung dengan daerah operasi tambang terbuka.
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, borderTop: '1px solid rgba(51,65,85,0.3)', paddingTop: 10 }}>
                <strong>• Pola Menyebar (Diffused):</strong> Pola pertumbuhan vegetasi (gain) cenderung menyebar tidak teratur di wilayah selatan (Tempilang) dan pedalaman timur, didominasi oleh regenerasi sekunder semak belukar alami di bekas lahan pertanian/perkebunan karet rakyat yang ditinggalkan.
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: LOSS VS GAIN DETAILED AREA BREAKDOWN ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Loss */}
          <div className="insight-card" style={glassCard}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(51,65,85,0.5)', background: 'rgba(248,113,113,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🔴</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#f87171' }}>Hotspots Kehilangan (Loss) Vegetasi</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Kecamatan dengan konversi vegetasi tertinggi</div>
              </div>
              <div style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: 15, color: '#f87171' }}>−18.420 Ha</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lossAreas.map(k => (
                <div key={k.name} style={{ borderRadius: 10, padding: 14, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9' }}>Kec. {k.name}</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 12, color: k.color }}>{k.value}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'rgba(51,65,85,0.4)', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 999, width: `${k.pct}%`, background: k.color }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>🔍 {k.cause}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gain */}
          <div className="insight-card" style={glassCard}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(51,65,85,0.5)', background: 'rgba(16,185,129,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🟢</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#34d399' }}>Hotspots Pertumbuhan (Gain) Vegetasi</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Kecamatan dengan peningkatan tutupan vegetasi</div>
              </div>
              <div style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: 15, color: '#34d399' }}>+12.150 Ha</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gainAreas.map(k => (
                <div key={k.name} style={{ borderRadius: 10, padding: 14, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9' }}>Kec. {k.name}</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 12, color: k.color }}>{k.value}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'rgba(51,65,85,0.4)', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 999, width: `${k.pct}%`, background: k.color }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>🌱 {k.cause}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3: CAUTIOUS INTERPRETATION (INTERPRETASI HATI-HATI) ── */}
        <div className="insight-card" style={{
          ...glassCard,
          border: '1px solid rgba(251,191,36,0.3)',
          background: 'rgba(251,191,36,0.04)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🛡️</span>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#fbbf24' }}>Catatan Penting: Interpretasi Penyebab Spasial Secara Hati-Hati</div>
          </div>
          <div style={{ padding: '16px 20px', fontSize: 12, color: '#cbd5e1', lineHeight: 1.65 }}>
            <p style={{ margin: '0 0 10px 0' }}>
              Meskipun data analisis spasial menunjukkan korelasi kuat antara hilangnya vegetasi dengan kawasan pertambangan timah (terbuka) dan perluasan perkebunan kelapa sawit, pengguna data diharapkan menggunakan <strong>interpretasi secara hati-hati (cautious interpretation)</strong>:
            </p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}>
                <strong>Batasan Atribusi Penyebab:</strong> Klasifikasi piksel berbasis satelit mendeteksi kehilangan tutupan kanopi vegetasi secara spektral, namun tidak mendokumentasikan motif kepemilikan/tindakan (hukum vs ilegal) secara langsung.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>Piksel Campuran (Mixed Pixels):</strong> Lahan terbuka di pedesaan yang gersang akibat musim kemarau panjang dapat terklasifikasi sebagai non-vegetasi sementara (temporal), bukan deforestasi permanen.
              </li>
              <li>
                <strong>Verifikasi Legalitas:</strong> Atribusi konversi mangrove menjadi tambak udang intensif membutuhkan overlay batas kawasan hutan lindung resmi dan data izin HGU tambak terbaru untuk konfirmasi yurisdiksi.
              </li>
            </ul>
          </div>
        </div>

        {/* ── ROW 4: POTENSI PENGGUNAAN HASIL (USE CASES) ── */}
        <div className="insight-card" style={glassCard}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>🚀 Potensi Penggunaan Hasil Kajian (Use Cases)</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Bagaimana pihak pemangku kepentingan dapat memanfaatkan data spasial ini?</div>
          </div>
          
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { icon: '🌱', title: 'Pemantauan Kewajiban Reklamasi Tambang', text: 'Dinas ESDM dapat menggunakan peta change detection ini untuk memantau kemajuan revegetasi kawasan bekas tambang timah secara berkala dari jarak jauh.' },
              { icon: '🛡️', title: 'Sistem Peringatan Dini Deforestasi Mangrove', text: 'Dinas Kehutanan dapat memetakan pembukaan hutan mangrove ilegal baru untuk tambak udang non-izin secara temporal.' },
              { icon: '🗺️', title: 'Penyusunan RTRW Kabupaten', text: 'Bappeda dapat mengintegrasikan data tren kehilangan tutupan lahan untuk merevisi pola tata ruang berbasis daya dukung lingkungan wilayah.' },
              { icon: '🏫', title: 'Studi Akademik & Pemodelan Prediktif', text: 'Akademisi dapat menggunakan hasil akurasi model RF ini untuk memprediksi skenario deforestasi di masa depan menggunakan Machine Learning lanjutan.' }
            ].map((use, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 12, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
                <span style={{ fontSize: 20 }}>{use.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{use.title}</div>
                  <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{use.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 5: REKOMENDASI LANJUTAN & KETERBATASAN STUDI ── */}
        <div style={{
          borderRadius: 16,
          padding: 20,
          background: 'rgba(96,165,250,0.07)',
          border: '1px solid rgba(96,165,250,0.2)'
        }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#60a5fa', marginBottom: 12 }}>📋 Rekomendasi Lanjutan &amp; Keterbatasan Studi</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            
            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(15,30,56,0.6)', border: '1px solid rgba(51,65,85,0.4)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>🔍 Keterbatasan Studi Saat Ini</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, color: '#94a3b8', lineHeight: 1.6 }}>
                <li style={{ marginBottom: 4 }}>Metode klasifikasi berbasis piksel (Pixel-based) terkadang memicu efek sebaran semut ("salt-and-pepper").</li>
                <li style={{ marginBottom: 4 }}>Citra optis Sentinel-2 sangat tergantung cuaca; sulit mendeteksi degradasi di musim hujan.</li>
                <li>Atribusi kepemilikan lahan sengketa belum terintegrasi ke dalam sistem database GIS ini.</li>
              </ul>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(15,30,56,0.6)', border: '1px solid rgba(51,65,85,0.4)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>🚀 Rekomendasi Lanjutan</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, color: '#94a3b8', lineHeight: 1.6 }}>
                <li style={{ marginBottom: 4 }}>Mengintegrasikan data radar SAR (Sentinel-1) yang kebal awan untuk monitoring kontinu.</li>
                <li style={{ marginBottom: 4 }}>Menggunakan metode Object-Based Image Analysis (OBIA) untuk geometri segmen lahan yang lebih rapi.</li>
                <li>Melakukan ground truth tambahan pada daerah transisi kelapa sawit muda untuk melatih varian sub-kelas RF.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
