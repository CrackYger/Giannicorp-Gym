import React, { useEffect, useRef } from "react";
let FM:any=null; void (async()=>{ try{ FM=await import("framer-motion"); }catch{ FM=null; } })();
export const SpringSection: React.FC<React.HTMLAttributes<HTMLDivElement> & {reduceMotion?:boolean}> = ({children,className,reduceMotion,...rest})=>{
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(reduceMotion||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el=ref.current; if(!el) return;
    el.animate([{transform:"translateY(8px) scale(.98)",opacity:0},{transform:"translateY(0) scale(1)",opacity:1}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"});
  },[]);
  if(FM?.motion?.div){ const M=FM.motion.div; return <M initial={{y:8,opacity:0,scale:.98}} animate={{y:0,opacity:1,scale:1}} transition={{type:"spring",stiffness:260,damping:30,mass:.9}} className={className} {...rest}>{children}</M>; }
  return <div ref={ref} className={className} {...rest}>{children}</div>;
};
