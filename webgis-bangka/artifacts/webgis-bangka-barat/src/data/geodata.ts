type FeatureCollection<T = any> = any;
type Polygon = any;

export const bounds: [[number, number], [number, number]] = [[-2.15, 105.00], [-1.50, 106.00]];
export const center: [number, number] = [-1.83, 105.45];

// Polygon kasar wilayah Kabupaten Bangka Barat
export const bangkaBaratBoundary: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Kabupaten Bangka Barat' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.15, -1.60],
            [105.40, -1.55],
            [105.75, -1.68],
            [105.90, -1.95],
            [105.65, -2.10],
            [105.35, -2.05],
            [105.08, -1.85],
            [105.15, -1.60]
          ]
        ]
      }
    }
  ]
};

// Generate dummy points for training samples (dalam batas wilayah Bangka Barat)
function generatePoints(count: number, year: number) {
  const points = [];
  for (let i = 0; i < count; i++) {
    // Spread titik di dalam batas koordinat Bangka Barat
    const lat = -1.65 - (Math.random() * 0.45);  // -1.65 s/d -2.10
    const lng = 105.10 + (Math.random() * 0.80);  // 105.10 s/d 105.90
    const isVegetation = Math.random() > 0.4;
    points.push({
      type: 'Feature',
      properties: {
        class: isVegetation ? 'Vegetasi' : 'Non-Vegetasi',
        year: year
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });
  }
  return points;
}

// 75 titik per kelas (Vegetasi & Non-Vegetasi) = 150 titik total, stratified sampling
export const samples2024 = {
  type: 'FeatureCollection',
  features: generatePoints(75, 2024)
};

export const samples2025 = {
  type: 'FeatureCollection',
  features: generatePoints(75, 2025)
};

// Helper to create colored canvas for ImageOverlay
export function createColoredCanvas(color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 100, 100);
  }
  return canvas.toDataURL('image/png');
}

export function createGradientCanvas(color1: string, color2: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
  }
  return canvas.toDataURL('image/png');
}

export function createMultiColorCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Loss
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.4)'; // Gain
    ctx.fillRect(50, 0, 50, 50);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.4)'; // Stable Veg
    ctx.fillRect(0, 50, 50, 50);
    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)'; // Stable Non-veg
    ctx.fillRect(50, 50, 50, 50);
  }
  return canvas.toDataURL('image/png');
}

// Map Layer Assets (dummy data URLs)
export const layerAssets = {
  rgb2024: createColoredCanvas('rgba(139, 69, 19, 0.5)'), // Warm tan/brown
  rgb2025: createColoredCanvas('rgba(85, 107, 47, 0.5)'), // Slightly greenish
  ndvi2024: createGradientCanvas('rgba(255, 255, 255, 0.4)', 'rgba(34, 139, 34, 0.6)'), // White to green
  ndvi2025: createGradientCanvas('rgba(240, 255, 240, 0.4)', 'rgba(0, 100, 0, 0.6)'), // Darker green
  ndmi2024: createColoredCanvas('rgba(70, 130, 180, 0.5)'), // Blue
  ndmi2025: createColoredCanvas('rgba(0, 0, 139, 0.5)'), // Darker blue
  class2024: createGradientCanvas('rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)'),
  class2025: createGradientCanvas('rgba(200, 0, 0, 0.5)', 'rgba(0, 200, 0, 0.5)'),
  rf2024: createGradientCanvas('rgba(255, 50, 50, 0.5)', 'rgba(50, 255, 50, 0.5)'),
  rf2025: createGradientCanvas('rgba(200, 50, 50, 0.5)', 'rgba(50, 200, 50, 0.5)'),
  changeDetection: createMultiColorCanvas()
};
