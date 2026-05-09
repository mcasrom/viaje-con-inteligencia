import { createLogger } from './logger';

const log = createLogger('CB');

interface CircuitState {
  failures: number;
  lastFailure: number;
  cooldownUntil: number;
  isOpen: boolean;
}

const circuits = new Map<string, CircuitState>();

const THRESHOLD = 3;
const COOLDOWN_MS = 5 * 60 * 1000;
const HALF_OPEN_TIMEOUT = 60 * 1000;

function getState(name: string): CircuitState {
  if (!circuits.has(name)) {
    circuits.set(name, { failures: 0, lastFailure: 0, cooldownUntil: 0, isOpen: false });
  }
  return circuits.get(name)!;
}

export function isCircuitOpen(name: string): boolean {
  const state = getState(name);
  if (!state.isOpen) return false;
  if (Date.now() > state.cooldownUntil) {
    state.isOpen = false;
    state.failures = 0;
    log.info(`Circuit [${name}] half-open, allowing request`);
    return false;
  }
  return true;
}

export function recordSuccess(name: string): void {
  const state = getState(name);
  if (state.failures > 0) {
    log.info(`Circuit [${name}] recovered, resetting failures`);
  }
  state.failures = 0;
  state.isOpen = false;
}

export function recordFailure(name: string): void {
  const state = getState(name);
  state.failures++;
  state.lastFailure = Date.now();

  if (state.failures >= THRESHOLD) {
    state.isOpen = true;
    state.cooldownUntil = Date.now() + COOLDOWN_MS;
    log.warn(`Circuit [${name}] OPEN after ${state.failures} failures, cooling down ${COOLDOWN_MS / 1000}s`);
  } else {
    log.warn(`Circuit [${name}] failure ${state.failures}/${THRESHOLD}`);
  }
}

export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (isCircuitOpen(name)) {
    log.warn(`Circuit [${name}] open, using fallback`);
    return fallback();
  }

  try {
    const result = await fn();
    recordSuccess(name);
    return result;
  } catch (err) {
    recordFailure(name);
    return fallback();
  }
}

export function getCircuitStatus(name: string): { isOpen: boolean; failures: number; lastFailure: number; cooldownRemaining: number } {
  const state = getState(name);
  return {
    isOpen: state.isOpen,
    failures: state.failures,
    lastFailure: state.lastFailure,
    cooldownRemaining: Math.max(0, state.cooldownUntil - Date.now()),
  };
}

export function getAllCircuitStatuses(): Record<string, { isOpen: boolean; failures: number; lastFailure: number; cooldownRemaining: number }> {
  const result: Record<string, any> = {};
  for (const [name] of circuits) {
    result[name] = getCircuitStatus(name);
  }
  return result;
}

export function resetCircuit(name: string): void {
  circuits.delete(name);
  log.info(`Circuit [${name}] manually reset`);
}
