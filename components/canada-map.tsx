"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Info,
  Users,
  MapPin,
  Globe,
  Music,
  Calendar,
  UtensilsCrossed,
  X,
} from "lucide-react";

// GeoJSON URL for Canadian provinces and territories
const GEO_URL = "/canada-provinces.json"; // Make sure this file exists in your /public folder

// Enhanced data for provinces and territories (remains the same as provided)
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
    indigenousTerritories: string[];
    languages: string[];
    festivals: string[];
    traditionalFoods: string[];
    culturalHighlights: string[];
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
    indigenousTerritories: [
      "Treaty 6",
      "Treaty 7",
      "Treaty 8",
      "Métis Settlements",
    ],
    languages: ["English", "French", "Cree", "Blackfoot", "German", "Tagalog"],
    festivals: [
      "Calgary Stampede",
      "Edmonton Folk Music Festival",
      "Heritage Festival",
    ],
    traditionalFoods: [
      "Alberta beef",
      "Saskatoon berry pie",
      "Bison",
      "Wild rice",
    ],
    culturalHighlights: [
      "Cowboy culture",
      "Indigenous powwows",
      "Métis fiddle music",
    ],
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
    indigenousTerritories: [
      "Coast Salish",
      "Haida",
      "Nuu-chah-nulth",
      "Tsilhqot'in",
    ],
    languages: [
      "English",
      "Mandarin",
      "Cantonese",
      "Punjabi",
      "Korean",
      "Indigenous languages",
    ],
    festivals: [
      "Vancouver International Film Festival",
      "PNE",
      "Celebration of Light",
    ],
    traditionalFoods: [
      "Pacific salmon",
      "Spot prawns",
      "Nanaimo bars",
      "Cedar plank fish",
    ],
    culturalHighlights: [
      "Totem poles",
      "Asian cultural influence",
      "West Coast Indigenous art",
    ],
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
    indigenousTerritories: [
      "Treaty 1",
      "Treaty 2",
      "Treaty 3",
      "Treaty 4",
      "Treaty 5",
    ],
    languages: ["English", "French", "Cree", "Ojibwe", "Tagalog", "German"],
    festivals: ["Winnipeg Folk Festival", "Festival du Voyageur", "Folklorama"],
    traditionalFoods: ["Wild rice", "Bannock", "Pickerel", "Honey cake"],
    culturalHighlights: [
      "Métis culture",
      "Ukrainian heritage",
      "Indigenous storytelling",
    ],
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
    indigenousTerritories: ["Mi'kmaq", "Maliseet", "Passamaquoddy"],
    languages: ["English", "French", "Mi'kmaq"],
    festivals: [
      "Harvest Jazz & Blues Festival",
      "Acadian Festival",
      "Lobster Festival",
    ],
    traditionalFoods: ["Lobster rolls", "Fiddleheads", "Dulse", "Rappie pie"],
    culturalHighlights: [
      "Acadian culture",
      "Maritime music",
      "Celtic traditions",
    ],
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
    indigenousTerritories: ["Innu", "Mi'kmaq", "Inuit", "Beothuk (extinct)"],
    languages: ["English", "French", "Inuktitut", "Innu-aimun"],
    festivals: ["St. John's Regatta", "Folk Festival", "Iceberg Festival"],
    traditionalFoods: ["Cod", "Seal flipper pie", "Bakeapple", "Jiggs dinner"],
    culturalHighlights: ["Outport culture", "Irish traditions", "Inuit art"],
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
    indigenousTerritories: ["Mi'kmaq"],
    languages: ["English", "French", "Mi'kmaq", "Arabic"],
    festivals: [
      "Halifax Jazz Festival",
      "Celtic Colours",
      "Apple Blossom Festival",
    ],
    traditionalFoods: ["Lobster", "Scallops", "Blueberries", "Solomon Gundy"],
    culturalHighlights: [
      "Celtic heritage",
      "Maritime traditions",
      "African Nova Scotian culture",
    ],
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
    indigenousTerritories: ["Haudenosaunee", "Anishinaabe", "Huron-Wendat"],
    languages: ["English", "French", "Mandarin", "Italian", "Punjabi", "Urdu"],
    festivals: [
      "Toronto International Film Festival",
      "Caribana",
      "Winterlude",
    ],
    traditionalFoods: [
      "Butter tarts",
      "Peameal bacon",
      "Ice wine",
      "Maple syrup",
    ],
    culturalHighlights: [
      "Multicultural mosaic",
      "Indigenous powwows",
      "Francophone communities",
    ],
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
    indigenousTerritories: ["Mi'kmaq"],
    languages: ["English", "French", "Mi'kmaq"],
    festivals: [
      "Anne of Green Gables Festival",
      "PEI Jazz Festival",
      "Potato Blossom Festival",
    ],
    traditionalFoods: [
      "PEI potatoes",
      "Mussels",
      "Malpeque oysters",
      "Cow's ice cream",
    ],
    culturalHighlights: [
      "Anne of Green Gables heritage",
      "Acadian culture",
      "Celtic music",
    ],
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
    indigenousTerritories: [
      "Cree",
      "Inuit",
      "Mohawk",
      "Huron-Wendat",
      "Mi'kmaq",
    ],
    languages: ["French", "English", "Cree", "Inuktitut", "Arabic"],
    festivals: ["Carnaval de Québec", "Festival d'été", "Just for Laughs"],
    traditionalFoods: ["Poutine", "Tourtière", "Maple syrup", "Tarte au sucre"],
    culturalHighlights: [
      "French-Canadian culture",
      "Indigenous traditions",
      "Joual dialect",
    ],
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
    indigenousTerritories: ["Treaty 4", "Treaty 6", "Treaty 8", "Treaty 10"],
    languages: ["English", "Cree", "French", "German", "Ukrainian"],
    festivals: ["Saskatchewan Jazz Festival", "Folkfest", "Mosaic Festival"],
    traditionalFoods: [
      "Saskatoon berries",
      "Bannock",
      "Wild game",
      "Pierogies",
    ],
    culturalHighlights: [
      "Prairie culture",
      "Ukrainian heritage",
      "Indigenous ceremonies",
    ],
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
    indigenousTerritories: ["Dene", "Métis", "Inuvialuit"],
    languages: [
      "English",
      "French",
      "Chipewyan",
      "Dogrib",
      "Gwich'in",
      "Inuvialuktun",
    ],
    festivals: [
      "Yellowknife Folk on the Rocks",
      "Caribou Carnival",
      "Long John Jamboree",
    ],
    traditionalFoods: ["Caribou", "Arctic char", "Cloudberries", "Bannock"],
    culturalHighlights: [
      "Dene traditions",
      "Diamond cutting",
      "Northern lights ceremonies",
    ],
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
    indigenousTerritories: ["Inuit"],
    languages: ["Inuktitut", "English", "French", "Inuinnaqtun"],
    festivals: ["Toonik Tyme", "Alianait Festival", "Nunavut Day"],
    traditionalFoods: ["Seal", "Arctic char", "Caribou", "Muktuk"],
    culturalHighlights: [
      "Inuit throat singing",
      "Soapstone carving",
      "Traditional hunting",
    ],
  },
  "Yukon Territory": {
    name: "Yukon", // Matched to "Yukon Territory" in mapRegionName
    description:
      "A territory in northwestern Canada, known for the Klondike Gold Rush and mountainous terrain. Midnight sun land.",
    populationDensity: 0.09,
    id: "YT",
    capital: "Whitehorse",
    keyFacts: ["Klondike Gold Rush", "Mount Logan", "Midnight sun"],
    population: "43,000",
    indigenousTerritories: [
      "Champagne and Aishihik",
      "Tr'ondëk Hwëch'in",
      "Vuntut Gwitchin",
    ],
    languages: ["English", "French", "Gwich'in", "Han", "Northern Tutchone"],
    festivals: [
      "Yukon Sourdough Rendezvous",
      "Dawson City Music Festival",
      "Adäka Festival",
    ],
    traditionalFoods: ["Salmon", "Moose", "Wild berries", "Sourdough bread"],
    culturalHighlights: [
      "Gold Rush heritage",
      "First Nations traditions",
      "Midnight sun festivals",
    ],
  },
};

