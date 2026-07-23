import React, { useState } from 'react';
import { useMapLayers, LayerId } from '../hooks/useMapLayers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Legend } from './Legend';
import { StatsModal } from './StatsModal';
import { Layers, BarChart2, SplitSquareHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  layersState: ReturnType<typeof useMapLayers>;
}

export function Sidebar({ layersState }: SidebarProps) {
  const { layers, toggleLayer, setLayerOpacity, getLayer, toggleGroup, splitMode, setSplitMode } = layersState;
  const [statsOpen, setStatsOpen] = useState(false);

  // Group definitions
  const groups = [
    {
      id: 'batas',
      title: 'Batas Wilayah Penelitian',
      items: [{ id: 'boundary' as LayerId, label: 'Batas Kabupaten' }]
    },
    {
      id: 'composite',
      title: 'Citra Komposit & Cloud Masking',
      items: [
        { id: 'rgb2024' as LayerId, label: 'RGB Median 2024' },
        { id: 'rgb2025' as LayerId, label: 'RGB Median 2025' }
      ],
      hasSplit: true
    },
    {
      id: 'spectral',
      title: 'Indeks Spektral (Feature Stack)',
      items: [
        { id: 'ndvi2024' as LayerId, label: 'NDVI 2024' },
        { id: 'ndvi2025' as LayerId, label: 'NDVI 2025' },
        { id: 'ndmi2024' as LayerId, label: 'NDMI 2024' },
        { id: 'ndmi2025' as LayerId, label: 'NDMI 2025' }
      ]
    },
    {
      id: 'threshold',
      title: 'Raster Kelas (Threshold NDVI)',
      items: [
        { id: 'class2024' as LayerId, label: 'Raster Kelas 2024' },
        { id: 'class2025' as LayerId, label: 'Raster Kelas 2025' }
      ]
    },
    {
      id: 'samples',
      title: 'Training Sample',
      items: [
        { id: 'samples2024' as LayerId, label: 'Titik Sampel 2024' },
        { id: 'samples2025' as LayerId, label: 'Titik Sampel 2025' }
      ]
    },
    {
      id: 'rf',
      title: 'Hasil Klasifikasi Random Forest',
      items: [
        { id: 'rf2024' as LayerId, label: 'Klasifikasi RF 2024' },
        { id: 'rf2025' as LayerId, label: 'Klasifikasi RF 2025' }
      ]
    },
    {
      id: 'change',
      title: 'Deteksi Perubahan',
      items: [
        { id: 'changeDetection' as LayerId, label: 'Peta Perubahan Vegetasi' }
      ]
    }
  ];

  const isGroupActive = (items: {id: LayerId}[]) => {
    return items.some(item => getLayer(item.id).visible);
  };

  const handleGroupToggle = (items: {id: LayerId}[], checked: boolean) => {
    toggleGroup(items.map(i => i.id), checked);
  };

  return (
    <div className="w-[340px] h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 relative shrink-0">
      
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg leading-tight tracking-tight">WebGIS Analisis Vegetasi</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-3 font-medium">Kabupaten Bangka Barat 2024–2025</p>
        <div className="inline-block bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-4">
          UAS Maha Data 2025/2026
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-xs border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => setStatsOpen(true)}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Statistik & Evaluasi
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Accordion type="multiple" defaultValue={['batas', 'composite']} className="space-y-3">
          
          {groups.map((group) => (
            <AccordionItem 
              key={group.id} 
              value={group.id} 
              className="border border-border bg-card/50 rounded-lg overflow-hidden relative"
            >
              {/* Colored left border accent if group is active */}
              {isGroupActive(group.items) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10" />
              )}
              
              <div className="flex items-center justify-between px-3 pr-4 border-b border-border/50 bg-card hover:bg-secondary/50 transition-colors">
                <AccordionTrigger className="hover:no-underline py-3 text-sm font-semibold flex-1">
                  {group.title}
                </AccordionTrigger>
                <div onClick={(e) => e.stopPropagation()} className="pl-3">
                  <Switch 
                    checked={isGroupActive(group.items)}
                    onCheckedChange={(checked) => handleGroupToggle(group.items, checked)}
                    className="data-[state=checked]:bg-primary scale-75"
                  />
                </div>
              </div>
              
              <AccordionContent className="p-3 bg-background/30 space-y-4">
                
                {group.hasSplit && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <Button 
                      variant={splitMode ? "default" : "outline"} 
                      size="sm" 
                      className="w-full text-xs h-8"
                      onClick={() => setSplitMode(!splitMode)}
                    >
                      <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                      {splitMode ? "Matikan Split Map" : "Split Map / Swipe Layer"}
                    </Button>
                    {splitMode && (
                      <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        Geser slider di tengah map untuk membandingkan 2024 dan 2025
                      </p>
                    )}
                  </div>
                )}

                {!splitMode || !group.hasSplit ? (
                  group.items.map((item) => {
                    const layer = getLayer(item.id);
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id={`checkbox-${item.id}`} 
                            checked={layer.visible}
                            onCheckedChange={(checked) => toggleLayer(item.id, checked as boolean)}
                            className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <label 
                            htmlFor={`checkbox-${item.id}`}
                            className="text-xs font-medium leading-none cursor-pointer text-foreground/90 hover:text-foreground"
                          >
                            {item.label}
                          </label>
                        </div>
                        
                        {layer.visible && (
                          <div className="pl-7 pr-2 pt-1 flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground w-6">0%</span>
                            <Slider
                              value={[layer.opacity]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(vals) => setLayerOpacity(item.id, vals[0])}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">{layer.opacity}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-muted-foreground italic text-center py-2">
                    Kontrol dinonaktifkan dalam mode Split Map
                  </div>
                )}
                
              </AccordionContent>
            </AccordionItem>
          ))}

        </Accordion>

        <Legend layers={layers} />
      </div>

      <StatsModal open={statsOpen} onOpenChange={setStatsOpen} />
      
      {/* Custom scrollbar styles for sidebar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}
