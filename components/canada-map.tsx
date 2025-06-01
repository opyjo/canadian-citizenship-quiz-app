"use client";

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Info, Users, MapPin } from "lucide-react";

// GeoJSON URL for Canadian provinces and territories
const GEO_URL = "/canada-provinces.json";

// Enhanced data for provinces and territories with citizenship test relevant information
const PROVINCE_TERRITORY_DATA: Record<
  string,
  {
    name: string;
    description: string;
    populationDensity: number;
    id: string;
    capital: string;
    keyFacts: string[];
    population: string;
  }
> = {
  Alberta: {
    name: "Alberta",
    description:
      "Known for its oil sands, agriculture, and the Rocky Mountains. Home to Banff and Jasper National Parks.",
    populationDensity: 6.9,
    id: "AB",
    capital: "Edmonton",
    keyFacts: ["Oil and gas industry", "Calgary Stampede", "Canadian Rockies"],
    population: "4.6 million",
  },
  "British Columbia": {
    name: "British Columbia",
    description:
      "Canada's westernmost province, with a Pacific coastline and mountainous interior. Gateway to Asia.",
    populationDensity: 5.2,
    id: "BC",
    capital: "Victoria",
    keyFacts: ["Pacific gateway", "Film industry", "Coastal rainforests"],
    population: "5.2 million",
  },
  Manitoba: {
    name: "Manitoba",
    description:
      "A central Canadian province, rich in lakes, rivers, and prairie landscapes. Known for polar bears.",
    populationDensity: 2.3,
    id: "MB",
    capital: "Winnipeg",
    keyFacts: ["Polar bears in Churchill", "Red River", "Wheat farming"],
    population: "1.4 million",
  },
  "New Brunswick": {
    name: "New Brunswick",
    description:
      "One of the three Maritime provinces, known for its forests and coastline. Only officially bilingual province.",
    populationDensity: 10.6,
    id: "NB",
    capital: "Fredericton",
    keyFacts: ["Officially bilingual", "Bay of Fundy tides", "Covered bridges"],
    population: "789,000",
  },
  "Newfoundland and Labrador": {
    name: "Newfoundland and Labrador",
    description:
      "The easternmost province, comprising the island of Newfoundland and mainland Labrador. Last to join Canada.",
    populationDensity: 1.4,
    id: "NL",
    capital: "St. John's",
    keyFacts: ["Joined Canada in 1949", "Viking settlement", "Iceberg Alley"],
    population: "521,000",
  },
  "Nova Scotia": {
    name: "Nova Scotia",
    description:
      "A Maritime province known for its coastal beauty, seafood, and maritime history. Birthplace of hockey.",
    populationDensity: 18.0,
    id: "NS",
    capital: "Halifax",
    keyFacts: [
      "Halifax Explosion 1917",
      "Bluenose schooner",
      "Lobster fishing",
    ],
    population: "992,000",
  },
  Ontario: {
    name: "Ontario",
    description:
      "Canada's most populous province, home to Ottawa (capital) and Toronto (largest city). Economic heartland.",
    populationDensity: 15.9,
    id: "ON",
    capital: "Toronto",
    keyFacts: ["National capital Ottawa", "Niagara Falls", "CN Tower"],
    population: "15.6 million",
  },
  "Prince Edward Island": {
    name: "Prince Edward Island",
    description:
      "A Maritime province, Canada's smallest, known for red sand beaches and agriculture. Anne of Green Gables setting.",
    populationDensity: 27.2,
    id: "PE",
    capital: "Charlottetown",
    keyFacts: [
      "Confederation birthplace",
      "Red sand beaches",
      "Potato farming",
    ],
    population: "164,000",
  },
  Quebec: {
    name: "Quebec",
    description:
      "A predominantly French-speaking province with a rich history and distinct culture. Largest province by area.",
    populationDensity: 6.2,
    id: "QC",
    capital: "Quebec City",
    keyFacts: ["French majority", "Quebec City walls", "Maple syrup"],
    population: "8.6 million",
  },
  Saskatchewan: {
    name: "Saskatchewan",
    description:
      "A prairie province known for its agriculture, particularly wheat, and vast open skies. Land of living skies.",
    populationDensity: 2.0,
    id: "SK",
    capital: "Regina",
    keyFacts: ["Wheat province", "RCMP training depot", "Potash mining"],
    population: "1.2 million",
  },
  "Northwest Territories": {
    name: "Northwest Territories",
    description:
      "A federal territory in northern Canada, known for its vast wilderness and aurora borealis. Diamond mining region.",
    populationDensity: 0.04,
    id: "NT",
    capital: "Yellowknife",
    keyFacts: ["Aurora borealis", "Diamond mines", "Midnight sun"],
    population: "45,000",
  },
  Nunavut: {
    name: "Nunavut",
    description:
      "The largest and northernmost territory, with a predominantly Inuit population. Newest territory (1999).",
    populationDensity: 0.02,
    id: "NU",
    capital: "Iqaluit",
    keyFacts: ["Newest territory", "Inuit majority", "Arctic archipelago"],
    population: "40,000",
  },
  "Yukon Territory": {
    name: "Yukon",
    description:
      "A territory in northwestern Canada, known for the Klondike Gold Rush and mountainous terrain. Midnight sun land.",
    populationDensity: 0.09,
    id: "YT",
    capital: "Whitehorse",
    keyFacts: ["Klondike Gold Rush", "Mount Logan", "Midnight sun"],
    population: "43,000",
  },
};

