"use client";

import CanadaMap from "@/components/canada-map";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Interactive Map of Canada
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore Canada's provinces and territories. Hover over any region to
            see details about its geography, population density, and key
            characteristics. Use your mouse wheel to zoom and drag to pan the
            map.
          </p>
        </header>

        <main className="w-full max-w-7xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
          <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[2/1] lg:aspect-[8/4.5] min-h-[500px]">
            <CanadaMap />
          </div>
        </main>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Geographic data from Natural Earth. Population data is based on
            official Statistics Canada data.
          </p>
          <p className="mt-2">
            Part of the Canadian Citizenship Test Study Guide
          </p>
        </footer>
      </div>
    </div>
  );
}
