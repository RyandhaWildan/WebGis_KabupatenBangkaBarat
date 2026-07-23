// ============================================================
// KLASIFIKASI TUTUPAN VEGETASI KABUPATEN BANGKA BARAT
// Google Earth Engine (GEE) — Updated Script
// Sentinel-2 SR | Random Forest | Change Detection 2024-2025
// ============================================================

// ──────────────────────────────────────────────────────────────
// 1. LOAD BATAS WILAYAH PRESISI (dari Asset / FeatureCollection)
// ──────────────────────────────────────────────────────────────
// Ganti path di bawah sesuai lokasi asset Anda di GEE Assets panel
var batas_bangkabarat = ee.FeatureCollection(
  'projects/YOUR_GEE_PROJECT/assets/batas_bangkabarat'
);

// Ambil geometry tunggal untuk digunakan sebagai AOI
var aoi = batas_bangkabarat.geometry();

// ──────────────────────────────────────────────────────────────
// 2. KONFIGURASI & FUNGSI CLOUD MASKING SENTINEL-2
// ──────────────────────────────────────────────────────────────
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask  = 1 << 10;  // Bit 10: Opaque clouds
  var cirrusBitMask = 1 << 11;  // Bit 11: Cirrus clouds
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
               .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

function maskS2probability(image) {
  var cloudProb = ee.Image(image.get('cloud_mask')).select('probability');
  var isNotCloud = cloudProb.lt(20); // Toleransi tutupan awan < 20%
  return image.updateMask(isNotCloud);
}

function addIndices(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI');
  return image.addBands([ndvi, ndmi]);
}

// ──────────────────────────────────────────────────────────────
// 3. LOAD & PREPROCESS CITRA SENTINEL-2 (2024 & 2025)
// ──────────────────────────────────────────────────────────────

// --- Periode 2024: Setahun Penuh (Januari-Desember 2024) ---
var s2_2024_prob = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
  .filterDate('2024-01-01', '2024-12-31')
  .filterBounds(aoi);

var s2_2024_sr = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2024-01-01', '2024-12-31')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

var s2_2024_joined = ee.Join.saveFirst('cloud_mask').apply({
  primary:   s2_2024_sr,
  secondary: s2_2024_prob,
  condition: ee.Filter.equals({ leftField: 'system:index', rightField: 'system:index' })
});

var composite2024 = ee.ImageCollection(s2_2024_joined)
  .map(maskS2probability)
  .map(maskS2clouds)
  .map(addIndices)
  .median()
  .select(['B2','B3','B4','B8','B11','B12','NDVI','NDMI']);

// --- Periode 2025: Setahun Penuh (Januari-Desember 2025) ---
var s2_2025_prob = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
  .filterDate('2025-01-01', '2025-12-31')
  .filterBounds(aoi);

var s2_2025_sr = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2025-01-01', '2025-12-31')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

var s2_2025_joined = ee.Join.saveFirst('cloud_mask').apply({
  primary:   s2_2025_sr,
  secondary: s2_2025_prob,
  condition: ee.Filter.equals({ leftField: 'system:index', rightField: 'system:index' })
});

var composite2025 = ee.ImageCollection(s2_2025_joined)
  .map(maskS2probability)
  .map(maskS2clouds)
  .map(addIndices)
  .median()
  .select(['B2','B3','B4','B8','B11','B12','NDVI','NDMI']);

// ──────────────────────────────────────────────────────────────
// 4. GROUND TRUTH & TRAINING SAMPLES
// ──────────────────────────────────────────────────────────────
// Ganti path sesuai asset titik ground truth Anda di GEE
var groundTruth = ee.FeatureCollection(
  'projects/YOUR_GEE_PROJECT/assets/ground_truth_bangkabarat'
);

var trainingData = composite2024.sampleRegions({
  collection: groundTruth,
  properties: ['class'],  // 0 = Non-Vegetasi, 1 = Vegetasi
  scale:      10,
  seed:       42,
  geometries: true
});

