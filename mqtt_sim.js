/**
 * WIS2.0 / NDMA CAP v1.2 Emergency Alert Simulator
 * Delivers real-time emergency broadcast warning payloads over simulated WebSocket/MQTT
 */
const MqttCapSimulator = (() => {
  let alertCallback = null;

  const mockCapAlerts = [
    {
      identifier: "NDMA-CAP-2026-0891",
      sender: "IMD_Cyclone_Warning_Center",
      sent: "2026-09-05T10:30:00+05:30",
      status: "Actual",
      msgType: "Alert",
      severity: "Severe",
      urgency: "Immediate",
      certainty: "Observed",
      headline: "FLASH FLOOD & HEAVY MONSOON RAIN WARNING",
      description: "Severe convective storm activity detected. Extreme rainfall (>100mm/12h) predicted over Vidarbha region.",
      instruction: "Avoid low-lying areas. Move livestock to safe elevation. Keep emergency supplies ready.",
      areaPolygon: [
        [21.0, 78.8],
        [21.3, 78.8],
        [21.3, 79.3],
        [21.0, 79.3]
      ]
    },
    {
      identifier: "NDMA-CAP-2026-0412",
      sender: "AAI_Aeronautical_Met_Office",
      sent: "2026-09-05T11:00:00+05:30",
      status: "Actual",
      msgType: "Alert",
      severity: "Moderate",
      urgency: "Expected",
      certainty: "Likely",
      headline: "AVIATION ADVISORY: LOW CLOUD CEILING & WIND SHEAR",
      description: "Wind gusts exceeding 35 knots with cumulonimbus clouds at 1,500 ft near Delhi airspace.",
      instruction: "Flight operations delay expected. Divert small aircraft to alternative airfields.",
      areaPolygon: [
        [28.4, 77.0],
        [28.8, 77.0],
        [28.8, 77.4],
        [28.4, 77.4]
      ]
    }
  ];

  return {
    subscribe(callback) {
      alertCallback = callback;
      // Start periodic push simulation
      this.triggerSimulation();
    },

    triggerSimulation() {
      // Broadcast initial alert after 3 seconds
      setTimeout(() => {
        if (alertCallback) {
          alertCallback(mockCapAlerts[0]);
        }
      }, 3000);

      // Alternate alerts every 30 seconds
      let index = 1;
      setInterval(() => {
        if (alertCallback) {
          alertCallback(mockCapAlerts[index % mockCapAlerts.length]);
          index++;
        }
      }, 30000);
    }
  };
})();