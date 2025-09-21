import { useEffect } from "react";
export function useKeyboardInsets() {
  useEffect(() => {
    const vv: any = (window as any).visualViewport;
    if (!vv || !('addEventListener' in vv)) return;
    const onResize = () => {
      const inset = Math.max(0, (vv.height - window.innerHeight) * -1);
      document.body.style.setProperty('--kb', `${inset}px`);
    };
    vv.addEventListener('resize', onResize);
    onResize();
    return () => vv.removeEventListener('resize', onResize);
  }, []);
}
