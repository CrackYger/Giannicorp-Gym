import * as React from "react";
export function useDebouncedValue<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), Math.max(0, delay));
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}