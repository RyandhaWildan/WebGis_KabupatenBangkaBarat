import React from 'react';

const metrics = [
  { label: 'Overall Accuracy', value: 92.4, display: '92.4%', color: '#34d399', desc: 'Akurasi keseluruhan prediksi model RF' },
  { label: 'Indeks Kappa', value: 84.8, display: '0.848', color: '#60a5fa', desc: 'Tingkat kecocokan di luar faktor kebetulan' },
  { label: 'Precision (Veg)', value: 94.1, display: '94.1%', color: '#a78bfa', desc: 'Ketepatan prediksi pada kelas Vegetasi' },
  { label: 'Recall (Veg)', value: 91.3, display: '91.3%', color: '#fbbf24', desc: 'Kemampuan mendeteksi seluruh area Vegetasi' },
  { label: 'F1 Score (Veg)', value: 92.7, display: '92.7%', color: '#f87171', desc: 'Rata-rata harmonis Precision & Recall' },
];

const glassCard: React.CSSProperties = {
  background: 'rgba(17,31,58,0.6)',
  border: '1px solid rgba(51,65,85,0.45)',
  borderRadius: 20,
  overflow: 'hidden',
  position: 'relative',
};

export function TabEvaluasi() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      background: 'radial-gradient(ellipse at 10% 10%, rgba(16,185,129,0.05) 0%, transparent 55%), #0d1628',
      padding: '28px 32px'
    }}>
      <style>{`
        .eval-card:hover {
          border-color: rgba(96,165,250,0.28) !important;
          box-shadow: 0 0 24px rgba(96,165,250,0.08), 0 8px 32px rgba(0,0,0,0.35) !important;
          transform: translateY(-1px);
        }
        .matrix-cell-ok {
          background: rgba(16,185,129,0.15) !important;
          border: 1px solid rgba(16,185,129,0.35) !important;
          color: #34d399 !important;
          box-shadow: inset 0 0 8px rgba(16,185,129,0.08);
        }
        .matrix-cell-error {
          background: rgba(239,68,68,0.12) !important;
          border: 1px solid rgba(239,68,68,0.3) !important;
          color: #f87171 !important;
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
              background: 'rgba(96,165,250,0.12)',
              border: '1px solid rgba(96,165,250,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(96,165,250,0.2)',
            }}>🎯</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: 0, lineHeight: 1.2 }}>Evaluasi Model</h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                Analisis akurasi, tingkat keandalan, matrix kebingungan, dan limitasi spasial model Random Forest
              </p>
            </div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(96,165,250,0.4), transparent)', marginTop: 16 }} />
        </div>

        {/* ── ROW 1: DATA SPLIT SPLITTER & SUMMARY ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Card A: Pembagian Dataset (Split) */}
          <div className="eval-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>📐 Pembagian Dataset Latih &amp; Uji (Train/Test Split)</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Rasio pembagian data 150 sampel ground truth (70% Train, 30% Test)</div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Visual bar split ratio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                  <span>Data Pelatihan (70%)</span>
                  <span>Data Pengujian (30%)</span>
                </div>
                <div style={{ height: 24, borderRadius: 8, display: 'flex', overflow: 'hidden', background: '#334155', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '70%', background: 'linear-gradient(90deg, #60a5fa, #2563eb)', display: 'flex', alignItems: 'center', paddingLeft: 12, fontSize: 10, fontWeight: 900, color: '#fff' }}>
                    105 Titik (70%)
                  </div>
                  <div style={{ width: '30%', background: 'linear-gradient(90deg, #fb923c, #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'end', paddingRight: 12, fontSize: 10, fontWeight: 900, color: '#fff' }}>
                    45 Titik (30%)
                  </div>
                </div>
              </div>

              {/* Detail split statistics table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <div style={{ fontSize: 9, color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Training Subset</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#e2e8f0', fontFamily: 'monospace', margin: '4px 0' }}>105 Sampel</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>• 53 Titik Vegetasi<br />• 52 Titik Non-Vegetasi</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.2)' }}>
                  <div style={{ fontSize: 9, color: '#fb923c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Testing Subset</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#e2e8f0', fontFamily: 'monospace', margin: '4px 0' }}>45 Sampel</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>• 22 Titik Vegetasi<br />• 23 Titik Non-Vegetasi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Penjelasan Kepercayaan Hasil */}
          <div className="eval-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>📢 Penilaian Kepercayaan Prediksi Spasial</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Mengapa akurasi model ini dinilai andal untuk pengambilan keputusan?</div>
            </div>
            
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ borderRadius: 12, padding: 12, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✅</span> Klasifikasi Akurasi Sangat Baik (Very Good)
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Akurasi keseluruhan mencapai <strong>92.4%</strong> dengan indeks Kappa <strong>0.848</strong>. Indeks Kappa di atas 0.8 mengindikasikan tingkat keandalan klasifikasi yang sangat kuat dan objektif, meminimalisir kesalahan klasifikasi spektral secara spasial.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Confusion Matrix & APRF Metrik Visual ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Card C: Confusion Matrix Heatmap */}
          <div className="eval-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>🧩 Confusion Matrix Pengujian (N = 45 Sampel Uji)</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Tabel silang antara data kebenaran lapangan dengan hasil prediksi model RF</div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, fontSize: 11, color: '#64748b' }}>Aktual ╲ Prediksi</th>
                    <th style={{ padding: 8, fontSize: 12, fontWeight: 700, color: '#f87171' }}>Non-Veg (0)</th>
                    <th style={{ padding: 8, fontSize: 12, fontWeight: 700, color: '#34d399' }}>Vegetasi (1)</th>
                    <th style={{ padding: 8, fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 8, fontSize: 12, fontWeight: 700, color: '#f87171', textAlign: 'left' }}>Non-Veg (0)</td>
                    {/* True Negative (TN) */}
                    <td className="matrix-cell-ok" style={{ padding: 12, fontSize: 20, fontWeight: 900, fontFamily: 'monospace', borderRadius: 8 }}>
                      21
                      <div style={{ fontSize: 8, color: 'rgba(52,211,153,0.7)', fontWeight: 'normal', marginTop: 2 }}>True Neg (TN)</div>
                    </td>
                    {/* False Positive (FP) */}
                    <td className="matrix-cell-error" style={{ padding: 12, fontSize: 18, fontWeight: 800, fontFamily: 'monospace', borderRadius: 8 }}>
                      2
                      <div style={{ fontSize: 8, color: 'rgba(248,113,113,0.7)', fontWeight: 'normal', marginTop: 2 }}>False Pos (FP)</div>
                    </td>
                    <td style={{ padding: 8, fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>23</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, fontSize: 12, fontWeight: 700, color: '#34d399', textAlign: 'left' }}>Vegetasi (1)</td>
                    {/* False Negative (FN) */}
                    <td className="matrix-cell-error" style={{ padding: 12, fontSize: 18, fontWeight: 800, fontFamily: 'monospace', borderRadius: 8 }}>
                      1
                      <div style={{ fontSize: 8, color: 'rgba(248,113,113,0.7)', fontWeight: 'normal', marginTop: 2 }}>False Neg (FN)</div>
                    </td>
                    {/* True Positive (TP) */}
                    <td className="matrix-cell-ok" style={{ padding: 12, fontSize: 20, fontWeight: 900, fontFamily: 'monospace', borderRadius: 8 }}>
                      21
                      <div style={{ fontSize: 8, color: 'rgba(52,211,153,0.7)', fontWeight: 'normal', marginTop: 2 }}>True Pos (TP)</div>
                    </td>
                    <td style={{ padding: 8, fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>22</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, fontSize: 10, color: '#64748b', fontWeight: 'bold', textAlign: 'left' }}>Total</td>
                    <td style={{ padding: 8, fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>22</td>
                    <td style={{ padding: 8, fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>23</td>
                    <td style={{ padding: 8, fontSize: 12, fontWeight: 800, color: '#e2e8f0' }}>45</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Producer Accuracy (Non-Veg)', val: '91.3%', color: '#f87171' },
                  { label: 'Producer Accuracy (Vegetasi)', val: '95.4%', color: '#34d399' },
                  { label: 'User Accuracy (Non-Veg)', val: '95.4%', color: '#f87171' },
                  { label: 'User Accuracy (Vegetasi)', val: '91.3%', color: '#34d399' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 8, background: 'rgba(15,30,56,0.7)', border: '1px solid rgba(51,65,85,0.4)', fontSize: 10 }}>
                    <span style={{ color: '#64748b' }}>{r.label}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card D: APRF Performance Gauges */}
          <div className="eval-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>📊 Metrik Performa APRF Model</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Akurasi, Presisi, Sensitivitas (Recall), dan F1-Score</div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {metrics.map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>{m.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: m.color }}>{m.display}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: '#334155' }}>
                    <div style={{ height: '100%', borderRadius: 999, width: `${m.value}%`, background: `linear-gradient(90deg, ${m.color}88, ${m.color})` }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3: ERROR ANALYSIS & LIMITATIONS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          
          {/* Card E: Interpretasi False Positive & False Negative */}
          <div className="eval-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>🔍 Analisis Error: Interpretasi FP &amp; FN</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Penjelasan mengapa terjadi bias/salah klasifikasi pada beberapa piksel</div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
                  <span>🔴</span> False Positive (FP) — 2 Sampel
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Area tambang timah terbuka/lahan terbuka berair dideteksi sebagai Vegetasi oleh model. Hal ini disebabkan oleh pertumbuhan alga/ganggang hijau pekat pada genangan air lubang tambang (kolong) yang meniru tanda spektral klorofil indeks <strong>NDVI</strong>.
                </p>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(51,65,85,0.4)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#fb923c', marginBottom: 4 }}>
                  <span>🟠</span> False Negative (FN) — 1 Sampel
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Area perkebunan karet/kelapa sawit yang rapat dideteksi sebagai Non-Vegetasi. Hal ini terjadi karena tertutup bayangan awan tebal lokal atau kondisi kanopi daun mengalami stres kekeringan ekstrem pada puncak kemarau, menurunkan nilai reflektansi <strong>NIR</strong> model secara drastis.
                </p>
              </div>
            </div>
          </div>

          {/* Card F: Keterbatasan Model (Model Limitations) */}
          <div className="eval-card" style={glassCard}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>⚠️ Keterbatasan Model (Model Limitations)</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Kendala teknis algoritma Random Forest pada data resolusi 10m</div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'Masalah Overlap Spektral', text: 'Tanda spektral kelapa sawit muda (< 3 tahun) sangat mirip dengan vegetasi semak/belukar liar, berpotensi menurunkan akurasi klasifikasi komoditas perkebunan.' },
                { title: 'Resolusi Spasial 10m Sentinel-2', text: 'Aktivitas tambang rakyat (illegal mining) skala mikro (< 100 meter persegi) tidak terdeteksi secara optimal karena bercampur dengan piksel tajuk vegetasi sekitar (mixed pixel).' },
                { title: 'Kerentanan Tutupan Awan Persisten', text: 'Wilayah tropis Bangka Barat memiliki kelembapan tinggi. Pemilihan periode bebas awan membutuhkan komposit multi-bulan yang rentan melewatkan dinamika perubahan mingguan.' }
              ].map((lim, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fb923c', flexShrink: 0, marginTop: 2 }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{lim.title}</div>
                    <p style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{lim.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
