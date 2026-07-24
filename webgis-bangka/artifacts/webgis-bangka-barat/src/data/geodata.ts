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

// Seeded PRNG
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Generate deterministic points matching GEE seeds
function generatePoints(countPerClass: number, year: number, seed: number) {
  const random = mulberry32(seed);
  const points = [];
  const classes = ['Vegetasi', 'Non-Vegetasi'];
  
  for (const label of classes) {
    for (let i = 0; i < countPerClass; i++) {
      const lat = -1.65 - (random() * 0.45);
      const lng = 105.10 + (random() * 0.80);
      points.push({
        type: 'Feature',
        properties: {
          class: label,
          year: year
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }
  }
  return points;
}

export const samples2024 = {
  type: 'FeatureCollection',
  features: generatePoints(75, 2024, 123)
};

export const samples2025 = {
  type: 'FeatureCollection',
  features: generatePoints(75, 2025, 456)
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
