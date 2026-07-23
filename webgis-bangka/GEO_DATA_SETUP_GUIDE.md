# Panduan Lengkap Pendaftaran & Konversi Data Spasial WebGIS Bangka Barat

Panduan ini menjelaskan cara melakukan **load, pendaftaran layer backend (GeoServer / Python Server)**, serta **konversi format data spasial & raster terbaru** (`FeatureStack2024.tif`, `FeatureStack2025.tif`, dan `TrainingSample_BangkaBarat_2024/2025.shp`).

---

## 📁 1. Struktur & Lokasi Data File

Seluruh file spasial mentah berada pada direktori `Result/`:
- **Data Raster (GeoTIFF / BigTIFF 8-Band)**:
  - `Result/FeatureStack2024.tif` (~912 MB)
  - `Result/FeatureStack2025.tif` (~927 MB)
- **Data Vektor (Shapefile Training Samples)**:
  - `Result/TrainingSample_BangkaBarat_2024.shp` (+ `.dbf`, `.prj`, `.shx`, `.cpg`, `.fix`)
  - `Result/TrainingSample_BangkaBarat_2025.shp` (+ `.dbf`, `.prj`, `.shx`, `.cpg`, `.fix`)

---

## 🔄 2. Konversi Data Spasial (Tanpa GeoServer / Standalone WebGIS)

### A. Konversi Shapefile -> GeoJSON (Vektor)
Jalankan script Python otomatis yang telah disediakan di workspace:

```bash
python scripts/convert_data.py
```

Skrip ini secara otomatis:
1. Membaca `TrainingSample_BangkaBarat_2024.shp` dan `2025.shp` menggunakan `GeoPandas`.
2. Memastikan Sistem Referensi Spasial (CRS) berproyeksi `EPSG:4326` (WGS84).
3. Mempertahankan seluruh 9 atribut spasial (`class`, `NDVI`, `NDMI`, `B2`, `B3`, `B4`, `B8`, `B11`, `B12`).
4. Menyimpan output GeoJSON di `webgis-bangka/artifacts/webgis-bangka-barat/public/data/`.

---

### B. Konversi GeoTIFF -> Cloud Optimized GeoTIFF (COG) & XYZ Tiles (Raster)

Untuk menyajikan GeoTIFF 900MB+ secara efisien di web, Anda dapat mengonversi raster menjadi **Cloud Optimized GeoTIFF (COG)** menggunakan perintah GDAL / Python CLI:

#### 1. Perintah GDAL (GDAL CLI):
```bash
# Konversi FeatureStack2024 ke COG (Kompresi Deflate + Pyramids)
gdal_translate Result/FeatureStack2024.tif public/data/FeatureStack2024_cog.tif -of COG -co COMPRESS=DEFLATE

# Konversi FeatureStack2025 ke COG
gdal_translate Result/FeatureStack2025.tif public/data/FeatureStack2025_cog.tif -of COG -co COMPRESS=DEFLATE
```

#### 2. Generate XYZ Tile Pyramids (PNG Web Tiles per Zoom Level):
```bash
# Membuat struktur folder tiles/{z}/{x}/{y}.png untuk zoom 9 s/d 14
gdal2tiles.py -z 9-14 -w none Result/FeatureStack2024.tif public/tiles/2024/
gdal2tiles.py -z 9-14 -w none Result/FeatureStack2025.tif public/tiles/2025/
```

---

## 🏛️ 3. Pendaftaran Layer pada GeoServer (Backend Data Server)

Jika menggunakan **GeoServer** lokal (`http://localhost:8080/geoserver`):

### Step 1: Buat Workspace
1. Buka GeoServer Admin Console -> **Workspaces** -> **Add new workspace**.
2. **Name**: `bangka_barat`
3. **Namespace URI**: `http://webgis.bangkabarat.go.id/`

