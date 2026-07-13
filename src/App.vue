<template>
  <WarRoomLayout :phase="director.phase.value">
    <!-- Cinematic Map Centerpiece -->
    <SwarmMap 
      :phase="director.phase.value"
      :scenario="director.scenario"
      :nodeStatuses="director.nodeStatuses"
      :arcs="director.arcs.value"
    />

    <!-- Main Debug Overlay for Task Controls & Verification -->
    <div class="debug-container">
      <div class="debug-header glass-panel">
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

      <!-- Main State & Controls Section -->
      <div class="debug-main glass-panel">
        <div class="phase-indicator">
          <div class="phase-badge">
            PHASE {{ director.phase.value }}: 
            <span class="phase-name">{{ phaseNames[director.phase.value] }}</span>
          </div>
          <div class="clock-badge">
            🕒 CLOCK: <span>{{ director.clockString.value }}</span>
          </div>
          <div v-if="director.scenario.countdown" class="countdown-badge">
            ⏳ {{ director.scenario.countdown.label }}: 
            <span class="countdown-time">{{ director.countdownRemaining.value }}</span>
          </div>
        </div>

        <div class="dialogue-box">
          <div class="dialogue-title">PRESENTER SPOKEN SCRIPT (P{{ director.phase.value }}):</div>
          <div class="dialogue-text">"{{ director.currentDialogue.value }}"</div>
        </div>

        <div class="keyboard-guide">
          <strong>KEYBOARD CONTROLS:</strong>
          <kbd>SPACE</kbd> Advance Phase
          <kbd>Y</kbd> Approve (Phase 4)
          <kbd>K</kbd> Reject (Phase 4)
          <kbd>R</kbd> Reset
        </div>

        <div v-if="director.awaitingApproval.value" class="approval-card-preview glass-panel">
          ⚠️ APPROVAL REQUIRED FOR: <strong>{{ director.scenario.approvalRole }}</strong>
          <p>Plan ready. Press <kbd>Y</kbd> to authorize resolution or <kbd>K</kbd> to kill.</p>
        </div>

        <div v-if="director.isRejected.value" class="rejection-card-preview">
          🚫 ACTION KILLED / REJECTED BY USER
        </div>

        <!-- Money HUD state -->
        <div v-if="director.moneyState.value.visible" class="money-hud" :class="director.moneyState.value.status">
          <div class="money-label">{{ director.moneyState.value.label }}</div>
          <div class="money-value">{{ director.moneyState.value.value }}</div>
        </div>
      </div>

      <!-- Grid Columns: Nodes & Agent Thought Stream -->
      <div class="debug-grid">
        <!-- Node Health Statuses -->
        <div class="nodes-column glass-panel">
          <h3>GEOGRAPHIC NODES STATUS</h3>
          <div 
            v-for="node in Object.values(director.nodeStatuses)" 
            :key="node.id" 
            class="node-row"
            :class="node.status"
          >
            <div class="node-info">
              <span class="node-status-dot"></span>
              <strong class="node-label">{{ node.label }}</strong>
              <span class="node-role">({{ node.role }})</span>
            </div>
            <div class="node-status-tag">{{ node.status.toUpperCase() }}</div>
          </div>
        </div>

        <!-- Agent Script & Data Results Stream -->
        <AgentThoughtStream
          :agents="director.scenario.agents"
          :agentStates="director.agentStates"
          :phase="director.phase.value"
        />
      </div>
    </div>
  </WarRoomLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { USE_3D_TILES, toggle3DTiles } from './config/index.js';
import { useDemoDirector } from './composables/useDemoDirector.js';
import WarRoomLayout from './layouts/WarRoomLayout.vue';
import SwarmMap from './components/SwarmMap.vue';
import AgentThoughtStream from './components/AgentThoughtStream.vue';

const director = useDemoDirector();
const is3DTilesOn = computed(() => USE_3D_TILES.value);

const phaseNames = [
  '0. QUIET HOURS',
  '1. THE SIGNAL',
  '2. THE INCIDENT',
  '3. THE SWARM',
  '4. THE WAKE-UP',
  '5. RESOLUTION'
];

function handleKeyDown(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    director.advancePhase();
  } else if (event.key === 'y' || event.key === 'Y') {
    director.approve();
  } else if (event.key === 'k' || event.key === 'K') {
    director.reject();
  } else if (event.key === 'r' || event.key === 'R') {
    director.reset();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.debug-container {
  position: relative;
  z-index: 1;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: none;
}

.debug-header, .debug-main, .nodes-column, .agents-column {
  pointer-events: auto;
}

.debug-header {
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

.debug-main {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.phase-indicator {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 16px;
}

.phase-badge {
  font-weight: 700;
  font-size: 18px;
  color: var(--accent-healthy);
}

.phase-name {
  color: #FFF;
}

.clock-badge {
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px;
  border-radius: 6px;
}

.countdown-badge {
  font-family: var(--font-mono);
  background: rgba(255, 40, 40, 0.15);
  border: 1px solid rgba(255, 40, 40, 0.4);
  color: #FF6B6B;
  padding: 4px 12px;
  border-radius: 6px;
}

.dialogue-box {
  background: rgba(0, 0, 0, 0.3);
  border-left: 4px solid var(--accent-agent);
  padding: 12px 16px;
  border-radius: 4px;
}

.dialogue-title {
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.dialogue-text {
  font-size: 15px;
  font-style: italic;
  color: #E2E8F0;
}

.keyboard-guide {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 16px;
  border-radius: 8px;
}

kbd {
  background: #1E293B;
  border: 1px solid #475569;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent-warning);
  font-weight: 600;
}

.approval-card-preview {
  background: rgba(255, 184, 0, 0.15);
  border: 1px solid var(--accent-warning);
  padding: 14px 20px;
  border-radius: 8px;
  color: #FFF;
}

.rejection-card-preview {
  background: rgba(255, 40, 40, 0.2);
  border: 1px solid var(--accent-critical);
  padding: 12px 20px;
  border-radius: 8px;
  color: var(--accent-critical);
  font-weight: 700;
}

.money-hud {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px;
  border-radius: 8px;
  width: fit-content;
}

.money-hud.at-risk {
  background: rgba(255, 40, 40, 0.15);
  border: 1px solid var(--accent-critical);
}

.money-hud.at-risk .money-value {
  color: var(--accent-critical);
  font-size: 24px;
  font-weight: 800;
}

.money-hud.recovered {
  background: rgba(0, 255, 128, 0.15);
  border: 1px solid var(--accent-healthy);
}

.money-hud.recovered .money-value {
  color: var(--accent-healthy);
  font-size: 24px;
  font-weight: 800;
}

.money-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.debug-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 16px;
}

.nodes-column {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h3 {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.node-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
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
  gap: 8px;
}

.node-role {
  font-size: 11px;
  color: var(--text-muted);
}

.node-status-tag {
  font-size: 10px;
  font-family: var(--font-mono);
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

@keyframes pulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}
</style>
