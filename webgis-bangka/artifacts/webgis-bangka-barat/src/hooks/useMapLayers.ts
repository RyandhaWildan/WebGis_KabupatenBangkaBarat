import { useState, useCallback } from 'react';

export type LayerId = 
  | 'boundary'
  | 'rgb2024'
  | 'rgb2025'
  | 'ndvi2024'
  | 'ndvi2025'
  | 'ndmi2024'
  | 'ndmi2025'
  | 'class2024'
  | 'class2025'
  | 'samples2024'
  | 'samples2025'
  | 'rf2024'
  | 'rf2025'
  | 'changeDetection';

export interface LayerState {
  id: LayerId;
  visible: boolean;
  opacity: number;
}

const defaultLayers: LayerState[] = [
  { id: 'boundary', visible: true, opacity: 100 },
  { id: 'rgb2024', visible: true, opacity: 100 },
  { id: 'rgb2025', visible: false, opacity: 100 },
  { id: 'ndvi2024', visible: false, opacity: 100 },
  { id: 'ndvi2025', visible: false, opacity: 100 },
  { id: 'ndmi2024', visible: false, opacity: 100 },
  { id: 'ndmi2025', visible: false, opacity: 100 },
  { id: 'class2024', visible: false, opacity: 100 },
  { id: 'class2025', visible: false, opacity: 100 },
  { id: 'samples2024', visible: false, opacity: 100 },
  { id: 'samples2025', visible: false, opacity: 100 },
  { id: 'rf2024', visible: false, opacity: 100 },
  { id: 'rf2025', visible: false, opacity: 100 },
  { id: 'changeDetection', visible: false, opacity: 100 },
];

export function useMapLayers() {
  const [layers, setLayers] = useState<LayerState[]>(defaultLayers);
  const [splitMode, setSplitMode] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage

  const toggleLayer = useCallback((id: LayerId, visible?: boolean) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id 
        ? { ...layer, visible: visible !== undefined ? visible : !layer.visible } 
        : layer
    ));
  }, []);

  const setLayerOpacity = useCallback((id: LayerId, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, opacity } : layer
    ));
  }, []);

  const getLayer = useCallback((id: LayerId) => {
    return layers.find(l => l.id === id) || { id, visible: false, opacity: 100 };
  }, [layers]);

  const toggleGroup = useCallback((layerIds: LayerId[], visible: boolean) => {
    setLayers(prev => prev.map(layer => 
      layerIds.includes(layer.id) ? { ...layer, visible } : layer
    ));
  }, []);

  return {
    layers,
    toggleLayer,
    setLayerOpacity,
    getLayer,
    toggleGroup,
    splitMode,
    setSplitMode,
    splitPosition,
    setSplitPosition
  };
}
