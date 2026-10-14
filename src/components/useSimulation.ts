"use client";

import { useEffect, useMemo, useState } from "react";
import { END_YEAR, SCENARIOS, START_YEAR, simulate, type Scenario } from "@/lib/waste-model";
import { requiredSchedule, runSwarm } from "@/lib/swarm-model";
import { PACE_EU_EARLIER } from "@/lib/thresholds";

// All simulation state and derived values live here; sections only render.
export function useSimulation() {
  const [scenarioId, setScenarioId] = useState<string>("bau");
  const [growthCut, setGrowthCut] = useState(SCENARIOS[0].growthCut);
  const [recoveryTarget, setRecoveryTarget] = useState(SCENARIOS[0].recoveryTarget);
  const [year, setYear] = useState<number>(2035);
  const [isPlaying, setIsPlaying] = useState(false);
  const [echo, setEcho] = useState(0.3);
  const [herd, setHerd] = useState(0); // off by default: no data fixes how strong amplification is
  const [target, setTarget] = useState(54);
  const [targetYear, setTargetYear] = useState(2050);
  const [maxGain, setMaxGain] = useState(PACE_EU_EARLIER);

  const pickScenario = (s: Scenario) => {
    setScenarioId(s.id);
    setGrowthCut(s.growthCut);
    setRecoveryTarget(s.recoveryTarget);
  };
  const setGrowth = (v: number) => { setGrowthCut(v); setScenarioId("custom"); };
  const setRecovery = (v: number) => { setRecoveryTarget(v); setScenarioId("custom"); };

  const data = useMemo(() => simulate({ growthCut, recoveryTarget }), [growthCut, recoveryTarget]);
  const bau = useMemo(() => simulate({ growthCut: 0, recoveryTarget: 27 }), []);
  const bands = useMemo(
    () => runSwarm({ recoveryTarget, echo, herd, agents: 150, runs: 25, seed: 42 }, data),
    [recoveryTarget, echo, herd, data],
  );
  const sched = useMemo(() => requiredSchedule(data, target / 100, targetYear, maxGain), [data, target, targetYear, maxGain]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setYear((prev) => {
        if (prev >= END_YEAR) {
          setIsPlaying(false);
          return START_YEAR;
        }
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(id);
  }, [isPlaying]);

  const yearIndex = year - START_YEAR;
  const cur = data[yearIndex] ?? data[0];
  const bauCur = bau[yearIndex] ?? bau[0];
  const cumulativeAvoided = useMemo(
    () => data.slice(0, yearIndex + 1).reduce((acc, d, i) => acc + (bau[i].residual - d.residual), 0),
    [data, bau, yearIndex],
  );

  return {
    scenarioId, pickScenario, growthCut, setGrowth, recoveryTarget, setRecovery,
    year, setYear, isPlaying, setIsPlaying,
    echo, setEcho, herd, setHerd, target, setTarget, targetYear, setTargetYear, maxGain, setMaxGain,
    data, bau, bands, sched, cur, bauCur, yearIndex,
    avoidedGen: bauCur.generated - cur.generated,
    avoidedDisposal: bauCur.residual - cur.residual,
    cumulativeAvoided,
  };
}
export type Sim = ReturnType<typeof useSimulation>;
