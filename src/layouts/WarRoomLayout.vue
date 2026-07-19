<template>
  <div 
    ref="containerRef"
    tabindex="0"
    class="war-room-container" 
    :class="{ 'dawn-mode': isDawn }"
    @click="ensureFocus"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  phase: {
    type: Number,
    default: 0
  }
});

const containerRef = ref(null);
const isDawn = computed(() => props.phase === 5);

function ensureFocus() {
  if (containerRef.value) {
    containerRef.value.focus();
  }
}

onMounted(() => {
  ensureFocus();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
  --bg-dark: #0A0E1A;
  --bg-dark-dawn: #0F172A;
  --panel-bg: rgba(13, 21, 39, 0.75);
  --panel-border: rgba(255, 255, 255, 0.08);
  --panel-blur: 16px;
  
  --accent-healthy: #00FF80;
  --accent-warning: #FFB800;
  --accent-critical: #FF2828;
  --accent-agent: #4285F4;
  --accent-purple: #A855F7;

  --text-primary: #F3F4F6;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
}

.war-room-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: var(--bg-dark);
  transition: background 1.5s ease-in-out;
  overflow: hidden;
  outline: none;
}

.war-room-container.dawn-mode {
  background: radial-gradient(circle at 50% 30%, #1E293B 0%, #0A0E1A 100%);
}

/* Glassmorphism utility class */
.glass-panel {
  background: var(--panel-bg);
  backdrop-filter: blur(var(--panel-blur));
  -webkit-backdrop-filter: blur(var(--panel-blur));
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
</style>
