<template>
  <WarRoomLayout :phase="director.phase.value">
    <!-- Cinematic Map Centerpiece (Fills full viewport behind UI) -->
    <SwarmMap 
      :phase="director.phase.value"
      :scenario="director.scenario"
      :nodeStatuses="director.nodeStatuses"
      :arcs="director.arcs.value"
    />

    <!-- Main UI Overlay Container -->
    <div class="war-room-overlay">
      <!-- 1. Top White Executive Header -->
      <div class="top-header glass-panel">
        <div class="header-left">
          <img 
            src="https://www.gstatic.com/bricks/image/720624ce-2196-48d4-9963-a31aa86bdfbc.webp" 
            alt="Agentic War Room Logo" 
            class="war-room-logo" 
          />
          <span class="app-title font-ui">Agentic Enterprise Cross-Cloud War Room</span>
          <span class="divider">|</span>
          <div class="scenario-badge">
            <span class="dot"></span>
            SCENARIO: <strong>{{ director.scenario.id.toUpperCase() }}</strong>
            <span class="divider">|</span>
            INDUSTRY: <strong>{{ director.scenario.industry }}</strong>
          </div>
        </div>
        <div class="config-badge">
          <div 
            class="toggle-switch-wrapper" 
            :class="{ active: is3DTilesOn }"
            @click="toggle3DTiles"
            title="Click to toggle between 3D Photorealistic Tiles and Offline Vector Basemap"
          >
            <span class="toggle-title font-mono">3D TILES</span>
            <div class="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-status-badge font-mono">
              {{ is3DTilesOn ? 'ON (3D)' : 'OFF (2D)' }}
            </span>
          </div>
          <span class="divider">|</span>
          ROLE: <strong>{{ director.scenario.approvalRole }}</strong>
        </div>
      </div>

      <!-- 2. Presenter & Status Control Bar (Top Center) -->
      <div class="executive-control-bar glass-panel">
        <div class="control-left">
          <div class="phase-badge">
            PHASE {{ director.phase.value }}: 
            <span class="phase-name">{{ phaseNames[director.phase.value] }}</span>
          </div>
          <div class="clock-badge">
            🕒 <span>{{ director.clockString.value }}</span>
          </div>
          <div v-if="director.scenario.countdown" class="countdown-badge">
            ⏳ {{ director.scenario.countdown.label }}: 
            <span class="countdown-time">{{ director.countdownRemaining.value }}</span>
          </div>
        </div>

        <div class="dialogue-box">
          <span class="dialogue-label font-mono">SPEAKER SCRIPT:</span>
          <span class="dialogue-text">"{{ director.currentDialogue.value }}"</span>
        </div>

        <div class="keyboard-guide font-mono">
          <span class="key-debug-badge font-mono" title="Live physical keypress detection status">
            KEY: <strong>{{ lastKeyPressed }}</strong>
          </span>
          <button tabindex="-1" class="ctrl-btn" @click="director.advancePhase()" title="Advance to next phase (Spacebar)">
            <kbd>SPACE</kbd> Next
          </button>
          <button tabindex="-1" class="ctrl-btn" @click="director.approve()" title="Approve resolution (Y)">
            <kbd>Y</kbd> Approve
          </button>
          <button tabindex="-1" class="ctrl-btn" @click="director.reject()" title="Reject resolution (K)">
            <kbd>K</kbd> Reject
          </button>
          <button tabindex="-1" class="ctrl-btn" @click="director.reset()" title="Reset to Phase 0 (R)">
            <kbd>R</kbd> Reset
          </button>
        </div>
      </div>

      <!-- 3. Main 3-Column Layout: Left Sidebar | Clear Center Globe | Right Sidebar -->
      <div class="war-room-columns">
        <!-- LEFT SIDEBAR: Geographic Node Health & Money HUD -->
        <div class="sidebar-left">
          <!-- Money HUD Card -->
          <div v-if="director.moneyState.value.visible" class="money-hud-card glass-panel" :class="director.moneyState.value.status">
            <div class="money-label">{{ director.moneyState.value.label }}</div>
            <div class="money-value font-mono">{{ director.moneyState.value.value }}</div>
          </div>

          <!-- Geographic Node Health Panel -->
          <div class="nodes-panel glass-panel">
            <div class="panel-header">
              <span class="header-icon">🌍</span>
              GEOGRAPHIC NODES STATUS
            </div>
            <div class="nodes-list">
              <div 
                v-for="node in Object.values(director.nodeStatuses)" 
                :key="node.id" 
                class="node-row"
                :class="node.status"
              >
                <div class="node-info">
                  <span class="node-status-dot"></span>
                  <div class="node-text">
                    <strong class="node-label">{{ node.label }}</strong>
                    <span class="node-role">{{ node.role }}</span>
                  </div>
                </div>
                <div class="node-status-tag font-mono">{{ node.status.toUpperCase() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER AREA: Wide Open Globe View + Dynamic Action Banners -->
        <div class="center-viewport">
          <!-- Phase 4 Approval Banner (Overlay in Center Top) -->
          <transition name="banner-pop">
            <div v-if="director.awaitingApproval.value" class="approval-alert-card glass-panel">
              <div class="alert-icon">⚠️</div>
              <div class="alert-content">
                <div class="alert-title">HUMAN APPROVAL REQUIRED: {{ director.scenario.approvalRole }}</div>
                <div class="alert-body">Reroute plan staged across autonomous agents. Press <kbd>Y</kbd> to authorize resolution.</div>
              </div>
            </div>
          </transition>

          <transition name="banner-pop">
            <div v-if="director.isRejected.value" class="rejection-alert-card glass-panel">
              🚫 INCIDENT REROUTE KILLED BY {{ director.scenario.approvalRole }}
            </div>
          </transition>
        </div>

        <!-- RIGHT SIDEBAR: Autonomous Agent Reasoning Stream -->
        <div class="sidebar-right">
          <AgentThoughtStream
            :agents="director.scenario.agents"
            :agentStates="director.agentStates"
            :phase="director.phase.value"
          />
        </div>
      </div>
    </div>
  </WarRoomLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { USE_3D_TILES, toggle3DTiles } from './config/index.js';
import { useDemoDirector } from './composables/useDemoDirector.js';
import WarRoomLayout from './layouts/WarRoomLayout.vue';
import SwarmMap from './components/SwarmMap.vue';
import AgentThoughtStream from './components/AgentThoughtStream.vue';

const director = useDemoDirector();
const is3DTilesOn = computed(() => USE_3D_TILES.value);
const lastKeyPressed = ref('None (Click page to focus)');

const phaseNames = [
  '0. QUIET HOURS',
  '1. THE SIGNAL',
  '2. THE INCIDENT',
  '3. THE SWARM',
  '4. THE WAKE-UP',
  '5. RESOLUTION'
];

function handleKeyDown(event) {
  const key = (event.key || '').toLowerCase();
  const code = (event.code || '').toLowerCase();
  const keyCode = event.keyCode || event.which || 0;

  lastKeyPressed.value = `'${event.key || 'key'}' (code: ${event.code || 'none'}, keyCode: ${keyCode})`;
  console.log('[War Room Key Event]', { key, code, keyCode, type: event.type });

  // Match Spacebar
  if (code === 'space' || key === ' ' || key === 'spacebar' || keyCode === 32) {
    if (event.preventDefault && event.type === 'keydown') event.preventDefault();
    if (event.type === 'keydown') {
      director.advancePhase();
    }
  }
  // Match 'Y' (Approve)
  else if (key === 'y' || code === 'keyy' || keyCode === 89) {
    if (event.preventDefault && event.type === 'keydown') event.preventDefault();
    if (event.type === 'keydown') {
      director.approve();
    }
  }
  // Match 'K' (Reject)
  else if (key === 'k' || code === 'keyk' || keyCode === 75) {
    if (event.preventDefault && event.type === 'keydown') event.preventDefault();
    if (event.type === 'keydown') {
      director.reject();
    }
  }
  // Match 'R' (Reset)
  else if (key === 'r' || code === 'keyr' || keyCode === 82) {
    if (event.preventDefault && event.type === 'keydown') event.preventDefault();
    if (event.type === 'keydown') {
      director.reset();
    }
  }
}

onMounted(() => {
  const options = { capture: true, passive: false };
  window.addEventListener('keydown', handleKeyDown, options);
  window.addEventListener('keyup', handleKeyDown, options);
  document.addEventListener('keydown', handleKeyDown, options);
  document.addEventListener('keyup', handleKeyDown, options);
  document.documentElement.addEventListener('keydown', handleKeyDown, options);
  document.documentElement.addEventListener('keyup', handleKeyDown, options);

  if (document.body) {
    document.body.addEventListener('keydown', handleKeyDown, options);
    document.body.tabIndex = -1;
    document.body.focus();
  }
});

onUnmounted(() => {
  const options = { capture: true, passive: false };
  window.removeEventListener('keydown', handleKeyDown, options);
  window.removeEventListener('keyup', handleKeyDown, options);
  document.removeEventListener('keydown', handleKeyDown, options);
  document.removeEventListener('keyup', handleKeyDown, options);
  document.documentElement.removeEventListener('keydown', handleKeyDown, options);
  document.documentElement.removeEventListener('keyup', handleKeyDown, options);
});
</script>

<style scoped>
.war-room-overlay {
  position: relative;
  z-index: 1;
  padding: 16px 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.top-header, .executive-control-bar, .sidebar-left, .sidebar-right, .approval-alert-card, .rejection-alert-card {
  pointer-events: auto;
}

/* 1. White Top Header Bar */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  background: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #0F172A;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.war-room-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.app-title {
  font-weight: 800;
  font-size: 15px;
  color: #0F172A;
  letter-spacing: -0.3px;
}

.scenario-badge, .config-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1E293B;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.divider {
  color: #94A3B8;
}

.toggle-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch-wrapper:hover {
  border-color: #94A3B8;
  background: #E2E8F0;
}

.toggle-switch-wrapper.active {
  border-color: #2563EB;
  background: #EFF6FF;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.15);
}

.toggle-title {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
}

.toggle-track {
  width: 32px;
  height: 18px;
  background: #94A3B8;
  border-radius: 10px;
  position: relative;
  transition: background 0.25s ease;
}

.toggle-switch-wrapper.active .toggle-track {
  background: #2563EB;
}

.toggle-thumb {
  width: 14px;
  height: 14px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch-wrapper.active .toggle-thumb {
  transform: translateX(14px);
}

.toggle-status-badge {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  min-width: 52px;
}

.toggle-switch-wrapper.active .toggle-status-badge {
  color: #2563EB;
}

/* 2. Executive Control Bar (Top Center) */
.executive-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  gap: 16px;
  background: rgba(13, 21, 39, 0.85);
}

.control-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.phase-badge {
  font-weight: 800;
  font-size: 15px;
  color: var(--accent-healthy);
}

.phase-name {
  color: #FFF;
}

.clock-badge {
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.countdown-badge {
  font-family: var(--font-mono);
  background: rgba(255, 40, 40, 0.15);
  border: 1px solid rgba(255, 40, 40, 0.4);
  color: #FF6B6B;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.dialogue-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 14px;
  border-radius: 6px;
  border-left: 3px solid var(--accent-agent);
  max-width: 600px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialogue-label {
  font-size: 10px;
  color: var(--accent-agent);
  letter-spacing: 1px;
}

.dialogue-text {
  font-size: 13px;
  font-style: italic;
  color: #E2E8F0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.keyboard-guide {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.key-debug-badge {
  background: rgba(255, 184, 0, 0.15);
  border: 1px solid rgba(255, 184, 0, 0.4);
  color: var(--accent-warning);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.ctrl-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #E2E8F0;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  transition: all 0.2s ease;
}

.ctrl-btn:hover {
  background: rgba(66, 133, 244, 0.2);
  border-color: var(--accent-agent);
  color: #FFF;
}

kbd {
  background: #1E293B;
  border: 1px solid #475569;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent-warning);
  font-weight: 700;
}

/* 3. Three-Column Main Section */
.war-room-columns {
  display: grid;
  grid-template-columns: 350px 1fr 420px;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* Left Sidebar */
.sidebar-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.money-hud-card {
  padding: 14px 18px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.3s ease;
}

.money-hud-card.at-risk {
  background: rgba(255, 40, 40, 0.15);
  border: 1px solid var(--accent-critical);
}

.money-hud-card.at-risk .money-value {
  color: var(--accent-critical);
  font-size: 26px;
  font-weight: 800;
}

.money-hud-card.recovered {
  background: rgba(0, 255, 128, 0.15);
  border: 1px solid var(--accent-healthy);
}

.money-hud-card.recovered .money-value {
  color: var(--accent-healthy);
  font-size: 26px;
  font-weight: 800;
}

.money-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.nodes-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 4px solid var(--text-muted);
}

.node-row.quiet { border-left-color: var(--text-muted); }
.node-row.warning { border-left-color: var(--accent-warning); }
.node-row.critical { border-left-color: var(--accent-critical); animation: pulse 1s infinite alternate; }
.node-row.reroute { border-left-color: var(--accent-agent); }
.node-row.recovered { border-left-color: var(--accent-healthy); }
.node-row.grey { border-left-color: #475569; opacity: 0.6; }

.node-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.node-text {
  display: flex;
  flex-direction: column;
}

.node-label {
  font-size: 13px;
  color: #FFF;
}

.node-role {
  font-size: 10px;
  color: var(--text-muted);
}

.node-status-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

/* Center Area (Open Globe Viewport) */
.center-viewport {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.approval-alert-card {
  background: rgba(255, 184, 0, 0.2);
  border: 1px solid var(--accent-warning);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(255, 184, 0, 0.3);
  margin-top: 20px;
  max-width: 560px;
}

.alert-icon {
  font-size: 28px;
}

.alert-title {
  font-weight: 800;
  font-size: 14px;
  color: var(--accent-warning);
}

.alert-body {
  font-size: 12px;
  color: #FFF;
  margin-top: 4px;
}

.rejection-alert-card {
  background: rgba(255, 40, 40, 0.25);
  border: 1px solid var(--accent-critical);
  padding: 14px 24px;
  border-radius: 10px;
  color: var(--accent-critical);
  font-weight: 800;
  font-size: 14px;
  margin-top: 20px;
}

/* Right Sidebar */
.sidebar-right {
  overflow-y: auto;
}

.banner-pop-enter-active,
.banner-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.banner-pop-enter-from,
.banner-pop-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

@keyframes pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
</style>
