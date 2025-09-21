import { db } from "../../data/db";
import type { PeriodKey, SetEntry } from "../../shared/types";
import { getPrefs } from "../../data/stores/prefs";

export type SideMode = "both" | "left" | "right";
export interface HeatmapAgg { [regionId: string]: { score: number; volume: number; trend: number }; }

function clamp01(x: number){ return Math.max(0, Math.min(1, x)); }

export async function computeMuscleAggV2(period: PeriodKey, side: SideMode): Promise<HeatmapAgg> {
  // basic approach: reuse sets targetMuscles weights; apply side factor
  const prefs = await getPrefs();
  const since = period === "all" ? 0 : (Date.now() - (period === "last" ? 365 : Number(period)) * 86400000);
  const sets = await db.sets.toArray();
  const inPeriod = sets.filter(s => new Date(s.createdAt).getTime() >= since);
  const sumVol: Record<string, number> = {};
  for (const s of inPeriod) {
    const sideFactor = s.side === "both" || !s.side ? 0.5 : 1.0;
    if (side === "left" && s.side === "right") continue;
    if (side === "right" && s.side === "left") continue;
    for (const [m, w] of Object.entries(s.targetMuscles || {})) {
      const keyL = `L:${m}`; const keyR = `R:${m}`; const v = (s.effectiveVolume || (s.weight * s.reps)) * (w as number);
      if (s.side === "left") sumVol[keyL] = (sumVol[keyL] || 0) + v * 1.0;
      else if (s.side === "right") sumVol[keyR] = (sumVol[keyR] || 0) + v * 1.0;
      else { // both
        sumVol[keyL] = (sumVol[keyL] || 0) + v * sideFactor;
        sumVol[keyR] = (sumVol[keyR] || 0) + v * sideFactor;
      }
    }
  }
  // 90d max normalization
  const last90Since = Date.now() - 90*86400000;
  const sets90 = sets.filter(s => new Date(s.createdAt).getTime() >= last90Since);
  const vol90: Record<string, number> = {};
  for (const s of sets90) {
    const sideFactor = s.side === "both" || !s.side ? 0.5 : 1.0;
    for (const [m, w] of Object.entries(s.targetMuscles || {})) {
      const keyL = `L:${m}`; const keyR = `R:${m}`; const v = (s.effectiveVolume || (s.weight * s.reps)) * (w as number);
      if (s.side === "left") vol90[keyL] = (vol90[keyL] || 0) + v * 1.0;
      else if (s.side === "right") vol90[keyR] = (vol90[keyR] || 0) + v * 1.0;
      else { vol90[keyL] = (vol90[keyL] || 0) + v * sideFactor; vol90[keyR] = (vol90[keyR] || 0) + v * sideFactor; }
    }
  }
  const epsilon = 1e-6;
  const out: HeatmapAgg = {};
  // map to REGION IDs roughly by muscle name; simple mapping: use m name to region id fragments
  function toRegions(key: string): string[] {
    // This is a simplified mapping; real app should map to exact REGION_IDS
    const [LR, muscle] = key.split(":");
    const sidePrefix = LR === "L" ? ["front:left","back:left"] : ["front:right","back:right"];
    const center = ["Chest","Upper Back","Lower Back","Traps","Abs/Obliques"];
    const ids: string[] = [];
    const name = muscle.toLowerCase();
    function push(prefix: string, base: string){ ids.push(`${prefix.includes("front")?"f":"b"}${base}`); }
    for (const pref of sidePrefix) {
      if (name.includes("lat")) push(pref, LR==="L"?"lats":"rlats");
      else if (name.includes("biceps")) push(pref, LR==="L"?"biceps":"biceps_r");
      else if (name.includes("triceps")) push(pref, LR==="L"?"triceps":"triceps_r");
      else if (name.includes("forearm")) push(pref, LR==="L"?"forearms":"forearms_r");
      else if (name.includes("quad")) push(pref, LR==="L"?"quads":"quads_r");
      else if (name.includes("ham")) push(pref, LR==="L"?"hamstrings":"hamstrings_r");
      else if (name.includes("glute")) push(pref, LR==="L"?"glutes":"glutes_r");
      else if (name.includes("calf")) push(pref, LR==="L"?"calves":"calves_r");
      else if (name.includes("delt")) push(pref, LR==="L"?"delts":"delts_r");
      else if (name.includes("abs") || name.includes("oblique")) { ids.push("fabs"); }
      else if (name.includes("chest")) { ids.push("fchest"); }
      else if (name.includes("upper back")) { ids.push("bupperback"); }
      else if (name.includes("lower back")) { ids.push("blowerback"); }
      else if (name.includes("trap")) { ids.push("btraps_c"); }
    }
    return ids;
  }
  for (const [k,v] of Object.entries(sumVol)) {
    const max90 = vol90[k] || epsilon;
    const volNorm = clamp01(v / Math.max(max90, epsilon));
    const prog = 0.5; // simple placeholder trend, computed elsewhere if available
    const score = 0.6*volNorm + 0.4*prog;
    for (const rid of toRegions(k)) {
      const prev = out[rid] || { score: 0, volume: 0, trend: 0 };
      out[rid] = { score: Math.max(prev.score, score), volume: prev.volume + v, trend: prog };
    }
  }
  return out;
}