// Split 70% Train / 30% Test
var withRandom = trainingData.randomColumn('random', 42);
var trainSet   = withRandom.filter(ee.Filter.lt('random', 0.7));
var testSet    = withRandom.filter(ee.Filter.gte('random', 0.7));

// ──────────────────────────────────────────────────────────────
// 5. RANDOM FOREST CLASSIFIER (100 Trees, Seed 42)
// ──────────────────────────────────────────────────────────────
var classifier = ee.Classifier.smileRandomForest({
  numberOfTrees: 100,
  seed: 42
}).train({
  features:        trainSet,
  classProperty:   'class',
  inputProperties: ['B2','B3','B4','B8','B11','B12','NDVI','NDMI']
});

// ──────────────────────────────────────────────────────────────
// 6. KLASIFIKASI & CLIP KE BATAS BANGKA BARAT (PRESISI)
// ──────────────────────────────────────────────────────────────

// Klasifikasi 2024
var classified2024 = composite2024.classify(classifier)
  .clip(batas_bangkabarat);  // << CLIP ke batas shapefile presisi

// Klasifikasi 2025
var classified2025 = composite2025.classify(classifier)
  .clip(batas_bangkabarat);  // << CLIP ke batas shapefile presisi

// ──────────────────────────────────────────────────────────────
// 7. CHANGE DETECTION (Analisis Perubahan 2024 -> 2025)
//    Nilai: 0=Tetap Non-Veg | 1=Gain Veg | 2=Loss Veg | 3=Tetap Veg
// ──────────────────────────────────────────────────────────────
var changeMap = composite2024.classify(classifier)
  .multiply(2)
  .add(composite2025.classify(classifier))
  .clip(batas_bangkabarat);  // << CLIP ke batas shapefile presisi

// ──────────────────────────────────────────────────────────────
// 8. PARAMETER VISUALISASI
// ──────────────────────────────────────────────────────────────
var visRGB = { bands: ['B4','B3','B2'], min: 0, max: 0.3, gamma: 1.4 };

var visNDVI = {
  min: -0.1, max: 0.8,
  palette: ['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850']
};

var visNDMI = {
  min: -0.3, max: 0.5,
  palette: ['#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6']
};

var visClassified = {
  min: 0, max: 1,
  palette: ['#ef4444','#22c55e']  // 0=Merah (Non-Veg) | 1=Hijau (Vegetasi)
};

var visChange = {
  min: 0, max: 3,
  palette: [
    '#dc2626',  // 0 = Tetap Non-Vegetasi
    '#2563eb',  // 1 = Gain Vegetasi (Revegetasi)
    '#eab308',  // 2 = Loss Vegetasi (Deforestasi)
    '#16a34a'   // 3 = Tetap Vegetasi
  ]
};

// ──────────────────────────────────────────────────────────────
// 9. TAMPILKAN LAYER DI PETA
//    ** Layer AOI/BoundingBox oranye TELAH DIHAPUS **
// ──────────────────────────────────────────────────────────────

Map.addLayer(
  composite2024.clip(batas_bangkabarat),
  visRGB, 'RGB Komposit 2024', false
);
Map.addLayer(
  composite2025.clip(batas_bangkabarat),
  visRGB, 'RGB Komposit 2025', false
);
Map.addLayer(
  composite2024.select('NDVI').clip(batas_bangkabarat),
  visNDVI, 'NDVI 2024', false
);
Map.addLayer(
  composite2025.select('NDVI').clip(batas_bangkabarat),
  visNDVI, 'NDVI 2025', false
);
Map.addLayer(
  composite2024.select('NDMI').clip(batas_bangkabarat),
  visNDMI, 'NDMI 2024', false
);
Map.addLayer(
  composite2025.select('NDMI').clip(batas_bangkabarat),
  visNDMI, 'NDMI 2025', false
);
Map.addLayer(classified2024, visClassified, 'Klasifikasi RF 2024', false);
Map.addLayer(classified2025, visClassified, 'Klasifikasi RF 2025', false);
Map.addLayer(changeMap,      visChange,     'Change Detection 2024->2025', true);

