import os
import geopandas as gpd

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    result_dir = os.path.join(base_dir, "Result")
    output_dir = os.path.join(
        base_dir,
        "webgis-bangka",
        "artifacts",
        "webgis-bangka-barat",
        "public",
        "data"
    )
    
    os.makedirs(output_dir, exist_ok=True)
    
    files_to_convert = [
        ("TrainingSample_BangkaBarat_2024.shp", "TrainingSample_BangkaBarat_2024.geojson"),
        ("TrainingSample_BangkaBarat_2025.shp", "TrainingSample_BangkaBarat_2025.geojson"),
    ]
    
    for shp_name, geojson_name in files_to_convert:
        shp_path = os.path.join(result_dir, shp_name)
        geojson_path = os.path.join(output_dir, geojson_name)
        
        if os.path.exists(shp_path):
            print(f"Mengonversi {shp_name} -> {geojson_name}...")
            gdf = gpd.read_file(shp_path)
            # Pastikan CRS adalah EPSG:4326 (WGS84)
            if gdf.crs and gdf.crs.to_string() != "EPSG:4326":
                gdf = gdf.to_crs(epsg=4326)
            gdf.to_file(geojson_path, driver="GeoJSON")
            print(f"[OK] Berhasil disimpan di {geojson_path}")
        else:
            print(f"[ERROR] File {shp_path} tidak ditemukan!")

if __name__ == "__main__":
    main()
