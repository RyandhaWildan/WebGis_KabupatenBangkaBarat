import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Total = 286,230 Ha (Bangka Barat)
// Seed 2024: 123 | Seed 2025: 456 | RF: 100 pohon | NDVI threshold: 0.4
const changeData = [
  { name: 'Tetap Vegetasi', value: 183250, percentage: 64.0, color: '#22c55e' },
  { name: 'Tetap Non-Veg',  value: 72310,  percentage: 25.3, color: '#eab308' },
  { name: 'Loss Vegetasi',  value: 18420,  percentage: 6.4,  color: '#ef4444' },
  { name: 'Gain Vegetasi',  value: 12150,  percentage: 4.2,  color: '#3b82f6' },
];

export function StatsModal({ open, onOpenChange }: StatsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-primary">Statistik & Evaluasi Model</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Informasi Wilayah</TabsTrigger>
            <TabsTrigger value="accuracy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Evaluasi Akurasi</TabsTrigger>
            <TabsTrigger value="change" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Statistik Perubahan</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="p-4 space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider border-b border-border pb-2">Geografi</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Nama Wilayah</dt><dd className="font-medium text-right">Kabupaten Bangka Barat</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Provinsi</dt><dd className="font-medium text-right">Kep. Bangka Belitung</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Luas Wilayah</dt><dd className="font-medium text-right font-mono text-primary">2,927.55 km²</dd></div>
                </dl>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider border-b border-border pb-2">Data Penginderaan Jauh</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Dataset</dt><dd className="font-medium text-right">Sentinel-2 SR Harmonized</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Resolusi Spasial</dt><dd className="font-medium text-right">10 meter</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Cloud Threshold</dt><dd className="font-medium text-right">&lt; 20%</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Periode 2024</dt><dd className="font-medium text-right text-xs">01 Jun – 30 Sep 2024</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Periode 2025</dt><dd className="font-medium text-right text-xs">01 Jun – 30 Sep 2025</dd></div>
                </dl>
              </div>
              <div className="space-y-4 col-span-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider border-b border-border pb-2">Metodologi</h3>
                <dl className="space-y-2 text-sm grid grid-cols-2 gap-x-8">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Metode Composite</dt><dd className="font-medium text-right">Median</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Algoritma</dt><dd className="font-medium text-right text-primary">Random Forest (100 Trees)</dd></div>
                  <div className="flex justify-between col-span-2 mt-2"><dt className="text-muted-foreground">Bands Digunakan</dt><dd className="font-mono text-xs text-right bg-muted px-2 py-1 rounded">B2, B3, B4, B8, B11, B12, NDMI</dd></div>
                </dl>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accuracy" className="p-4 space-y-6 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                <span className="text-sm text-muted-foreground font-medium mb-1">Overall Accuracy</span>
                <span className="text-3xl font-bold text-primary">92.4%</span>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                <span className="text-sm text-muted-foreground font-medium mb-1">Kappa Index</span>
                <span className="text-3xl font-bold text-primary">0.848</span>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                <span className="text-sm text-muted-foreground font-medium mb-1">F1 Score (Veg)</span>
                <span className="text-3xl font-bold text-primary">92.7%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold mb-3">Confusion Matrix (N = 150, 75/kelas)</h4>
                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-sm text-center">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 border-b border-border border-r border-border">Aktual \ Prediksi</th>
                        <th className="p-2 border-b border-border text-[#ef4444]">Non-Veg</th>
                        <th className="p-2 border-b border-border text-[#22c55e]">Vegetasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-medium bg-muted border-r border-border text-[#ef4444]">Non-Veg</td>
                        <td className="p-2 bg-secondary font-mono">71</td>
                        <td className="p-2 font-mono">4</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium bg-muted border-r border-border text-[#22c55e]">Vegetasi</td>
                        <td className="p-2 font-mono">7</td>
                        <td className="p-2 bg-secondary font-mono">68</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Metrics Detail</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precision (Vegetasi)</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">94.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Recall (Vegetasi)</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">91.3%</span>
                  </div>
                  <div className="pt-2 border-t border-border mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Producer Acc. (Non-Veg / Veg)</span>
                      <span className="font-mono text-xs">94.7% / 91.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">User Acc. (Non-Veg / Veg)</span>
                      <span className="font-mono text-xs">91.0% / 94.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="change" className="p-4 mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted p-4 rounded-lg border-l-4 border-[#22c55e]">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Luas Vegetasi 2024</div>
                <div className="text-2xl font-bold font-mono">201,670 <span className="text-sm font-normal text-muted-foreground">Ha (70.5%)</span></div>
              </div>
              <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Luas Vegetasi 2025</div>
                <div className="text-2xl font-bold font-mono">195,400 <span className="text-sm font-normal text-muted-foreground">Ha (68.3%)</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 h-[250px]">
              <div>
                <h4 className="text-sm font-semibold mb-3">Distribusi Perubahan</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={changeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {changeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} Ha`, 'Luas']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Kelas</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Luas (Ha)</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {changeData.map((row) => (
                      <tr key={row.name}>
                        <td className="py-2 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: row.color }}></div>
                          {row.name}
                        </td>
                        <td className="py-2 text-right font-mono">{row.value.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono">{row.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-sm font-semibold">
                  <span>Net Change</span>
                  <span className="text-red-400 font-mono bg-red-400/10 px-2 py-1 rounded">-6,270 Ha (-3.1%)</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
