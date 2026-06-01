import { randomUUID } from "crypto";

interface V5UserData {
  life_os: Record<string, number> | null;
  mission: object | null;
  vault_entries: { id: string; type: string; title: string; content: string; tags?: string[]; created_at: string }[];
  relationship_nodes: { id: string; name: string; strength: number; category: string }[];
  ai_memory: { type: string; content: object; created_at: string }[];
}

declare global {
  var __humanosV5Store: Record<string, V5UserData> | undefined;
}

function getV5Store(): Record<string, V5UserData> {
  if (!global.__humanosV5Store) global.__humanosV5Store = {};
  return global.__humanosV5Store;
}

function ensureV5(userId: string): V5UserData {
  const store = getV5Store();
  if (!store[userId]) {
    store[userId] = { life_os: null, mission: null, vault_entries: [], relationship_nodes: [], ai_memory: [] };
  }
  return store[userId];
}

export function demoGetV5(userId: string, key: keyof V5UserData) {
  return ensureV5(userId)[key];
}

export function demoSetV5(userId: string, key: keyof V5UserData, value: V5UserData[keyof V5UserData]) {
  const d = ensureV5(userId);
  (d as unknown as Record<string, unknown>)[key] = value;
}

export function demoAddVaultEntry(userId: string, entry: { type: string; title: string; content: string; tags?: string[] }) {
  const d = ensureV5(userId);
  const item = { id: randomUUID(), ...entry, created_at: new Date().toISOString() };
  d.vault_entries.unshift(item);
  return item;
}

export function demoGetVaultEntries(userId: string) {
  return ensureV5(userId).vault_entries;
}

export function demoAddRelationship(userId: string, node: { name: string; strength: number; category: string }) {
  const d = ensureV5(userId);
  const item = { id: randomUUID(), ...node };
  d.relationship_nodes.push(item);
  return item;
}

export function demoGetRelationships(userId: string) {
  return ensureV5(userId).relationship_nodes;
}

export function demoAddMemory(userId: string, type: string, content: object) {
  ensureV5(userId).ai_memory.push({ type, content, created_at: new Date().toISOString() });
}

export function demoGetMemories(userId: string) {
  return ensureV5(userId).ai_memory;
}
