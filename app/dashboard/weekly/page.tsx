"use client";

import React, { Suspense } from "react";
export const dynamic = "force-dynamic";

// import the implementation you just created
import WeeklyUnifiedPage from "./WeeklyUnifiedPageImpl";

// lightweight skeleton while searchParams/router hydrate
function WeeklyFallback() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-[1600px] px-8 pt-6 pb-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-72 rounded bg-slate-200 animate-pulse" />
          <div className="h-9 w-56 rounded-xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-24 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-24 rounded-2xl border border-slate-200 bg-white" />
        </div>
        <div className="h-[420px] rounded-2xl border border-slate-200 bg-white" />
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<WeeklyFallback />}>
      <WeeklyUnifiedPage />
    </Suspense>
  );
}
