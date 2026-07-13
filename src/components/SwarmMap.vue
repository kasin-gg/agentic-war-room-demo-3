<template>
  <div class="swarm-map-wrapper">
    <!-- Standalone deck.gl canvas container -->
    <div ref="mapContainer" class="deck-canvas-container"></div>
    
    <!-- HTML Overlay Node Labels (100% immune to WebGL depth slicing or texture clipping) -->
    <div 
      v-for="label in projectedLabels" 
      :key="label.id"
      class="map-html-label font-mono"
      :class="label.status"
      :style="{ 
        left: (label.x + 18) + 'px', 
        top: (label.y - 12) + 'px' 
      }"
    >
      <span class="label-dot"></span>
      {{ label.label }}
    </div>

    <!-- Basemap Mode Indicator Badge -->
    <div class="basemap-mode-badge glass-panel font-mono" :class="{ 'mode-3d': is3DTilesOn }">
      <span class="mode-dot"></span>
      BASEMAP: {{ is3DTilesOn ? 'Live Dark Map Tiles Active (Carto Dark Matter)' : 'Offline Static Dark Vector (Airplane Mode)' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, ArcLayer, BitmapLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import gsap from 'gsap';
import { USE_3D_TILES } from '../config/index.js';
import { worldLandmassGeoJSON } from '../assets/world-land.js';

const props = defineProps({
  phase: {
    type: Number,
    required: true
  },
  scenario: {
    type: Object,
    required: true
  },
  nodeStatuses: {
    type: Object,
    required: true
  },
  arcs: {
    type: Array,
    required: true
  }
});

const mapContainer = ref(null);
const is3DTilesOn = computed(() => USE_3D_TILES.value);
const projectedLabels = ref([]);

let deckInstance = null;
let animFrameId = null;
let pulseTime = 0;

// Dynamic Camera View State
const viewState = ref({
  longitude: 105,
  latitude: 15,
  zoom: 3.5,
  pitch: 45,
  bearing: -10,
  transitionDuration: 0
});

// Color Tokens
const COLORS = {
  healthy: [0, 255, 128, 255],
  warning: [255, 184, 0, 255],
  critical: [255, 40, 40, 255],
  reroute: [66, 133, 244, 255],
  recovered: [0, 255, 128, 255],
  grey: [71, 85, 105, 180]
};

// Calculate initial bounding box and center for scenario nodes
function getScenarioBounds(nodes) {
  if (!nodes || !nodes.length) return { longitude: 105, latitude: 15, zoom: 3.5 };

  let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
  nodes.forEach(n => {
    const [lon, lat] = n.coords;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;
  
  const spanLon = Math.abs(maxLon - minLon);
  const spanLat = Math.abs(maxLat - minLat);
  const maxSpan = Math.max(spanLon, spanLat);

  let zoom = 3.5;
  if (maxSpan > 120) zoom = 2.0;
  else if (maxSpan > 60) zoom = 3.0;
  else if (maxSpan > 30) zoom = 4.0;
  else zoom = 4.8;

  return { longitude: centerLon, latitude: centerLat, zoom };
}

// Set up camera easing via GSAP based on active scenario and current phase
function updateCameraForPhase(phase) {
  const defaultBounds = getScenarioBounds(props.scenario.nodes);
  
  if (phase === 0) {
    gsap.to(viewState.value, {
      longitude: defaultBounds.longitude,
      latitude: defaultBounds.latitude,
      zoom: defaultBounds.zoom,
      pitch: 45,
      bearing: -10,
      duration: 2.0,
      ease: 'power2.out',
      onUpdate: renderDeck
    });
  } else if (phase === 2) {
    const disruptedNode = props.scenario.nodes.find(n => n.id === props.scenario.disruptedNodeId);
    if (disruptedNode) {
      gsap.to(viewState.value, {
        longitude: disruptedNode.coords[0],
        latitude: disruptedNode.coords[1],
        zoom: defaultBounds.zoom + 1.2,
        pitch: 50,
        bearing: 15,
        duration: 2.5,
        ease: 'power2.inOut',
        onUpdate: renderDeck
      });
    }
  } else if (phase === 5) {
    gsap.to(viewState.value, {
      longitude: defaultBounds.longitude,
      latitude: defaultBounds.latitude,
      zoom: defaultBounds.zoom,
      pitch: 40,
      bearing: 0,
      duration: 3.0,
      ease: 'power2.out',
      onUpdate: renderDeck
    });
  }
}

// Project node 3D coordinates into screen pixel space for HTML label placement
function updateProjectedLabels() {
  if (!deckInstance) return;
  const viewports = deckInstance.getViewports();
  if (!viewports || !viewports.length) return;
  const viewport = viewports[0];
  if (!viewport) return;

  const nodeData = Object.values(props.nodeStatuses);
  projectedLabels.value = nodeData.map(n => {
    const projected = viewport.project(n.coords);
    if (!projected) return null;
    return {
      id: n.id,
      label: n.label,
      status: n.status || 'quiet',
      x: projected[0],
      y: projected[1]
    };
  }).filter(Boolean);
}

// Generate active layers for deck.gl
function createDeckLayers() {
  const is3D = is3DTilesOn.value;
  const layers = [];

  if (is3D) {
    // 1. Live Dark Map Tile Layer (Carto Dark Matter Tiles)
    const mapTilesLayer = new TileLayer({
      id: 'dark-map-tiles',
      data: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      ],
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: subProps => {
        const { boundingBox } = subProps.tile;
        return new BitmapLayer(subProps, {
          data: null,
          image: subProps.data,
          bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
        });
      }
    });
    layers.push(mapTilesLayer);
  } else {
    // 1. Offline Dark Continent Vector Layer (Zero network requests)
    const landLayer = new GeoJsonLayer({
      id: 'world-landmass',
      data: worldLandmassGeoJSON,
      filled: true,
      stroked: true,
      getFillColor: [15, 23, 42, 220],
      getLineColor: [30, 41, 59, 255],
      getLineWidth: 1.5,
      lineWidthUnits: 'pixels'
    });
    layers.push(landLayer);
  }

  // 2. Node Status Data for Scatterplot
  const nodeData = Object.values(props.nodeStatuses).map(n => {
    const status = n.status || 'quiet';
    let color = COLORS.healthy;
    if (status === 'warning') color = COLORS.warning;
    if (status === 'critical') color = COLORS.critical;
    if (status === 'reroute') color = COLORS.reroute;
    if (status === 'recovered') color = COLORS.recovered;
    if (status === 'grey') color = COLORS.grey;

    return {
      id: n.id,
      label: n.label,
      coords: n.coords,
      role: n.role,
      status,
      color
    };
  });

  // 3. Pulsing Outer Halos around Nodes
  const pulseScale = Math.sin(pulseTime * 0.08) * 0.4 + 1.2;
  const haloLayer = new ScatterplotLayer({
    id: 'node-halos',
    data: nodeData,
    getPosition: d => d.coords,
    getFillColor: d => [...d.color.slice(0, 3), 40],
    getLineColor: d => d.color,
    getRadius: d => (d.status === 'critical' ? 120000 * pulseScale : 75000),
    stroked: true,
    lineWidthMinPixels: 1,
    radiusUnits: 'meters'
  });

  // 4. Solid Inner Node Markers
  const nodeMarkerLayer = new ScatterplotLayer({
    id: 'node-markers',
    data: nodeData,
    getPosition: d => d.coords,
    getFillColor: d => d.color,
    getRadius: 45000,
    radiusMinPixels: 6,
    radiusUnits: 'meters',
    pickable: true
  });

  // 5. Arc Flow Visualization
  const arcData = props.arcs.map((arc, i) => {
    let color = arc.color || COLORS.healthy;
    let strokeWidth = 3;

    if (arc.status === 'critical') {
      color = COLORS.critical;
      strokeWidth = 4;
    } else if (arc.status === 'candidate') {
      color = COLORS.warning;
      strokeWidth = 2.5;
    } else if (arc.status === 'recovered') {
      color = COLORS.healthy;
      strokeWidth = 4.5;
    } else if (arc.status === 'grey') {
      color = COLORS.grey;
      strokeWidth = 1.5;
    }

    return {
      id: `arc-${i}`,
      getSourcePosition: arc.from,
      getTargetPosition: arc.to,
      color,
      strokeWidth,
      status: arc.status
    };
  });

  const arcLayer = new ArcLayer({
    id: 'network-arcs',
    data: arcData,
    getSourcePosition: d => d.getSourcePosition,
    getTargetPosition: d => d.getTargetPosition,
    getSourceColor: d => d.color,
    getTargetColor: d => d.color,
    getWidth: d => d.strokeWidth,
    widthMinPixels: 2,
    getHeight: 0.18,
    greatCircle: false
  });

  layers.push(arcLayer, haloLayer, nodeMarkerLayer);
  return layers;
}

function renderDeck() {
  if (!deckInstance) return;
  deckInstance.setProps({
    viewState: { ...viewState.value },
    layers: createDeckLayers()
  });
  updateProjectedLabels();
}

function animateLoop() {
  pulseTime += 1;
  renderDeck();
  animFrameId = requestAnimationFrame(animateLoop);
}

function initDeck() {
  const defaultBounds = getScenarioBounds(props.scenario.nodes);
  viewState.value.longitude = defaultBounds.longitude;
  viewState.value.latitude = defaultBounds.latitude;
  viewState.value.zoom = defaultBounds.zoom;

  if (mapContainer.value) {
    deckInstance = new Deck({
      parent: mapContainer.value,
      initialViewState: viewState.value,
      controller: {
        doubleClickZoom: true,
        dragPan: true,
        scrollZoom: true,
        touchRotate: true,
        keyboard: false
      },
      onViewStateChange: ({ viewState: nextState }) => {
        viewState.value = nextState;
        renderDeck();
      },
      layers: createDeckLayers()
    });

    animateLoop();
  }
}

// Watchers for reactive updates
watch(is3DTilesOn, () => {
  renderDeck();
});

watch(() => props.phase, (newPhase) => {
  updateCameraForPhase(newPhase);
});

watch(() => props.scenario.id, () => {
  const defaultBounds = getScenarioBounds(props.scenario.nodes);
  viewState.value.longitude = defaultBounds.longitude;
  viewState.value.latitude = defaultBounds.latitude;
  viewState.value.zoom = defaultBounds.zoom;
  updateCameraForPhase(props.phase);
});

watch([() => props.nodeStatuses, () => props.arcs], () => {
  renderDeck();
}, { deep: true });

onMounted(() => {
  initDeck();
});

onUnmounted(() => {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
  }
  if (deckInstance) {
    deckInstance.finalize();
    deckInstance = null;
  }
});
</script>

<style scoped>
.swarm-map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
}

.deck-canvas-container {
  width: 100%;
  height: 100%;
}

/* Crisp HTML/DOM Glass Badges for Node Location Names */
.map-html-label {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  background: rgba(10, 14, 26, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #F3F4F6;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-healthy);
}

.map-html-label.warning {
  border-color: var(--accent-warning);
}
.map-html-label.warning .label-dot {
  background: var(--accent-warning);
}

.map-html-label.critical {
  border-color: var(--accent-critical);
  box-shadow: 0 0 16px rgba(255, 40, 40, 0.4);
}
.map-html-label.critical .label-dot {
  background: var(--accent-critical);
}

.map-html-label.reroute {
  border-color: var(--accent-agent);
}
.map-html-label.reroute .label-dot {
  background: var(--accent-agent);
}

.map-html-label.grey {
  color: #94A3B8;
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.7);
}
.map-html-label.grey .label-dot {
  background: #64748B;
}

.basemap-mode-badge {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 11px;
  color: var(--accent-healthy);
  padding: 8px 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.basemap-mode-badge.mode-3d {
  color: var(--accent-agent);
  border-color: rgba(66, 133, 244, 0.4);
}

.mode-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
</style>
