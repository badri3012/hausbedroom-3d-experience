"use client";

import React from "react";
import { Configurator } from "@/components/configurator/Configurator";

export default function Home() {
  return (
    <main className="w-full h-screen bg-[#F5F3EF] overflow-hidden">
      <Configurator />
    </main>
  );
}