const getDensityColor = (density: number | undefined): string => {
  if (density === undefined) return "#CCCCCC";
  if (density > 20) return "#dc2626"; // red-600
  if (density > 15) return "#ea580c"; // orange-600
  if (density > 10) return "#d97706"; // amber-600
  if (density > 5) return "#ca8a04"; // yellow-600
  if (density > 2) return "#65a30d"; // lime-600
  if (density > 1) return "#16a34a"; // green-600
  if (density > 0) return "#059669"; // emerald-600
  return "#0891b2"; // cyan-600
};

const Legend: React.FC = () => {
  const densityLevels = [
    { color: "#dc2626", label: ">20 people/km²", range: "Very High" },
    { color: "#ea580c", label: "15-20", range: "High" },
    { color: "#d97706", label: "10-15", range: "Moderate-High" },
    { color: "#ca8a04", label: "5-10", range: "Moderate" },
    { color: "#65a30d", label: "2-5", range: "Low-Moderate" },
    { color: "#16a34a", label: "1-2", range: "Low" },
    { color: "#059669", label: "0-1", range: "Very Low" },
    { color: "#0891b2", label: "<1", range: "Sparse" },
    { color: "#CCCCCC", label: "No Data", range: "N/A" },
  ].reverse();

  return (
    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 shadow-lg rounded-lg text-xs z-10 border border-gray-200 max-w-48">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-gray-600" />
        <h4 className="font-semibold text-gray-700">Population Density</h4>
      </div>
      <div className="space-y-1">
        {densityLevels.map((level) => (
          <div key={level.label} className="flex items-center gap-2">
            <span
              style={{ backgroundColor: level.color }}
              className="w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0"
            />
            <span className="text-gray-600 text-xs">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced region name extraction function
const getRegionName = (geoProperties: any): string => {
  // Try various property name variations commonly found in GeoJSON data
  const possibleNames = [
    geoProperties.name,
    geoProperties.NAME,
    geoProperties.Name,
    geoProperties.NAME_EN,
    geoProperties.name_en,
    geoProperties.PRENAME,
    geoProperties.prename,
    geoProperties.PRFNAME,
    geoProperties.prfname,
    geoProperties.PREABBR,
    geoProperties.preabbr,
    geoProperties.territory,
    geoProperties.province,
    geoProperties.region,
  ].filter(Boolean);

  // Return the first valid name found
  for (const name of possibleNames) {
    if (typeof name === "string" && name.trim()) {
      return name.trim();
    }
  }

  // If no standard name found, return a fallback
  return Object.keys(geoProperties)[0] || "Unknown Region";
};

// Name mapping function to handle variations between GeoJSON and our data keys
const mapRegionName = (geoJsonName: string): string => {
  const nameMapping: Record<string, string> = {
    // Handle common variations
    "Yukon Territory": "Yukon Territory",
    Yukon: "Yukon Territory",
    "Northwest Territories": "Northwest Territories",
    NWT: "Northwest Territories",
    NL: "Newfoundland and Labrador",
    "P.E.I.": "Prince Edward Island",
    PEI: "Prince Edward Island",
    "N.S.": "Nova Scotia",
    "N.B.": "New Brunswick",
    "B.C.": "British Columbia",
    BC: "British Columbia",
    // Add more mappings as needed
  };

  return nameMapping[geoJsonName] || geoJsonName;
};

const CanadaMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const handleMouseEnter = (
    geo: any,
    event: React.MouseEvent<SVGPathElement>
  ) => {
    const rawRegionName = getRegionName(geo.properties);
    const regionName = mapRegionName(rawRegionName);
    const regionInfo = PROVINCE_TERRITORY_DATA[regionName];

    if (regionInfo) {
      setTooltipContent(`${regionInfo.name} (${regionInfo.id})`);
    } else {
      setTooltipContent(rawRegionName || "Unknown region");
      // Debug logging to help identify missing regions
      console.log(
        "Region not found in data:",
        regionName,
        "Raw name:",
        rawRegionName,
        "Properties:",
        geo.properties
      );
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  const handleRegionClick = (geo: any) => {
    const rawRegionName = getRegionName(geo.properties);
    const regionName = mapRegionName(rawRegionName);
    const regionInfo = PROVINCE_TERRITORY_DATA[regionName];

    if (regionInfo) {
      setSelectedRegion(regionName);
    } else {
      // Debug logging for troubleshooting
      console.log("Clicked region not found:", regionName);
      console.log("Raw region name:", rawRegionName);
      console.log("Available properties:", geo.properties);
      console.log("Available regions:", Object.keys(PROVINCE_TERRITORY_DATA));

      // Still allow selection for debugging purposes
      setSelectedRegion(rawRegionName);
    }
  };

  const selectedRegionInfo = selectedRegion
    ? PROVINCE_TERRITORY_DATA[selectedRegion]
    : null;

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-blue-50 to-blue-100">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [100, -60, 0],
          scale: 700,
        }}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%" }}
        aria-label="Interactive map of Canada showing provinces and territories"
      >
        <ZoomableGroup center={[-95, 65]} zoom={1} minZoom={0.5} maxZoom={8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const rawRegionName = getRegionName(geo.properties);
                const regionName = mapRegionName(rawRegionName);
                const regionInfo = PROVINCE_TERRITORY_DATA[regionName];
                const isSelected = selectedRegion === regionName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(event) => handleMouseEnter(geo, event)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRegionClick(geo)}
                    style={{
                      default: {
                        fill: isSelected
                          ? "#fbbf24"
                          : getDensityColor(regionInfo?.populationDensity),
                        stroke: "#1e293b",
                        strokeWidth: isSelected ? 2 : 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#fbbf24",
                        stroke: "#1e293b",
                        strokeWidth: 1.5,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#f59e0b",
                        stroke: "#1e293b",
                        strokeWidth: 2,
                        outline: "none",
                      },
                    }}
                    aria-label={`${
                      regionName || "Canadian region"
                    } - Click for details`}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          style={{
            position: "fixed",
            top: tooltipPosition.y + 15,
            left: tooltipPosition.x + 15,
            background: "rgba(255, 255, 255, 0.95)",
            padding: "8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            pointerEvents: "none",
            zIndex: 1000,
            fontSize: "0.875rem",
            color: "#1e293b",
            fontWeight: "500",
            backdropFilter: "blur(4px)",
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Region Info Panel */}
      {selectedRegion && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-6 shadow-xl rounded-lg z-10 border border-gray-200 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">
                {selectedRegionInfo?.name || selectedRegion}
              </h3>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close region details"
            >
              ×
            </button>
          </div>

          {selectedRegionInfo ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Capital:</span>{" "}
                {selectedRegionInfo.capital}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Population:</span>{" "}
                {selectedRegionInfo.population}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Density:</span>{" "}
                {selectedRegionInfo.populationDensity} people/km²
              </div>
              <div>
                <p className="text-gray-600 leading-relaxed">
                  {selectedRegionInfo.description}
                </p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 block mb-2">
                  Key Facts:
                </span>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {selectedRegionInfo.keyFacts.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="text-gray-600">
                <p className="mb-3">
                  This region was detected but detailed information is not
                  available in our database.
                </p>
                <p className="text-xs bg-yellow-50 p-2 rounded">
                  <strong>Debug Info:</strong> Region name detected as "
                  {selectedRegion}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Legend />

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 shadow-lg rounded-lg z-10 border border-gray-200 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-gray-700 text-sm">
            How to use
          </span>
        </div>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Hover to see region names</li>
          <li>• Click to view detailed info</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Drag to pan the map</li>
        </ul>
      </div>
    </div>
  );
};

export default CanadaMap;
