type Listener<T> = (payload: T) => void;
class Emitter<TMap extends Record<string, any>> {
  private listeners = new Map<keyof TMap, Set<Listener<any>>>();
  on<K extends keyof TMap>(event: K, cb: Listener<TMap[K]>): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(cb as any); this.listeners.set(event, set); return () => { set.delete(cb as any); };
  }
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    const set = this.listeners.get(event); if (!set) return; for (const l of set) { try { (l as Listener<TMap[K]>)(payload); } catch {} }
  }
}
export interface QuotaEventPayload { name: string; message: string; when: string; }
export const quotaEvents = new Emitter<{ quota_error: QuotaEventPayload }>();
