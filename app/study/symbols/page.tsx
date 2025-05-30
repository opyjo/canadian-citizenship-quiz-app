import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flag, Crown, Music, Award } from "lucide-react";

export default function SymbolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Canadian Symbols
          </h1>
          <p className="text-xl text-gray-600">
            Objects, events, and people that define Canada
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-6 w-6 mr-2" />
                  The Canadian Crown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Crown has been a symbol of the state in Canada for 400
                  years. Canada has been a constitutional monarchy since
                  Confederation in 1867 during Queen Victoria's reign.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Queen Elizabeth II:</h4>
                  <ul className="space-y-1">
                    <li>• Queen of Canada since 1952</li>
                    <li>• Golden Jubilee in 2002 (50 years)</li>
                    <li>• Diamond Jubilee in 2012 (60 years)</li>
                    <li>
                      • The Crown symbolizes government, Parliament, courts,
                      police, and Canadian Forces
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-6 w-6 mr-2" />
                  Flags in Canada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Canadian Flag (1965)</h4>
                    <p className="text-sm">
                      New Canadian flag raised for first time in 1965.
                      Red-white-red pattern from Royal Military College,
                      Kingston (1876). Red and white were national colours since
                      1921.
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Other Important Flags</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • <strong>Union Jack</strong> - Official Royal Flag
                      </li>
                      <li>
                        • <strong>Canadian Red Ensign</strong> - Served as
                        national flag for 100 years, carried by veterans since
                        2005
                      </li>
                      <li>
                        • <strong>Provincial/Territorial flags</strong> - Embody
                        distinct traditions
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>National Symbols</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">The Maple Leaf</h4>
                    <p className="text-sm">
                      Canada's best-known symbol. Adopted by French-Canadians in
                      1700s, appeared on uniforms since 1850s, carved into
                      headstones of fallen soldiers.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">The Fleur-de-lys</h4>
                    <p className="text-sm">
                      Lily flower adopted by French king in 496. Symbol of
                      French royalty for 1,000+ years. Included in Canadian Red
                      Ensign, Quebec flag (1948).
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">The Beaver</h4>
                    <p className="text-sm">
                      Adopted by Hudson's Bay Company. Emblem of St. Jean
                      Baptiste Society (1834). Appears on five-cent coin, coats
                      of arms of Saskatchewan, Alberta, Montreal, Toronto.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Coat of Arms & Motto</h4>
                    <p className="text-sm">
                      "A Mari Usque Ad Mare" (from sea to sea). Arms contain
                      symbols of England, France, Scotland, Ireland, and red
                      maple leaves.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="h-6 w-6 mr-2" />
                  National Anthem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">O Canada</h4>
                  <p className="text-sm mb-2">
                    Proclaimed as national anthem in 1980. First sung in Quebec
                    City in 1880.
                  </p>
                  <div className="text-sm italic">
                    <p>O Canada! Our home and native land!</p>
                    <p>True patriot love in all thy sons command</p>
                    <p>With glowing hearts we see thee rise</p>
                    <p>The true North strong and free!</p>
                    <p>From far and wide, O Canada</p>
                    <p>We stand on guard for thee</p>
                    <p>God keep our land glorious and free!</p>
                    <p>O Canada, we stand on guard for thee</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Royal Anthem</h4>
                  <p className="text-sm">
                    "God Save the Queen (or King)" can be played when Canadians
                    wish to honour the Sovereign.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Official Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  English and French are the two official languages and
                  important symbols of identity. English speakers (Anglophones)
                  and French speakers (Francophones) have lived together for
                  more than 300 years.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Official Languages Act (1969) - Three Objectives:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      • Establish equality between French and English in
                      Parliament and Government of Canada
                    </li>
                    <li>
                      • Maintain and develop official language minority
                      communities in Canada
                    </li>
                    <li>
                      • Promote equality of French and English in Canadian
                      society
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Sports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Hockey</h4>
                    <p className="text-sm">
                      Canada's most popular spectator sport and national winter
                      sport. Developed in Canada in 1800s. NHL plays for Stanley
                      Cup (donated by Lord Stanley, 1892). Clarkson Cup for
                      women's hockey.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Other Sports</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • <strong>Canadian Football</strong> - Second most
                        popular
                      </li>
                      <li>
                        • <strong>Lacrosse</strong> - Official summer sport,
                        ancient Aboriginal game
                      </li>
                      <li>
                        • <strong>Curling</strong> - Ice game from Scottish
                        pioneers
                      </li>
                      <li>
                        • <strong>Soccer</strong> - Most registered players
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-6 w-6 mr-2" />
                  Honours and Awards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Order of Canada (1967)</h4>
                  <p className="text-sm">
                    Canada started its own honours system with the Order of
                    Canada in 1967, the centennial of Confederation. Recognizes
                    outstanding citizens.
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Victoria Cross (V.C.)</h4>
                  <p className="text-sm mb-2">
                    Highest honour available to Canadians. Awarded for
                    conspicuous bravery, daring acts of valour, or extreme
                    devotion to duty. 96 Canadians awarded since 1854.
                  </p>
                  <div className="text-xs space-y-1">
                    <div>
                      <strong>Alexander Roberts Dunn</strong> - First Canadian
                      V.C. (Crimean War, 1854)
                    </div>
                    <div>
                      <strong>William Hall</strong> - First black man awarded
                      V.C. (1857)
                    </div>
                    <div>
                      <strong>Billy Bishop</strong> - Flying ace, WWI
                    </div>
                    <div>
                      <strong>Paul Triquet</strong> - WWII, Casa Berardi, Italy
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>National Holidays</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Major Holidays</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • <strong>New Year's Day</strong> - January 1
                      </li>
                      <li>
                        • <strong>Good Friday</strong> - Before Easter
                      </li>
                      <li>
                        • <strong>Victoria Day</strong> - Monday before May 25
                      </li>
                      <li>
                        • <strong>Canada Day</strong> - July 1
                      </li>
                      <li>
                        • <strong>Labour Day</strong> - First Monday September
                      </li>
                      <li>
                        • <strong>Thanksgiving</strong> - Second Monday October
                      </li>
                      <li>
                        • <strong>Remembrance Day</strong> - November 11
                      </li>
                      <li>
                        • <strong>Christmas Day</strong> - December 25
                      </li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Special Days</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • <strong>Sir John A. Macdonald Day</strong> - January
                        11
                      </li>
                      <li>
                        • <strong>Vimy Day</strong> - April 9
                      </li>
                      <li>
                        • <strong>Fête nationale (Quebec)</strong> - June 24
                      </li>
                      <li>
                        • <strong>Sir Wilfrid Laurier Day</strong> - November 20
                      </li>
                      <li>
                        • <strong>Boxing Day</strong> - December 26
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Symbols Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-red-500 pl-3">
                    <strong>Maple Leaf</strong>
                    <br />
                    Best-known Canadian symbol
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <strong>Beaver</strong>
                    <br />
                    On 5-cent coin, industrious symbol
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <strong>Crown</strong>
                    <br />
                    400-year symbol of state
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <strong>Hockey</strong>
                    <br />
                    National winter sport
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <strong>Two Languages</strong>
                    <br />
                    English and French official
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>1965:</strong> New Canadian flag
                  </div>
                  <div>
                    <strong>1967:</strong> Order of Canada created
                  </div>
                  <div>
                    <strong>1969:</strong> Official Languages Act
                  </div>
                  <div>
                    <strong>1980:</strong> O Canada proclaimed
                  </div>
                  <div>
                    <strong>1892:</strong> Stanley Cup donated
                  </div>
                  <div>
                    <strong>1921:</strong> Red and white national colours
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
                  <li>
                    • Know the national symbols (maple leaf, beaver, crown)
                  </li>
                  <li>• Learn about the Canadian flag and its history</li>
                  <li>• Understand the two official languages</li>
                  <li>• Know the national anthem and royal anthem</li>
                  <li>• Remember major holidays and special days</li>
                  <li>• Learn about Canadian sports and honours</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/economy" className="flex-1">
                <Button variant="outline" className="w-full">
                  Previous: Economy
                </Button>
              </Link>
              <Link href="/study/notable-names" className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Next: Notable Names
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
