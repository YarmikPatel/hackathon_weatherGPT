/**
 * GIS Map Engine - Google Maps API Integration
 */
const GisMapEngine = {
  mapInstances: {},
  markers: {},

  init(elementId, lat, lon) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const coords = { lat: lat, lng: lon };

    // Dark-themed Google Maps styling to match your dark dashboard
    const darkMapStyle = [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }]
      }
    ];

    // Initialize Google Map
    const map = new google.maps.Map(container, {
      zoom: 10,
      center: coords,
      styles: darkMapStyle,
      disableDefaultUI: false,
      zoomControl: true
    });

    // Add Station Marker
    const marker = new google.maps.Marker({
      position: coords,
      map: map,
      title: "Selected Meteorological Station"
    });

    // Store references for dynamic updates
    this.mapInstances[elementId] = map;
    this.markers[elementId] = marker;
  },

  updateLocation(lat, lon, locationName) {
    const coords = { lat: lat, lng: lon };

    Object.keys(this.mapInstances).forEach(id => {
      const map = this.mapInstances[id];
      const marker = this.markers[id];

      if (map) {
        map.setCenter(coords);
      }
      if (marker) {
        marker.setPosition(coords);
        marker.setTitle(locationName);
      }
    });
  }
};