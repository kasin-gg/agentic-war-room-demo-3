<template>
  <div class="agent-thought-stream-container">
    <div class="stream-header glass-panel">
      <div class="stream-title">
        <span class="live-dot"></span>
        AUTONOMOUS AGENT REASONING STREAM
      </div>
      <div class="active-count font-mono">
        ACTIVE AGENTS: {{ activeAgentCount }}/{{ agents.length }}
      </div>
    </div>

    <div class="agent-cards-grid">
      <div 
        v-for="agent in agents" 
        :key="agent.id"
        class="agent-card glass-panel"
        :class="{ 
          active: agentStates[agent.id]?.active,
          complete: agentStates[agent.id]?.isComplete
        }"
        :style="{ '--accent-color': agent.accent }"
      >
        <!-- Card Header -->
        <div class="agent-card-header">
          <div class="agent-identity">
            <span class="status-dot"></span>
            <span class="agent-name">{{ agent.name }}</span>
          </div>
          <span class="agent-role font-mono">[{{ agent.role }}]</span>
        </div>

        <!-- Thought Stream Lines -->
        <div class="agent-thoughts-box font-mono">
          <div 
            v-for="(thought, idx) in agentStates[agent.id]?.revealedThoughts || []" 
            :key="idx"
            class="thought-line"
          >
            <span class="prompt-symbol">></span>
            <span class="thought-text">{{ thought }}</span>
            <!-- Blinking cursor on current active line -->
            <span 
              v-if="idx === (agentStates[agent.id]?.revealedThoughts.length - 1) && !agentStates[agent.id]?.isComplete"
              class="typing-cursor"
            >▌</span>
          </div>

          <div v-if="!agentStates[agent.id]?.revealedThoughts?.length" class="thought-standby">
            <span class="standby-text">// SYSTEM STANDBY</span>
          </div>
        </div>

        <!-- Hardcoded Data Result Box -->
        <transition name="result-fade">
          <div 
            v-if="agentStates[agent.id]?.dataResultRevealed && agentStates[agent.id]?.dataResult"
            class="data-result-card"
          >
            <div class="result-header">
              <span class="result-icon">⚡</span>
              <span class="result-label">{{ agentStates[agent.id].dataResult.label }}</span>
            </div>
            <div class="result-value font-mono">{{ agentStates[agent.id].dataResult.value }}</div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  agents: {
    type: Array,
    required: true
  },
  agentStates: {
    type: Object,
    required: true
  },
  phase: {
    type: Number,
    required: true
  }
});

const activeAgentCount = computed(() => {
  return props.agents.filter(a => props.agentStates[a.id]?.active).length;
});
</script>

<style scoped>
.agent-thought-stream-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  font-size: 12px;
}

.stream-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-agent);
  box-shadow: 0 0 10px var(--accent-agent);
  animation: pulse-glow 1.5s infinite alternate;
}

.active-count {
  font-size: 11px;
  color: var(--text-secondary);
}

.agent-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agent-card {
  padding: 14px 16px;
  border-left: 4px solid var(--accent-color, var(--accent-agent));
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0.6;
  transition: all 0.3s ease;
  position: relative;
}

.agent-card.active {
  opacity: 1;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.02);
}

.agent-card.complete {
  opacity: 1;
  border-left-color: var(--accent-healthy);
}

.agent-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agent-identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-color, var(--text-muted));
}

.agent-card.active .status-dot {
  box-shadow: 0 0 8px var(--accent-color);
}

.agent-name {
  font-size: 14px;
  font-weight: 700;
  color: #FFF;
}

.agent-role {
  font-size: 11px;
  color: var(--text-secondary);
}

.agent-thoughts-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px 12px;
  min-height: 54px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.thought-line {
  color: #E2E8F0;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.prompt-symbol {
  color: var(--accent-color, var(--accent-agent));
  font-weight: bold;
}

.typing-cursor {
  color: var(--accent-healthy);
  animation: blink 0.8s infinite;
  margin-left: 2px;
}

.thought-standby {
  color: var(--text-muted);
  font-style: italic;
  font-size: 11px;
}

.data-result-card {
  background: rgba(0, 255, 128, 0.08);
  border: 1px solid rgba(0, 255, 128, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.result-icon {
  font-size: 12px;
  color: var(--accent-healthy);
}

.result-label {
  font-size: 10px;
  color: var(--accent-healthy);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.result-value {
  font-size: 12px;
  color: #FFF;
  font-weight: 600;
}

.result-fade-enter-active,
.result-fade-leave-active {
  transition: all 0.4s ease;
}

.result-fade-enter-from,
.result-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes pulse-glow {
  from { opacity: 0.5; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1.1); }
}
</style>