### Step 2: Daftarkan Data Store Raster (FeatureStack GeoTIFF)
1. Ke menu **Stores** -> **Add new Store** -> Pilih **GeoTIFF**.
2. **Workspace**: `bangka_barat`
3. **Data Source Name**: `FeatureStack2024`
4. **URL File**: `file:///C:/Users/ASUS/Downloads/Web-GIS-Interactive/Web-GIS-Interactive/Result/FeatureStack2024.tif`
5. Klik **Save** -> Klik **Publish** pada layer `FeatureStack2024`.
6. Pada tab **Data**, pastikan **Declared CRS** = `EPSG:4326` atau `EPSG:32648` (UTM Zone 48S). Klik **Compute from data** & **Compute from native bounds**.
7. Ulangi langkah di atas untuk `FeatureStack2025.tif`.

### Step 3: Daftarkan Data Store Vektor (Training Sample Shapefile)
1. Ke menu **Stores** -> **Add new Store** -> Pilih **Directory of spatial files (shapefiles)**.
2. **Workspace**: `bangka_barat`
3. **Data Source Name**: `TrainingSamples`
4. **Directory URL**: `file:///C:/Users/ASUS/Downloads/Web-GIS-Interactive/Web-GIS-Interactive/Result/`
5. Klik **Save** -> **Publish** pada layer `TrainingSample_BangkaBarat_2024` dan `TrainingSample_BangkaBarat_2025`.

### Step 4: Panggilan Layer WMS di Frontend Leaflet
GeoServer akan menyajikan layer WMS dengan URL berikut:
- **Raster 2024**: `http://localhost:8080/geoserver/bangka_barat/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=bangka_barat:FeatureStack2024&FORMAT=image/png`
- **Raster 2025**: `http://localhost:8080/geoserver/bangka_barat/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=bangka_barat:FeatureStack2025&FORMAT=image/png`
- **Vektor 2024**: `http://localhost:8080/geoserver/bangka_barat/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=bangka_barat:TrainingSample_BangkaBarat_2024&FORMAT=image/png`

---

## 🐍 4. Skrip Python Tile Server Standalone (Alternatif GeoServer)

Jika Anda ingin menjalankan server data raster sendiri dengan Python tanpa menginstal GeoServer:

```python
# tile_server.py
from fastapi import FastAPI, Response
import rasterio
from rasterio.windows import from_bounds
import numpy as np
from PIL import Image
import io

app = FastAPI(title="WebGIS Raster Data Server")

RASTER_PATHS = {
    "2024": "Result/FeatureStack2024.tif",
    "2025": "Result/FeatureStack2025.tif"
}

@app.get("/api/raster/{year}/wms")
def get_wms_tile(year: str, bbox: str, width: int = 256, height: int = 256):
    minx, miny, maxx, maxy = map(float, bbox.split(","))
    path = RASTER_PATHS.get(year)
    if not path:
        return Response(status_code=404)
        
    with rasterio.open(path) as src:
        window = from_bounds(minx, miny, maxx, maxy, src.transform)
        # Baca 3 band pertama untuk True Color RGB (Band 1, 2, 3)
        data = src.read((1, 2, 3), window=window, out_shape=(3, height, width))
        
        # Normalisasi ke 0-255 uint8
        data = np.nan_to_num(data)
        data = np.clip((data / data.max()) * 255, 0, 255).astype(np.uint8)
        img = Image.fromarray(np.moveaxis(data, 0, -1))
        
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return Response(content=buffer.getvalue(), media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🎨 5. Komponen Frontend Layer Control Interaktif

Aplikasi React di `webgis-bangka-barat` telah dilengkapi komponen **`LayerControl.tsx`** dengan fitur:
- 📅 **Sakelar Tahun Data**: Beralih antara **2024**, **2025**, atau tampilan **Komparasi (2024 & 2025)**.
- 🎛️ **Filter Jenis Data**:
  - 🟩 **Raster (FeatureStack)**: Mengontrol visibilitas & transparansi layer citra satelit `FeatureStack2024.tif` / `FeatureStack2025.tif`.
  - 📍 **Vektor (Training Samples)**: Mengontrol visibilitas titik sampel `TrainingSample_BangkaBarat_2024` / `2025` lengkap dengan popup atribut (`NDVI`, `NDMI`, `class`, `B2-B12`).
  - 📐 **Batas Wilayah**: Sakelar batas administrasi Kabupaten Bangka Barat.
- ⚙️ **Mode Sumber Data**: Tombol ikon server di pojok kanan atas `LayerControl` untuk berpindah mode antara **Web Preview (Standalone)** dan **GeoServer WMS**.
