/**
 * Minimal zustand-kompatibler Store (für Projekte ohne 'zustand' Dependency).
 */
import * as React from "react";

export type Setter<S> = (partial: Partial<S> | ((s: S) => Partial<S>), replace?: boolean) => void;
export type Getter<S> = () => S;
export type StateCreator<S extends object> = (set: Setter<S>, get: Getter<S>) => S;

export function create<S extends object>(initializer: StateCreator<S>) {
  let state: S;
  const listeners = new Set<() => void>();

  const set: Setter<S> = (partial, replace) => {
    const next = typeof partial === "function" ? (partial as any)(state) : partial;
    state = (replace ? (next as S) : { ...state, ...(next as any) }) as S;
    listeners.forEach((l) => l());
  };
  const get: Getter<S> = () => state;

  state = initializer(set, get);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function useStore<U = S>(selector?: (s: S) => U, equality?: (a: U, b: U) => boolean): U {
    const sel = (selector || ((s: any) => s)) as (s: S) => U;
    const getSnapshot = () => sel(state);
    const subscribeFn = (cb: () => void) => subscribe(cb);
    const value = (React as any).useSyncExternalStore(subscribeFn, getSnapshot, getSnapshot);
    const ref = React.useRef<U>(value);
    if (!equality || !equality(ref.current, value)) ref.current = value;
    return ref.current;
  }

  (useStore as any).getState = get;
  (useStore as any).setState = set;
  (useStore as any).subscribe = subscribe;

  return useStore as unknown as {
    (): S;
    <U>(selector: (s: S) => U, equality?: (a: U, b: U) => boolean): U;
    getState: Getter<S>;
    setState: Setter<S>;
    subscribe: (l: () => void) => () => void;
  };
}