// ──────────────────────────────────────────────────────────────
// 10. OUTLINE BATAS BANGKA BARAT — Garis Hijau, Fill Transparan
//     Menggunakan .paint() agar hanya garis batas yang tampil
//     (tidak ada warna isian / transparent fill)
// ──────────────────────────────────────────────────────────────
var batasOutline = ee.Image().byte().paint({
  featureCollection: batas_bangkabarat,
  color: 1,    // Nilai piksel untuk border
  width: 2     // Ketebalan garis batas (piksel)
});

Map.addLayer(
  batasOutline,
  { palette: ['#00ff88'], opacity: 0.95 },
  'Batas Kab. Bangka Barat',
  true  // Selalu visible
);

// ──────────────────────────────────────────────────────────────
// 11. PUSATKAN PETA KE BATAS BANGKA BARAT
// ──────────────────────────────────────────────────────────────
Map.centerObject(batas_bangkabarat, 10);

// ──────────────────────────────────────────────────────────────
// 12. EVALUASI AKURASI MODEL
// ──────────────────────────────────────────────────────────────
var testClassified = testSet.classify(classifier);
var confMatrix     = testClassified.errorMatrix('class', 'classification');

print('=== EVALUASI AKURASI MODEL ===');
print('Confusion Matrix:',       confMatrix);
print('Overall Accuracy:',       confMatrix.accuracy());
print('Kappa Coefficient:',      confMatrix.kappa());
print('Consumer Accuracy (UA):', confMatrix.consumersAccuracy());
print('Producer Accuracy (PA):', confMatrix.producersAccuracy());

// ──────────────────────────────────────────────────────────────
// 13. STATISTIK LUAS VEGETASI (Hektar)
// ──────────────────────────────────────────────────────────────
var calcArea = function(classifiedImg) {
  return classifiedImg.eq(1).multiply(ee.Image.pixelArea()).divide(10000)
    .reduceRegion({ reducer: ee.Reducer.sum(), geometry: aoi, scale: 10, maxPixels: 1e13 });
};
print('Luas Vegetasi 2024 (Ha):', calcArea(classified2024));
print('Luas Vegetasi 2025 (Ha):', calcArea(classified2025));

// ──────────────────────────────────────────────────────────────
// 14. EKSPOR HASIL KE GOOGLE DRIVE (Opsional)
// ──────────────────────────────────────────────────────────────
Export.image.toDrive({
  image: changeMap, description: 'ChangeDetection_BangkaBarat_2024_2025',
  folder: 'GEE_BangkaBarat', fileNamePrefix: 'change_detection_bangkabarat',
  region: aoi, scale: 10, crs: 'EPSG:4326', maxPixels: 1e13
});
Export.image.toDrive({
  image: classified2025, description: 'Klasifikasi_RF_BangkaBarat_2025',
  folder: 'GEE_BangkaBarat', fileNamePrefix: 'rf_classification_2025',
  region: aoi, scale: 10, crs: 'EPSG:4326', maxPixels: 1e13
});

// ──────────────────────────────────────────────────────────────
// 15. PANEL LEGENDA
// ──────────────────────────────────────────────────────────────
var legend = ui.Panel({ style: { position: 'bottom-left', padding: '8px 12px', backgroundColor: '#1e293b' } });
legend.add(ui.Label({ value: 'Change Detection 2024->2025', style: { fontWeight: 'bold', fontSize: '13px', color: '#f1f5f9', margin: '0 0 6px 0' } }));

[
  { color: '#16a34a', label: 'Tetap Vegetasi'              },
  { color: '#dc2626', label: 'Tetap Non-Vegetasi'          },
  { color: '#eab308', label: 'Loss Vegetasi (Deforestasi)' },
  { color: '#2563eb', label: 'Gain Vegetasi (Revegetasi)'  },
].forEach(function(item) {
  var row = ui.Panel({ layout: ui.Panel.Layout.flow('horizontal') });
  row.add(ui.Label({ style: { backgroundColor: item.color, padding: '8px', margin: '0 6px 4px 0' } }));
  row.add(ui.Label({ value: item.label, style: { margin: '2px 0', fontSize: '12px', color: '#e2e8f0' } }));
  legend.add(row);
});
Map.add(legend);
