"use client";

import CanadaMap from "@/components/canada-map";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            Interactive Map of Canada
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            Explore Canada's provinces and territories. Tap or click any region
            to see details about its geography, population density, and key
            characteristics. Use pinch-to-zoom or your mouse wheel to zoom, and
            drag to pan the map.
          </p>
        </header>

        <main className="w-full max-w-7xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
          {/* Mobile-optimized aspect ratio container */}
          <div className="aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] xl:aspect-[8/4.5] min-h-[400px] sm:min-h-[500px] md:min-h-[600px] w-full">
            <CanadaMap />
          </div>
        </main>

        <footer className="mt-4 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm px-2">
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
