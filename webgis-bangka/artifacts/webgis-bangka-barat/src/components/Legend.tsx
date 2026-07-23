import React from 'react';

interface LegendProps {
  layers: any[]; // Using any to avoid full import for now, replace with proper type if needed
}

export function Legend({ layers }: LegendProps) {
  // Determine which legends to show based on active layers
  const hasNdvi = layers.some(l => (l.id === 'ndvi2024' || l.id === 'ndvi2025') && l.visible);
  const hasClass = layers.some(l => 
    ['class2024', 'class2025', 'rf2024', 'rf2025'].includes(l.id) && l.visible
  );
  const hasChange = layers.find(l => l.id === 'changeDetection')?.visible;
  const hasSamples = layers.some(l => (l.id === 'samples2024' || l.id === 'samples2025') && l.visible);

  if (!hasNdvi && !hasClass && !hasChange && !hasSamples) return null;

  return (
    <div className="mt-6 border border-border bg-card rounded-md shadow-sm overflow-hidden">
      <div className="bg-muted px-4 py-2 border-b border-border text-sm font-semibold text-foreground flex items-center justify-between">
        Legenda
      </div>
      <div className="p-4 space-y-6 text-sm text-card-foreground">
        
        {hasChange && (
          <div className="space-y-2">
            <div className="font-medium text-xs uppercase text-muted-foreground mb-2">Deteksi Perubahan</div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[rgba(255,255,0,0.6)] border border-[rgba(255,255,0,0.8)] rounded-sm"></div>
              <span>Tetap Non-Vegetasi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[rgba(0,255,0,0.6)] border border-[rgba(0,255,0,0.8)] rounded-sm"></div>
              <span>Tetap Vegetasi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[rgba(0,0,255,0.6)] border border-[rgba(0,0,255,0.8)] rounded-sm"></div>
              <span>Gain Vegetasi (Baru)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[rgba(255,0,0,0.6)] border border-[rgba(255,0,0,0.8)] rounded-sm"></div>
              <span>Loss Vegetasi (Hilang)</span>
            </div>
          </div>
        )}

        {hasClass && !hasChange && (
          <div className="space-y-2">
            <div className="font-medium text-xs uppercase text-muted-foreground mb-2">Klasifikasi Tutupan Lahan</div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#22c55e] opacity-70 border border-[#22c55e] rounded-sm"></div>
              <span>Vegetasi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#ef4444] opacity-70 border border-[#ef4444] rounded-sm"></div>
              <span>Non-Vegetasi</span>
            </div>
          </div>
        )}

        {hasNdvi && !hasClass && !hasChange && (
          <div className="space-y-2">
            <div className="font-medium text-xs uppercase text-muted-foreground mb-2">Indeks Vegetasi (NDVI)</div>
            <div className="h-4 w-full bg-gradient-to-r from-white via-[#adff2f] to-[#006400] rounded-sm border border-border mt-2"></div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
              <span>-1.0</span>
              <span>0.0</span>
              <span>+1.0</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Air/Awan</span>
              <span>Tanah Kosong</span>
              <span>Hutan Lebat</span>
            </div>
          </div>
        )}

        {hasSamples && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="font-medium text-xs uppercase text-muted-foreground mb-2">Titik Sampel (Training)</div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full shadow-sm"></div>
              <span>Kelas Vegetasi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#ef4444] border-2 border-white rounded-full shadow-sm"></div>
              <span>Kelas Non-Vegetasi</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
