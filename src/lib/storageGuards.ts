export async function checkIndexedDB(): Promise<boolean> {
  try {
    if (!('indexedDB' in window)) return false;
    const req = indexedDB.open('gcg-idb-test', 1);
    return await new Promise((res) => {
      req.onerror = () => res(false);
      req.onsuccess = () => { req.result.close(); res(true); };
      req.onupgradeneeded = () => {};
    });
  } catch { return false; }
}

export async function checkQuota(): Promise<{usage?: number, quota?: number}> {
  try {
    // @ts-ignore
    if (!navigator.storage?.estimate) return {};
    // @ts-ignore
    return await navigator.storage.estimate();
  } catch { return {}; }
}
