/**
 * Leaflet GIS Engine Integration
 * Renders heatmaps, weather layers, and NDMA CAP v1.2 alert polygon boundaries
 */
const GisMapEngine = (() => {
  let map = null;
  let currentLayer = null;
  let capPolygonLayer = null;

  return {
    init(containerId, initialLat = 21.1458, initialLon = 79.0882) {
      map = L.map(containerId).setView([initialLat, initialLon], 6);

      // Dark Mode Base Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      // Add default marker
      L.marker([initialLat, initialLon]).addTo(map)
        .bindPopup("Selected Station: Nagpur Analytics Center")
        .openPopup();

      return map;
    },

    updateLocation(lat, lon, name) {
      if (!map) return;
      map.setView([lat, lon], 8);
      L.marker([lat, lon]).addTo(map)
        .bindPopup(`Station: ${name}`)
        .openPopup();
    },

    switchLayer(layerType) {
      if (!map) return;

      if (currentLayer) map.removeLayer(currentLayer);

      // Layer visualization simulation using Leaflet Circles
      const center = map.getCenter();
      
      if (layerType === "precipitation") {
        currentLayer = L.circle(center, {
          color: '#06b6d4',
          fillColor: '#06b6d4',
          fillOpacity: 0.35,
          radius: 60000
        }).addTo(map).bindTooltip("Precipitation Layer: 12.5 mm/h");
      } else if (layerType === "temp") {
        currentLayer = L.circle(center, {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.35,
          radius: 70000
        }).addTo(map).bindTooltip("Temperature Heatmap: 31.4°C");
      } else if (layerType === "wind") {
        currentLayer = L.circle(center, {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          radius: 80000
        }).addTo(map).bindTooltip("Wind Vectors: 18.2 km/h NW");
      }
    },

    /**
     * Render NDMA CAP v1.2 Geospatial Alert Polygons
     */
    renderCapAlertPolygon(areaPolygon, severity) {
      if (!map) return;
      if (capPolygonLayer) map.removeLayer(capPolygonLayer);

      const color = severity === "Severe" ? "#f43f5e" : "#f59e0b";

      capPolygonLayer = L.polygon(areaPolygon, {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);

      map.fitBounds(capPolygonLayer.getBounds());
    }
  };
})();