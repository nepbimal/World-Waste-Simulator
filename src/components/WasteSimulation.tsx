"use client";

import { Aurora } from "./ui/Aurora";
import { useSimulation } from "./useSimulation";
import { Dock, Footer, TopNav } from "./sections/Chrome";
import { Hero } from "./sections/Hero";
import { Overview } from "./sections/Overview";
import { Regions } from "./sections/Regions";
import { Materials } from "./sections/Materials";
import { Swarm } from "./sections/Swarm";
import { Impact } from "./sections/Impact";
import { Register } from "./sections/Register";

export default function WasteSimulation() {
  const sim = useSimulation();
  return (
    <>
      <Aurora />
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-44 sm:px-6">
        <Hero sim={sim} />
        <Overview sim={sim} />
        <Regions sim={sim} />
        <Materials sim={sim} />
        <Swarm sim={sim} />
        <Impact sim={sim} />
        <Register />
        <Footer />
      </main>
      <Dock sim={sim} />
    </>
  );
}
