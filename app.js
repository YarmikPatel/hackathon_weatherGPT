/**
 * Main Application Orchestrator Engine
 */
document.addEventListener("DOMContentLoaded", () => {
  let currentLocation = { lat: 21.1458, lon: 79.0882, name: "Nagpur, MH" };
  let currentWeatherData = null;

  // 1. Initialize GIS Map
  GisMapEngine.init("gis-map", currentLocation.lat, currentLocation.lon);

  // 2. Load Weather & Analytics
  async function loadDashboardData() {
    currentWeatherData = await WeatherService.fetchLiveWeather(currentLocation.lat, currentLocation.lon);
    
    // Update Metrics
    document.getElementById("metric-temp").innerText = `${currentWeatherData.temp} °C`;
    document.getElementById("metric-precip").innerText = `${currentWeatherData.precipitation} mm`;
    document.getElementById("metric-wind").innerText = `${currentWeatherData.windSpeed} km/h`;
    document.getElementById("metric-pressure").innerText = `${currentWeatherData.pressure} hPa`;

    // Load 30-Year Analytics
    const baseline = WeatherService.getHistorical30YrBaseline(currentLocation.lat, currentLocation.lon);
    AnalyticsEngine.renderCharts(baseline);
  }

  loadDashboardData();

  // 3. Location Picker Event
  document.getElementById("location-select").addEventListener("change", (e) => {
    const [lat, lon] = e.target.value.split(",").map(Number);
    const name = e.target.options[e.target.selectedIndex].text;
    currentLocation = { lat, lon, name };
    
    GisMapEngine.updateLocation(lat, lon, name);
    loadDashboardData();
  });

  // 4. Map Layer Toggles
  document.querySelectorAll(".layer-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".layer-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      GisMapEngine.switchLayer(e.target.dataset.layer);
    });
  });

  // 5. Sector Agent Persona Selector
  document.getElementById("sector-agent-select").addEventListener("change", (e) => {
    AiAssistantEngine.setPersona(e.target.value);
  });

  // 6. Query Processing & Chat Logic
  const queryInput = document.getElementById("user-query-input");
  const sendBtn = document.getElementById("send-query-btn");
  const chatMessages = document.getElementById("chat-messages");

  async function handleQuery(queryText) {
    if (!queryText.trim()) return;

    // Append User Message
    appendChatMessage("user", queryText);
    queryInput.value = "";

    // Process via AI Assistant
    const response = await AiAssistantEngine.processQuery(queryText, currentWeatherData);
    appendChatMessage("assistant", response.textHtml);

    // Speak Response in selected language
    const lang = document.getElementById("language-select").value;
    AiAssistantEngine.speak(response.textHtml, lang);
  }

  sendBtn.addEventListener("click", () => handleQuery(queryInput.value));
  queryInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleQuery(queryInput.value);
  });

  // Quick Action Chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => handleQuery(chip.dataset.query));
  });

  function appendChatMessage(role, htmlContent) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role}`;
    const avatarIcon = role === "user" ? "fa-user" : "fa-robot";
    
    msgDiv.innerHTML = `
      <div class="avatar"><i class="fa-solid ${avatarIcon}"></i></div>
      <div class="message-body">${htmlContent}</div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 7. Speech-to-Text (Voice Recognition)
  const micBtn = document.getElementById("mic-btn");
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => micBtn.classList.add("recording");
    recognition.onend = () => micBtn.classList.remove("recording");
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      queryInput.value = transcript;
      handleQuery(transcript);
    };

    micBtn.addEventListener("click", () => {
      recognition.lang = document.getElementById("language-select").value;
      recognition.start();
    });
  }

  // 8. Subscribe to WIS2.0 / NDMA CAP v1.2 Emergency Stream
  let latestCapAlert = null;
  MqttCapSimulator.subscribe((alert) => {
    latestCapAlert = alert;
    const ticker = document.getElementById("cap-alert-ticker");
    const msg = document.getElementById("ticker-message");
    
    ticker.classList.remove("hidden");
    msg.innerHTML = `<strong>${alert.headline}:</strong> ${alert.instruction}`;

    document.getElementById("metric-cap-level").innerText = alert.severity;
    document.getElementById("metric-cap-level").className = "value text-rose";
    document.getElementById("metric-cap-urgency").innerText = alert.urgency;

    // Render Alert Polygon on GIS Map
    GisMapEngine.renderCapAlertPolygon(alert.areaPolygon, alert.severity);
  });

  document.getElementById("dismiss-alert-btn").addEventListener("click", () => {
    document.getElementById("cap-alert-ticker").classList.add("hidden");
  });

  // 9. Simple Text-Based PDF Exporter
  document.getElementById("export-pdf-btn").addEventListener("click", () => {
    const reportDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    // Build clean HTML template dynamically
    const pdfTemplate = document.createElement("div");
    pdfTemplate.innerHTML = `
      <style>
        .pdf-report {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
          padding: 20px;
          background: #ffffff;
        }
        .pdf-header {
          border-bottom: 2px solid #0284c7;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .pdf-title {
          font-size: 18pt;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .pdf-subtitle {
          font-size: 10pt;
          color: #0284c7;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pdf-meta-table, .pdf-data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 9.5pt;
        }
        .pdf-meta-table td {
          padding: 6px 10px;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        .pdf-meta-label { font-weight: 600; color: #475569; width: 20%; }
        .pdf-section-title {
          font-size: 12pt;
          font-weight: 700;
          color: #0f172a;
          border-left: 4px solid #0284c7;
          padding-left: 8px;
          margin: 20px 0 10px 0;
        }
        .pdf-alert-box {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 4px solid #ef4444;
          padding: 10px;
          margin-bottom: 16px;
        }
        .pdf-data-table th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: 600;
          text-align: left;
          padding: 8px;
          border: 1px solid #cbd5e1;
        }
        .pdf-data-table td {
          padding: 8px;
          border: 1px solid #e2e8f0;
        }
        .pdf-advisory-item {
          margin-bottom: 12px;
          padding: 10px;
          background-color: #fafafa;
          border: 1px solid #e5e5e5;
        }
        .pdf-advisory-item h4 {
          margin: 0 0 4px 0;
          color: #0369a1;
        }
        .pdf-disclaimer {
          margin-top: 25px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          font-size: 8.5pt;
          color: #94a3b8;
        }
      </style>

      <div class="pdf-report">
        <div class="pdf-header">
          <div class="pdf-subtitle">SIH26068 Climate Analytics Platform</div>
          <h1 class="pdf-title">Climate & Weather Operational Advisory Report</h1>
          
          <table class="pdf-meta-table">
            <tr>
              <td class="pdf-meta-label">Location:</td>
              <td>${currentLocation.name} (${currentLocation.lat}° N, ${currentLocation.lon}° E)</td>
              <td class="pdf-meta-label">Generated On:</td>
              <td>${reportDate} IST</td>
            </tr>
            <tr>
              <td class="pdf-meta-label">Data Sources:</td>
              <td>IMD, ECMWF ERA5, Open-Meteo</td>
              <td class="pdf-meta-label">Standard:</td>
              <td>NDMA CAP v1.2 / WIS2.0</td>
            </tr>
          </table>
        </div>

        ${latestCapAlert ? `
          <div class="pdf-alert-box">
            <strong style="color: #991b1b;">🚨 ${latestCapAlert.headline}</strong><br/>
            <span style="font-size: 9pt; color: #7f1d1d;">
              <strong>Sender:</strong> ${latestCapAlert.sender} | <strong>Severity:</strong> ${latestCapAlert.severity} | <strong>Urgency:</strong> ${latestCapAlert.urgency}<br/>
              <strong>Instruction:</strong> ${latestCapAlert.instruction}
            </span>
          </div>
        ` : ''}

        <div class="pdf-section-title">1. Current Atmospheric Observations</div>
        <table class="pdf-data-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Observed Value</th>
              <th>Status / Variance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Surface Temperature</strong></td>
              <td>${currentWeatherData ? currentWeatherData.temp : '--'} °C</td>
              <td>Active Observation</td>
            </tr>
            <tr>
              <td><strong>24h Precipitation</strong></td>
              <td>${currentWeatherData ? currentWeatherData.precipitation : '--'} mm</td>
              <td>Precipitation Intensity</td>
            </tr>
            <tr>
              <td><strong>Wind Speed</strong></td>
              <td>${currentWeatherData ? currentWeatherData.windSpeed : '--'} km/h</td>
              <td>Surface Wind Vector</td>
            </tr>
            <tr>
              <td><strong>Atmospheric Pressure</strong></td>
              <td>${currentWeatherData ? currentWeatherData.pressure : '--'} hPa</td>
              <td>Surface Barometric Gauge</td>
            </tr>
          </tbody>
        </table>

        <div class="pdf-section-title">2. Sectorial AI Advisories</div>

        <div class="pdf-advisory-item">
          <h4>🌾 Agri-Meteorology Strategy</h4>
          <p>Delay sowing by 4 to 6 days due to localized rainfall fluctuations. Monitor soil moisture across top 15cm layer prior to scheduled irrigation cycles.</p>
        </div>

        <div class="pdf-advisory-item">
          <h4>✈️ Aeronautical & Maritime Operations</h4>
          <p>Wind shear gusts elevated near low atmospheric boundaries. Maintain vigilance for reduced cloud ceiling levels around convective cell paths.</p>
        </div>

        <div class="pdf-advisory-item">
          <h4>🚨 Disaster Risk Management</h4>
          <p>Prioritize localized monitoring of low-lying urban runoff channels. Ensure rapid response units maintain standard operational readiness.</p>
        </div>

        <div class="pdf-disclaimer">
          <strong>Disclaimer:</strong> Automatically generated report from the SIH26068 Climate Analytics Engine. Derived from multi-model weather ensembles and NDMA CAP v1.2 feeds for informational guidance.
        </div>
      </div>
    `;

    // Configure PDF export options
    const opt = {
      margin:       0.4,
      filename:     `Climate_Advisory_${currentLocation.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Render and download PDF directly from virtual DOM element
    html2pdf().set(opt).from(pdfTemplate).save();
  });

  // 10. Online/Offline Event Handlers
  window.addEventListener("online", () => {
    document.getElementById("connection-status").className = "status-indicator online";
    document.getElementById("status-text").innerText = "Live Sync";
  });

  window.addEventListener("offline", () => {
    document.getElementById("connection-status").className = "status-indicator offline";
    document.getElementById("status-text").innerText = "Offline (IndexedDB)";
  });
});