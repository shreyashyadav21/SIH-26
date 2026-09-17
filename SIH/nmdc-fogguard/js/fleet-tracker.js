// ============================================================
// NMDC FogGuard – Fleet Tracker (V2V/V2I Simulation)
// ============================================================

const FleetTracker = (() => {
  let map = null;
  let markers = [];
  let updateInterval = null;
  let fleetData = [];
  let alertCallback = null;
  let operatorMarker = null;
  let operatorAccuracy = null;
  let geoWatchId = null;
  let hasCenteredOnOperator = false;

  // Bailadila region coordinates (approx)
  const BASE_LAT = 18.7456;
  const BASE_LNG = 81.2765;

  const VEHICLE_NAMES = [
    'DMP-01', 'DMP-02', 'DMP-03', 'DMP-04', 'DMP-05',
    'DMP-06', 'DMP-07', 'DMP-08', 'DMP-09', 'DMP-10'
  ];

  const ROAD_SEGMENTS = [
    { name: 'Haul Road A – Pit to Crusher', lat: 18.748, lng: 81.274 },
    { name: 'Haul Road B – Crusher to ROM', lat: 18.742, lng: 81.280 },
    { name: 'Haul Road C – Summit Road', lat: 18.750, lng: 81.283 },
    { name: 'Haul Road D – Return Track', lat: 18.737, lng: 81.271 },
  ];

  function initFleet() {
    fleetData = VEHICLE_NAMES.map((name, i) => ({
      id: name,
      lat: BASE_LAT + (Math.random() - 0.5) * 0.02,
      lng: BASE_LNG + (Math.random() - 0.5) * 0.02,
      speed: Math.round(10 + Math.random() * 30),
      heading: Math.random() * 360,
      fogLevel: 'CLEAR',
      status: 'ACTIVE',
      lastUpdate: Date.now(),
      payload: Math.round(50 + Math.random() * 200),
      roadSegment: ROAD_SEGMENTS[i % ROAD_SEGMENTS.length].name,
      engineTemp: Math.round(70 + Math.random() * 30),
      fuelLevel: Math.round(40 + Math.random() * 60),
      tripCount: Math.round(3 + Math.random() * 8)
    }));
    return fleetData;
  }

  function initMap(containerId) {
    if (!window.L) return;
    map = L.map(containerId, {
      center: [BASE_LAT, BASE_LNG],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OSM © CARTO',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Road zone overlays
    ROAD_SEGMENTS.forEach(seg => {
      L.circle([seg.lat, seg.lng], {
        color: 'rgba(0, 242, 255, 0.4)',
        fillColor: 'rgba(0, 242, 255, 0.06)',
        fillOpacity: 0.3,
        radius: 200,
        weight: 1,
        dashArray: '4,8'
      }).addTo(map)
        .bindTooltip(`<div style="font-family:monospace;font-size:11px;color:#00f2ff">${seg.name}</div>`, {
          permanent: false,
          direction: 'top',
          className: 'fog-tooltip'
        });
    });

    // Fog zone circle (hilltop mining area)
    L.circle([BASE_LAT + 0.005, BASE_LNG + 0.005], {
      color: 'rgba(255,59,59,0.5)',
      fillColor: 'rgba(255,59,59,0.08)',
      fillOpacity: 0.4,
      radius: 400,
      weight: 1.5,
      dashArray: '6,6'
    }).addTo(map)
      .bindTooltip('<div style="font-family:monospace;font-size:11px;color:#ff3b3b">⚠ HIGH FOG ZONE</div>', {
        permanent: true,
        direction: 'top',
        className: 'fog-tooltip'
      });

    return map;
  }

  function updateGPSStatus(message, state = 'waiting') {
    document.querySelectorAll('[data-gps-status]').forEach(el => {
      el.textContent = message;
      el.dataset.gpsState = state;
    });
  }

  function locateOperator() {
    if (!map || !navigator.geolocation) {
      updateGPSStatus('GPS unavailable in this browser', 'error');
      return false;
    }

    if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
    updateGPSStatus('Requesting GPS location…', 'loading');

    geoWatchId = navigator.geolocation.watchPosition(position => {
      const { latitude, longitude, accuracy } = position.coords;
      const point = [latitude, longitude];
      if (!operatorMarker) {
        operatorMarker = L.circleMarker(point, {
          radius: 8,
          color: '#2f716b',
          weight: 3,
          fillColor: '#9bcfc4',
          fillOpacity: 1
        }).addTo(map).bindTooltip('Control room location', { direction: 'top' });
        operatorAccuracy = L.circle(point, {
          radius: accuracy,
          color: '#2f716b',
          weight: 1,
          fillColor: '#2f716b',
          fillOpacity: 0.1
        }).addTo(map);
      } else {
        operatorMarker.setLatLng(point);
        operatorAccuracy.setLatLng(point).setRadius(accuracy);
      }

      if (!hasCenteredOnOperator) {
        map.setView(point, Math.max(map.getZoom(), 14));
        hasCenteredOnOperator = true;
      }
      updateGPSStatus(`GPS active · ±${Math.round(accuracy)}m accuracy`, 'active');
      document.dispatchEvent(new CustomEvent('operatorLocationUpdated', {
        detail: { latitude, longitude, accuracy, timestamp: position.timestamp }
      }));
    }, error => {
      const messages = {
        1: 'GPS permission denied',
        2: 'GPS position unavailable',
        3: 'GPS request timed out'
      };
      updateGPSStatus(messages[error.code] || 'GPS error', 'error');
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
    return true;
  }

  function stopOperatorLocation() {
    if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
    hasCenteredOnOperator = false;
    updateGPSStatus('GPS paused', 'waiting');
  }

  function getVehicleIcon(vehicle) {
    const colors = {
      HALTED: '#ff3b3b',
      CAUTION: '#ffd740',
      ACTIVE: '#00e676'
    };
    const color = colors[vehicle.status] || '#00d4ff';

    return L.divIcon({
      html: `<div style="
        background: rgba(5,10,20,0.9);
        border: 2px solid ${color};
        border-radius: 8px;
        padding: 4px 7px;
        font-family: Orbitron, monospace;
        font-size: 9px;
        font-weight: 700;
        color: ${color};
        box-shadow: 0 0 10px ${color}60;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>🚛</span>
        <span>${vehicle.id}</span>
        <span style="font-size:7px;opacity:0.7">${vehicle.speed}km/h</span>
      </div>`,
      iconAnchor: [50, 16],
      iconSize: [100, 32],
      className: ''
    });
  }

  function renderFleetMarkers() {
    if (!map) return;

    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    fleetData.forEach(vehicle => {
      const icon = getVehicleIcon(vehicle);
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 200px; background: #0a1628; color: #e8f4fd; padding: 4px;">
            <div style="font-family: Orbitron, monospace; font-size: 13px; color: #ff6b1a; margin-bottom: 8px;">🚛 ${vehicle.id}</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
              <div><span style="color:#4a6880">Status:</span> <span style="color:${vehicle.status==='HALTED'?'#ff3b3b':vehicle.status==='CAUTION'?'#ffd740':'#00e676'}">${vehicle.status}</span></div>
              <div><span style="color:#4a6880">Speed:</span> <span>${vehicle.speed} km/h</span></div>
              <div><span style="color:#4a6880">Fog:</span> <span>${vehicle.fogLevel}</span></div>
              <div><span style="color:#4a6880">Payload:</span> <span>${vehicle.payload}T</span></div>
              <div><span style="color:#4a6880">Fuel:</span> <span>${vehicle.fuelLevel}%</span></div>
              <div><span style="color:#4a6880">Trips:</span> <span>${vehicle.tripCount}</span></div>
            </div>
            <div style="margin-top:8px; font-size:10px; color:#4a6880">${vehicle.roadSegment}</div>
          </div>
        `, { className: 'fleet-popup' });
      markers.push(marker);
    });
  }

  function updateFleet(fogLevel) {
    fleetData = fleetData.map(v => {
      // Update position (simulate movement)
      const speed = v.status === 'HALTED' ? 0 : v.speed;
      const headingRad = v.heading * Math.PI / 180;
      const moveDist = (speed / 3600) * (500 / 111000); // approx degrees per 500ms

      let newLat = v.lat + Math.cos(headingRad) * moveDist;
      let newLng = v.lng + Math.sin(headingRad) * moveDist;

      // Boundary check – keep within mine area
      const latBound = 0.015, lngBound = 0.015;
      if (Math.abs(newLat - BASE_LAT) > latBound) newLat = BASE_LAT + (Math.random() - 0.5) * 0.01;
      if (Math.abs(newLng - BASE_LNG) > lngBound) newLng = BASE_LNG + (Math.random() - 0.5) * 0.01;

      // Determine status based on fog
      let status = 'ACTIVE';
      let newSpeed = v.speed;

      if (fogLevel === 'CRITICAL') {
        status = 'HALTED'; newSpeed = 0;
      } else if (fogLevel === 'DENSE') {
        status = Math.random() > 0.3 ? 'CAUTION' : 'HALTED';
        newSpeed = status === 'HALTED' ? 0 : Math.round(5 + Math.random() * 10);
      } else if (fogLevel === 'MODERATE') {
        status = 'CAUTION';
        newSpeed = Math.round(10 + Math.random() * 15);
      } else {
        status = 'ACTIVE';
        newSpeed = Math.round(25 + Math.random() * 20);
      }

      // Random heading change
      const headingDelta = (Math.random() - 0.5) * 30;

      return {
        ...v,
        lat: newLat,
        lng: newLng,
        speed: newSpeed,
        heading: (v.heading + headingDelta + 360) % 360,
        status,
        fogLevel,
        lastUpdate: Date.now()
      };
    });

    // V2V proximity check
    checkProximity();
    renderFleetMarkers();
    updateFleetUI();
    return fleetData;
  }

  function checkProximity() {
    const MIN_DIST_DEG = 0.001; // ~111m
    for (let i = 0; i < fleetData.length; i++) {
      for (let j = i + 1; j < fleetData.length; j++) {
        const dLat = fleetData[i].lat - fleetData[j].lat;
        const dLng = fleetData[i].lng - fleetData[j].lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < MIN_DIST_DEG) {
          const distM = Math.round(dist * 111000);
          if (alertCallback) alertCallback(fleetData[i].id, fleetData[j].id, distM);
        }
      }
    }
  }

  function updateFleetUI() {
    const container = document.getElementById('fleetStatusGrid');
    if (!container) return;

    container.innerHTML = fleetData.map(v => `
      <div class="fleet-card fleet-${v.status.toLowerCase()}" onclick="selectVehicle('${v.id}')">
        <span class="fleet-dumper-icon">🚛</span>
        <div class="fleet-id">${v.id}</div>
        <div class="fleet-speed">${v.speed} km/h</div>
        <span class="fleet-status-badge">${v.status}</span>
      </div>
    `).join('');

    // Update KPIs
    const active = fleetData.filter(v => v.status === 'ACTIVE').length;
    const halted = fleetData.filter(v => v.status === 'HALTED').length;
    const caution = fleetData.filter(v => v.status === 'CAUTION').length;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('kpiActiveVehicles', active);
    setEl('kpiHaltedVehicles', halted);
    setEl('kpiCautionVehicles', caution);
  }

  function startTracking(fogLevel, intervalMs = 2000) {
    initFleet();
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => updateFleet(fogLevel), intervalMs);
    updateFleet(fogLevel);
  }

  function stopTracking() {
    if (updateInterval) clearInterval(updateInterval);
  }

  function setAlertCallback(cb) { alertCallback = cb; }
  function getFleetData() { return fleetData; }
  function getCurrentMap() { return map; }

  return {
    initMap, initFleet, updateFleet, renderFleetMarkers,
    startTracking, stopTracking, setAlertCallback,
    getFleetData, getCurrentMap, locateOperator, stopOperatorLocation
  };
})();

window.FleetTracker = FleetTracker;
