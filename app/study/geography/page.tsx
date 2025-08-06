import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Map, MapPin, Mountain, Waves } from "lucide-react";

export default function GeographyPage() {
  const provinces = [
    {
      region: "Atlantic",
      name: "Newfoundland and Labrador",
      capital: "St. John's",
    },
    {
      region: "Atlantic",
      name: "Prince Edward Island",
      capital: "Charlottetown",
    },
    { region: "Atlantic", name: "Nova Scotia", capital: "Halifax" },
    { region: "Atlantic", name: "New Brunswick", capital: "Fredericton" },
    { region: "Central", name: "Quebec", capital: "Quebec City" },
    { region: "Central", name: "Ontario", capital: "Toronto" },
    { region: "Prairie", name: "Manitoba", capital: "Winnipeg" },
    { region: "Prairie", name: "Saskatchewan", capital: "Regina" },
    { region: "Prairie", name: "Alberta", capital: "Edmonton" },
    { region: "West Coast", name: "British Columbia", capital: "Victoria" },
    { region: "North", name: "Nunavut", capital: "Iqaluit" },
    { region: "North", name: "Northwest Territories", capital: "Yellowknife" },
    { region: "North", name: "Yukon Territory", capital: "Whitehorse" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/study-guide">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Canadian Geography
          </h1>
          <p className="text-xl text-gray-600">
            Canada's regions, provinces, and territories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="h-6 w-6 mr-2" />
                  Canada Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold">Size</h4>
                    <p className="text-sm">Second largest country on earth</p>
                    <p className="text-sm">10 million square kilometres</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold">Population</h4>
                    <p className="text-sm">About 34 million people</p>
                    <p className="text-sm">Majority live in cities</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold">Capital</h4>
                    <p className="text-sm">Ottawa, Ontario</p>
                    <p className="text-sm">4th largest metropolitan area</p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Three Oceans:</h4>
                  <ul className="space-y-1">
                    <li>
                      • <strong>Pacific Ocean</strong> - West
                    </li>
                    <li>
                      • <strong>Atlantic Ocean</strong> - East
                    </li>
                    <li>
                      • <strong>Arctic Ocean</strong> - North
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Waves className="h-6 w-6 mr-2" />
                  The Atlantic Provinces
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Atlantic Canada's coasts and natural resources have made these
                  provinces important to Canada's history. Cool winters and cool
                  humid summers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Newfoundland and Labrador</h4>
                    <p className="text-sm">
                      Most easterly point, own time zone. Known for fisheries
                      and offshore oil/gas. Labrador has hydro-electric
                      resources.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Prince Edward Island</h4>
                    <p className="text-sm">
                      Smallest province. Known for beaches, red soil, potatoes.
                      Birthplace of Confederation. Connected by Confederation
                      Bridge.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Nova Scotia</h4>
                    <p className="text-sm">
                      Most populous Atlantic province. Halifax is largest east
                      coast port. World's highest tides in Bay of Fundy.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">New Brunswick</h4>
                    <p className="text-sm">
                      Only officially bilingual province. Founded by United
                      Empire Loyalists. One-third population lives and works in
                      French.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Central Canada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  More than half of Canadians live in Central Canada - the
                  industrial and manufacturing heartland. Together, Ontario and
                  Quebec produce more than three-quarters of all Canadian
                  manufactured goods.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Quebec</h4>
                    <p className="text-sm mb-2">
                      Nearly 8 million people, mostly along St. Lawrence River.
                      More than 3/4 speak French as first language.
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• Main producer of pulp and paper</li>
                      <li>• Largest producer of hydro-electricity</li>
                      <li>• Leaders in pharmaceuticals and aeronautics</li>
                      <li>
                        • Montreal is 2nd largest French-speaking city after
                        Paris
                      </li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Ontario</h4>
                    <p className="text-sm mb-2">
                      More than 12 million people - over 1/3 of all Canadians.
                      Toronto is largest city and main financial centre.
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• Large percentage of Canada's exports</li>
                      <li>• Niagara region known for vineyards and wines</li>
                      <li>
                        • Largest French-speaking population outside Quebec
                      </li>
                      <li>• Five Great Lakes between Ontario and USA</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mountain className="h-6 w-6 mr-2" />
                  The Prairie Provinces
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Manitoba, Saskatchewan, and Alberta are rich in energy
                  resources and have some of the most fertile farmland in the
                  world. Mostly dry with cold winters and hot summers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Manitoba</h4>
                    <p className="text-sm">
                      Economy based on agriculture, mining, hydro-electric
                      power. Winnipeg's Portage and Main is Canada's most famous
                      intersection. Largest Aboriginal population (15%+).
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Saskatchewan</h4>
                    <p className="text-sm">
                      "Breadbasket of the world" - 40% of Canada's arable land.
                      World's richest uranium and potash deposits. Regina is
                      RCMP training academy home.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Alberta</h4>
                    <p className="text-sm">
                      Most populous Prairie province. Largest oil and gas
                      producer. Oil sands in north. Vast cattle ranches. Five
                      national parks including Banff (1885).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The West Coast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold">British Columbia</h4>
                  <p className="text-sm mb-2">
                    Canada's westernmost province with 4 million people. Port of
                    Vancouver is gateway to Asia-Pacific.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Half of all goods produced are forestry products</li>
                    <li>• Most valuable forestry industry in Canada</li>
                    <li>
                      • Known for mining, fishing, Okanagan Valley fruit/wine
                    </li>
                    <li>• Most extensive park system (600 provincial parks)</li>
                    <li>
                      • Large Asian communities - Chinese and Punjabi widely
                      spoken
                    </li>
                    <li>
                      • Victoria is capital and navy Pacific fleet headquarters
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The Northern Territories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  One-third of Canada's land mass but only 100,000 people. "Land
                  of the Midnight Sun" - 24 hours daylight in summer, 3 months
                  darkness in winter.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Yukon</h4>
                    <p className="text-sm">
                      Gold Rush of 1890s. Mining remains significant. White Pass
                      and Yukon Railway. Coldest temperature in Canada (-63°C).
                      Capital: Whitehorse.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Northwest Territories</h4>
                    <p className="text-sm">
                      Yellowknife is "diamond capital of North America." More
                      than half population is Aboriginal. Mackenzie River is 2nd
                      longest in North America.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Nunavut</h4>
                    <p className="text-sm">
                      "Our land" in Inuktitut. Established 1999. 85% Inuit
                      population. Inuktitut is official language. Capital:
                      Iqaluit (formerly Frobisher Bay).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Provinces & Capitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {provinces.map((province, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        province.region === "Atlantic"
                          ? "bg-blue-50"
                          : province.region === "Central"
                          ? "bg-green-50"
                          : province.region === "Prairie"
                          ? "bg-yellow-50"
                          : province.region === "West Coast"
                          ? "bg-purple-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold">{province.name}</div>
                      <div className="text-xs text-gray-600">
                        {province.capital}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Geographic Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Longest river:</strong> Mackenzie (4,200 km)
                  </div>
                  <div>
                    <strong>Highest mountain:</strong> Mount Logan (Yukon)
                  </div>
                  <div>
                    <strong>Largest freshwater lake:</strong> Lake Superior
                  </div>
                  <div>
                    <strong>Highest tides:</strong> Bay of Fundy
                  </div>
                  <div>
                    <strong>Most easterly:</strong> Newfoundland
                  </div>
                  <div>
                    <strong>Most westerly:</strong> British Columbia
                  </div>
                  <div>
                    <strong>Most northerly:</strong> Nunavut
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Know all provinces/territories and capitals</li>
                  <li>• Learn the five regions</li>
                  <li>• Understand each region's characteristics</li>
                  <li>• Know major cities and geographic features</li>
                  <li>• Remember population distribution</li>
                  <li>• Learn about natural resources</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/government-structure" className="flex-1">
                <Button variant="outline" className="w-full">
                  Previous: Government
                </Button>
              </Link>
              <Link href="/study/economy" className="flex-1">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Next: Economy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