const getDensityColor = (density: number | undefined): string => {
  if (density === undefined) return "#CCCCCC"; // neutral-300
  if (density > 20) return "#dc2626"; // red-600
  if (density > 15) return "#f97316"; // orange-500
  if (density > 10) return "#f59e0b"; // amber-500
  if (density > 5) return "#eab308"; // yellow-500
  if (density > 2) return "#84cc16"; // lime-500
  if (density > 1) return "#22c55e"; // green-500
  if (density > 0) return "#10b981"; // emerald-500
  return "#06b6d4"; // cyan-500
};

const Legend: React.FC = () => {
  const densityLevels = [
    { color: "#dc2626", label: ">20 p/km²", range: "Very High" },
    { color: "#f97316", label: "15-20", range: "High" },
    { color: "#f59e0b", label: "10-15", range: "Mod-High" },
    { color: "#eab308", label: "5-10", range: "Moderate" },
    { color: "#84cc16", label: "2-5", range: "Low-Mod" },
    { color: "#22c55e", label: "1-2", range: "Low" },
    { color: "#10b981", label: "0-1", range: "Very Low" },
    { color: "#06b6d4", label: "<1", range: "Sparse" },
    { color: "#CCCCCC", label: "No Data", range: "N/A" },
  ].reverse();

  return (
    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-white/80 backdrop-blur-sm p-2 sm:p-3 shadow-lg rounded-lg text-xs z-10 border border-gray-200">
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
        <h4 className="font-semibold text-gray-700 text-[10px] sm:text-xs leading-tight">
          Population Density
        </h4>
      </div>
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {densityLevels.map((level) => (
          <div key={level.label} className="flex items-center gap-1">
            <span
              style={{ backgroundColor: level.color }}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm border border-gray-300 flex-shrink-0"
            />
            <span className="text-gray-600 text-[8px] sm:text-[10px] leading-tight whitespace-nowrap">
              <span className="hidden sm:inline">{level.label}</span>
              <span className="sm:hidden">{level.range}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Instructions: React.FC = () => {
  return (
    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/80 backdrop-blur-sm p-2 sm:p-3 shadow-lg rounded-lg z-10 border border-gray-200 max-w-[120px] sm:max-w-xs">
      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-1.5">
        <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
        <h4 className="font-semibold text-gray-700 text-[10px] sm:text-xs">
          How to use
        </h4>
      </div>
      <ul className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 leading-tight">
        <li className="sm:hidden">• Tap regions for info</li>
        <li className="hidden sm:block">• Click regions for details</li>
        <li className="sm:hidden">• Switch tabs for culture</li>
        <li className="hidden sm:block">• Switch tabs for cultural data</li>
        <li className="sm:hidden">• Pinch to zoom</li>
        <li className="hidden sm:block">• Scroll wheel to zoom</li>
        <li className="sm:hidden">• Drag to pan</li>
        <li className="hidden sm:block">• Drag to pan map</li>
      </ul>
    </div>
  );
};

const getRegionName = (geoProperties: any): string => {
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

  for (const name of possibleNames) {
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return Object.keys(geoProperties)[0] || "Unknown Region";
};

const mapRegionName = (geoJsonName: string): string => {
  const nameMapping: Record<string, string> = {
    Yukon: "Yukon Territory", // Match GeoJSON "Yukon" to "Yukon Territory" in data
    "Northwest Territories": "Northwest Territories",
    NWT: "Northwest Territories",
    NL: "Newfoundland and Labrador",
    "P.E.I.": "Prince Edward Island",
    PEI: "Prince Edward Island",
    "N.S.": "Nova Scotia",
    "N.B.": "New Brunswick",
    "B.C.": "British Columbia",
    BC: "British Columbia",
  };
  return nameMapping[geoJsonName] || geoJsonName;
};

const CanadaMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "cultural">("general");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 640); // Tailwind 'sm' breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleRegionClick = (geo: any) => {
    const rawRegionName = getRegionName(geo.properties);
    const regionName = mapRegionName(rawRegionName);
    const regionInfo = PROVINCE_TERRITORY_DATA[regionName];

    if (regionInfo) {
      setSelectedRegion(regionName);
      setActiveTab("general"); // Reset to general tab on new selection
    } else {
      console.warn(
        "Clicked region not found in data:",
        regionName,
        "(Raw: ",
        rawRegionName,
        ") Props:",
        geo.properties
      );
      setSelectedRegion(rawRegionName); // Still select to show debug info
    }
  };

  const selectedRegionInfo = selectedRegion
    ? PROVINCE_TERRITORY_DATA[selectedRegion]
    : null;

  // Responsive map configuration
  const mapConfig = {
    // Mobile gets portrait aspect ratio with larger scale
    scale: isMobileView ? 1000 : 650,
    center: isMobileView ? [-95, 62] : [-95, 65], // Better centering for mobile
    zoom: isMobileView ? 0.9 : 1,
    width: 800,
    height: 600,
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-blue-100 to-sky-200">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [100, -60, 0],
          scale: mapConfig.scale,
        }}
        width={mapConfig.width}
        height={mapConfig.height}
        style={{ width: "100%", height: "100%" }}
        aria-label="Interactive map of Canada"
      >
        <ZoomableGroup
          center={mapConfig.center as [number, number]}
          zoom={mapConfig.zoom}
          minZoom={0.3}
          maxZoom={10}
        >
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
                    onClick={() => handleRegionClick(geo)}
                    style={{
                      default: {
                        fill: isSelected
                          ? "#fbbf24" // amber-400
                          : getDensityColor(regionInfo?.populationDensity),
                        stroke: isSelected ? "#020617" : "#4b5563", // slate-950 : gray-600
                        strokeWidth: isSelected ? 1.5 : 0.3, // Thinner default stroke
                        outline: "none",
                        transition: "fill 0.2s, stroke-width 0.2s",
                      },
                      hover: {
                        fill: "#fcd34d", // amber-300
                        stroke: "#020617", // slate-950
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#f59e0b", // amber-500
                        stroke: "#020617", // slate-950
                        strokeWidth: 1.5,
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

      {/* Backdrop for mobile when panel is open */}
      {selectedRegion && isMobileView && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 sm:hidden"
          onClick={() => setSelectedRegion(null)}
          aria-hidden="true"
        />
      )}

      {/* Enhanced Region Info Panel - Mobile Responsive */}
      {selectedRegion && (
        <div
          className={`
            fixed sm:absolute 
            bottom-0 left-0 right-0 sm:left-4 sm:top-4 sm:bottom-auto sm:right-auto
            bg-white/95 backdrop-blur-md shadow-2xl sm:shadow-xl 
            border-t sm:border border-gray-200
            rounded-t-2xl sm:rounded-lg 
            z-30 
            transition-transform duration-300 ease-out
            w-full sm:max-w-md 
            ${
              selectedRegion && isMobileView
                ? "translate-y-0"
                : isMobileView
                ? "translate-y-full"
                : ""
            }
            ${
              selectedRegion && !isMobileView
                ? "opacity-100 scale-100"
                : !isMobileView
                ? "opacity-0 scale-95"
                : ""
            }
            max-h-[80vh] sm:max-h-[calc(100vh-5rem)] flex flex-col
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {selectedRegionInfo?.name || selectedRegion}
              </h3>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close region details"
            >
              <X size={20} />
            </button>
          </div>

          {selectedRegionInfo ? (
            <>
              <div className="p-1 sm:p-2 bg-gray-100 flex-shrink-0">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center text-center ${
                      activeTab === "general"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    General Info
                  </button>
                  <button
                    onClick={() => setActiveTab("cultural")}
                    className={`py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center text-center ${
                      activeTab === "cultural"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    Cultural Heritage
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-4 space-y-4 flex-grow">
                {/* General Information Tab */}
                {activeTab === "general" && (
                  <div className="space-y-3 text-sm animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {[
                        { label: "Capital", value: selectedRegionInfo.capital },
                        {
                          label: "Population",
                          value: selectedRegionInfo.population,
                        },
                        {
                          label: "Density",
                          value: `${selectedRegionInfo.populationDensity} p/km²`,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between items-center text-xs sm:text-sm"
                        >
                          <span className="font-semibold text-gray-700">
                            {item.label}:
                          </span>
                          <span className="text-gray-900 font-medium text-right">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-xs sm:text-sm">
                        About {selectedRegionInfo.name}
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                        {selectedRegionInfo.description}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-xs sm:text-sm">
                        Key Facts
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm">
                        {selectedRegionInfo.keyFacts.map((fact, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <span className="text-green-600 font-bold mt-0.5">
                              •
                            </span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Cultural Information Tab */}
                {activeTab === "cultural" && (
                  <div className="space-y-3 text-sm animate-in fade-in-50 duration-300">
                    {[
                      {
                        icon: Globe,
                        color: "amber",
                        title: "Indigenous Territories",
                        data: selectedRegionInfo.indigenousTerritories,
                        type: "tags",
                      },
                      {
                        icon: Globe,
                        color: "blue",
                        title: "Languages Spoken",
                        data: selectedRegionInfo.languages,
                        type: "tags",
                      },
                      {
                        icon: Calendar,
                        color: "purple",
                        title: "Cultural Festivals",
                        data: selectedRegionInfo.festivals,
                        type: "list",
                      },
                      {
                        icon: UtensilsCrossed,
                        color: "green",
                        title: "Traditional Foods",
                        data: selectedRegionInfo.traditionalFoods,
                        type: "tags",
                      },
                      {
                        icon: Music,
                        color: "rose",
                        title: "Cultural Highlights",
                        data: selectedRegionInfo.culturalHighlights,
                        type: "list",
                      },
                    ].map((section) => (
                      <div
                        key={section.title}
                        className={`bg-${section.color}-50 p-3 rounded-lg border border-${section.color}-200`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <section.icon
                            className={`h-4 w-4 text-${section.color}-600 flex-shrink-0`}
                          />
                          <h4
                            className={`font-semibold text-${section.color}-900 text-xs sm:text-sm`}
                          >
                            {section.title}
                          </h4>
                        </div>
                        {section.type === "tags" ? (
                          <div className="flex flex-wrap gap-1.5">
                            {section.data.map((item, index) => (
                              <span
                                key={index}
                                className={`text-[10px] sm:text-xs bg-${section.color}-100 text-${section.color}-800 px-2 py-0.5 rounded-full`}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-1.5 text-xs sm:text-sm">
                            {section.data.map((item, index) => (
                              <li
                                key={index}
                                className={`flex items-start gap-2 text-${section.color}-700`}
                              >
                                <span
                                  className={`text-${section.color}-500 font-bold mt-0.5`}
                                >
                                  •
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3 text-sm text-center">
              <p className="text-gray-600">
                Detailed information for "{selectedRegion}" is not available.
              </p>
              <p className="text-xs bg-yellow-100 text-yellow-700 p-2 rounded border border-yellow-200">
                <strong>Debug Info:</strong> Region name detected as "
                {selectedRegion}". Check `PROVINCE_TERRITORY_DATA` and
                `mapRegionName` function.
              </p>
            </div>
          )}
        </div>
      )}

      <Legend />
      <Instructions />
    </div>
  );
};

export default CanadaMap;
