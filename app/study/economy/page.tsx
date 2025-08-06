import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Globe,
  Factory,
} from "lucide-react";

export default function EconomyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/study-guide">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Canada's Economy
          </h1>
          <p className="text-xl text-gray-600">
            A trading nation with diverse industries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-6 w-6 mr-2" />A Trading Nation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Canada has always been a trading nation and commerce remains
                  the engine of economic growth. As Canadians, we could not
                  maintain our standard of living without engaging in trade with
                  other nations.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Trade Facts:</h4>
                  <ul className="space-y-1">
                    <li>• Free trade with United States (1988)</li>
                    <li>
                      • NAFTA with Mexico (1994) - over 444 million people
                    </li>
                    <li>• Over $1 trillion in merchandise trade (2008)</li>
                    <li>• One of the ten largest economies in the world</li>
                    <li>
                      • Part of G8 group of leading industrialized countries
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Relationship with United States:
                  </h4>
                  <p className="text-sm">
                    Each country is the other's largest trading partner. Over
                    three-quarters of Canadian exports go to the USA. We have
                    the biggest bilateral trading relationship in the world with
                    integrated supply chains.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Factory className="h-6 w-6 mr-2" />
                  Three Main Types of Industries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Service Industries</h4>
                    <p className="text-sm mb-2">
                      More than 75% of working Canadians
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• Transportation</li>
                      <li>• Education</li>
                      <li>• Health care</li>
                      <li>• Construction</li>
                      <li>• Banking</li>
                      <li>• Communications</li>
                      <li>• Retail services</li>
                      <li>• Tourism</li>
                      <li>• Government</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Manufacturing Industries</h4>
                    <p className="text-sm mb-2">
                      Make products to sell in Canada and worldwide
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• Paper</li>
                      <li>• High technology equipment</li>
                      <li>• Aerospace technology</li>
                      <li>• Automobiles</li>
                      <li>• Machinery</li>
                      <li>• Food processing</li>
                      <li>• Clothing</li>
                      <li>• Many other goods</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Natural Resources</h4>
                    <p className="text-sm mb-2">
                      Important part of history and development
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• Forestry</li>
                      <li>• Fishing</li>
                      <li>• Agriculture</li>
                      <li>• Mining</li>
                      <li>• Energy (oil, gas, hydro)</li>
                      <li>• Large percentage of exports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  Economic Growth and Social Programs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Postwar Canada enjoyed record prosperity. The discovery of oil
                  in Alberta in 1947 began Canada's modern energy industry. In
                  1951, for the first time, a majority of Canadians could afford
                  adequate food, shelter and clothing.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Social Safety Net:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      • <strong>Canada Health Act</strong> - ensures common
                      elements and basic standard of coverage
                    </li>
                    <li>
                      • <strong>Employment Insurance</strong> - introduced 1940
                      (formerly unemployment insurance)
                    </li>
                    <li>
                      • <strong>Old Age Security</strong> - devised as early as
                      1927
                    </li>
                    <li>
                      • <strong>Canada and Quebec Pension Plans</strong> -
                      established 1965
                    </li>
                    <li>
                      • <strong>Publicly funded education</strong> - provided by
                      provinces and territories
                    </li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Financial Institutions:
                  </h4>
                  <p className="text-sm">
                    First financial institutions opened in late 18th and early
                    19th centuries. Montreal Stock Exchange opened in 1832. Bank
                    of Canada created in 1934 to manage money supply and bring
                    financial stability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Economic Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Atlantic Canada</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Fishing and coastal resources</li>
                      <li>• Offshore oil and gas (NL)</li>
                      <li>• Forestry and mining</li>
                      <li>• Agriculture (especially PEI potatoes)</li>
                      <li>• Tourism</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Central Canada</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Manufacturing heartland</li>
                      <li>• Financial services (Toronto)</li>
                      <li>• Hydro-electricity (Quebec)</li>
                      <li>• Aerospace and pharmaceuticals</li>
                      <li>• Agriculture and wine (Ontario)</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Prairie Provinces</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Agriculture ("breadbasket")</li>
                      <li>• Oil and gas (especially Alberta)</li>
                      <li>• Mining (uranium, potash)</li>
                      <li>• Cattle ranching</li>
                      <li>• Hydro-electric power</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold">West Coast & North</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Forestry (most valuable in Canada)</li>
                      <li>• Pacific gateway trade</li>
                      <li>• Mining and fishing</li>
                      <li>• Tourism and film industry</li>
                      <li>• Northern: mining, oil, gas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Innovation and Technology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Canadian advances in science and technology are world
                  renowned. Since 1989, the Canadian Space Agency and Canadian
                  astronauts have participated in space exploration, often using
                  the Canadian-designed Canadarm.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Famous Canadian Inventions:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>• Telephone (Alexander Graham Bell)</div>
                    <div>• Snowmobile (Joseph-Armand Bombardier)</div>
                    <div>• Standard time zones (Sir Sandford Fleming)</div>
                    <div>• Electric light bulb (Evans & Woodward)</div>
                    <div>• Radio (Reginald Fessenden)</div>
                    <div>• Cardiac pacemaker (Dr. John A. Hopps)</div>
                    <div>• Canadarm (SPAR Aerospace)</div>
                    <div>• BlackBerry (Lazaridis & Balsillie)</div>
                    <div>• Insulin (Banting & Best)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Key Economic Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <strong>G8 Member</strong>
                    <br />
                    One of world's top 10 economies
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <strong>NAFTA</strong>
                    <br />
                    444+ million people, $1+ trillion trade
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <strong>USA Trade</strong>
                    <br />
                    75%+ of exports, biggest bilateral relationship
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <strong>Service Economy</strong>
                    <br />
                    75%+ of workers in service industries
                  </div>
                  <div className="border-l-4 border-red-500 pl-3">
                    <strong>Resources</strong>
                    <br />
                    Large percentage of exports
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Economic Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>1832:</strong> Montreal Stock Exchange
                  </div>
                  <div>
                    <strong>1934:</strong> Bank of Canada created
                  </div>
                  <div>
                    <strong>1940:</strong> Employment Insurance
                  </div>
                  <div>
                    <strong>1947:</strong> Oil discovered in Alberta
                  </div>
                  <div>
                    <strong>1965:</strong> Canada/Quebec Pension Plans
                  </div>
                  <div>
                    <strong>1988:</strong> Free trade with USA
                  </div>
                  <div>
                    <strong>1994:</strong> NAFTA with Mexico
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
                  <li>• Know the three types of industries</li>
                  <li>• Understand Canada-US trade relationship</li>
                  <li>• Learn about NAFTA and G8</li>
                  <li>• Know major social programs</li>
                  <li>• Remember key Canadian inventions</li>
                  <li>• Understand regional economic differences</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/geography" className="flex-1">
                <Button variant="outline" className="w-full">
                  Previous: Geography
                </Button>
              </Link>
              <Link href="/study/symbols" className="flex-1">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Next: Symbols
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
