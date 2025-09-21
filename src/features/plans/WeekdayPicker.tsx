import * as React from "react";
const DAYS = ["So","Mo","Di","Mi","Do","Fr","Sa"];
export function WeekdayPicker({ value, onChange }:{ value:number[]; onChange:(v:number[])=>void }){
  const toggle = (d:number)=> onChange(value.includes(d) ? value.filter(x=>x!==d) : [...value, d].sort());
  return (
    <div className="flex gap-1 flex-wrap">
      {DAYS.map((lbl, i)=>(
        <button key={i} onClick={()=>toggle(i)} className={"px-2 py-1 rounded-full text-xs border " + (value.includes(i) ? "border-emerald-400 text-emerald-300" : "border-zinc-700 text-zinc-400")}>{lbl}</button>
      ))}
    </div>
  );
}
