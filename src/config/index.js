import { ref } from 'vue';
import { supplychainScenario } from './scenario.supplychain.js';
import { bankingScenario } from './scenario.banking.js';

// Change ACTIVE_SCENARIO to 'banking' or 'supplychain' to switch full demo context
export const ACTIVE_SCENARIO = 'supplychain';

// Reactive toggle for 3D map tiles vs offline static basemap
export const USE_3D_TILES = ref(true);

export function toggle3DTiles() {
  USE_3D_TILES.value = !USE_3D_TILES.value;
}

const scenarios = {
  supplychain: supplychainScenario,
  banking: bankingScenario
};

export function getActiveScenario() {
  const scenario = scenarios[ACTIVE_SCENARIO];
  if (!scenario) {
    throw new Error(`Scenario "${ACTIVE_SCENARIO}" not found. Available scenarios: ${Object.keys(scenarios).join(', ')}`);
  }
  return scenario;
}
