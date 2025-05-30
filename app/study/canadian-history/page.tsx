import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Users, Sword } from "lucide-react"

export default function CanadianHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Canadian History</h1>
          <p className="text-xl text-gray-600">From Aboriginal peoples to modern Canada</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Aboriginal Peoples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The ancestors of Aboriginal peoples are believed to have migrated from Asia many thousands of years
                  ago. They were well established here long before explorers from Europe first came to North America.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Three Distinct Groups:</h4>
                  <ul className="space-y-2">
                    <li>
                      <strong>First Nations (Indian):</strong> About 65% of Aboriginal people. About half live on
                      reserve land in about 600 communities.
                    </li>
                    <li>
                      <strong>Métis:</strong> 30% of Aboriginal people. A distinct people of mixed Aboriginal and
                      European ancestry, majority live in Prairie provinces.
                    </li>
                    <li>
                      <strong>Inuit:</strong> 4% of Aboriginal people. "The people" in Inuktitut language, live in small
                      scattered communities across the Arctic.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The First Europeans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Vikings from Iceland who colonized Greenland 1,000 years ago also reached Labrador and
                  Newfoundland. The remains of their settlement, l'Anse aux Meadows, are a World Heritage site.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">John Cabot (1497)</h4>
                    <p className="text-sm">
                      Italian immigrant to England, first to map Canada's Atlantic shore, claiming Newfoundland for
                      England.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Jacques Cartier (1534-1542)</h4>
                    <p className="text-sm">
                      Made three voyages, claiming land for France. Heard the Iroquoian word "kanata" meaning village.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Royal New France</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  In 1604, the first European settlement north of Florida was established by French explorers Pierre de
                  Monts and Samuel de Champlain. In 1608, Champlain built a fortress at what is now Québec City.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Developments:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• French and Aboriginal people collaborated in the fur-trade economy</li>
                    <li>• Outstanding leaders like Jean Talon, Bishop Laval, and Count Frontenac</li>
                    <li>• French Empire reached from Hudson Bay to Gulf of Mexico</li>
                    <li>• Voyageurs and coureurs des bois formed alliances with First Nations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sword className="h-6 w-6 mr-2" />
                  The War of 1812
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Believing it would be easy to conquer Canada, the United States launched an invasion in June 1812. The
                  Americans were mistaken. Canadian volunteers and First Nations supported British soldiers in Canada's
                  defence.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Key Battles</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Major-General Sir Isaac Brock captured Detroit</li>
                      <li>• Battle of Queenston Heights</li>
                      <li>• Châteauguay - 460 soldiers turned back 4,000 Americans</li>
                      <li>• Americans burned York (Toronto)</li>
                      <li>• British burned White House in retaliation</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Heroes</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Chief Tecumseh (Shawnee leader)</li>
                      <li>• Laura Secord (warned of American attack)</li>
                      <li>• Charles de Salaberry (French Canadian)</li>
                      <li>• Major-General Robert Ross</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confederation (1867)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  From 1864 to 1867, representatives of Nova Scotia, New Brunswick and the Province of Canada worked
                  together to establish a new country. These men are known as the Fathers of Confederation.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">The Dominion of Canada</h4>
                  <p className="text-sm mb-2">
                    The British Parliament passed the British North America Act in 1867. The Dominion of Canada was
                    officially born on July 1, 1867.
                  </p>
                  <p className="text-sm">
                    <strong>Original Provinces:</strong> Ontario, Quebec, Nova Scotia, New Brunswick
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modern Canada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">World Wars</h4>
                    <ul className="text-sm space-y-1">
                      <li>• WWI: 600,000+ Canadians served</li>
                      <li>• Vimy Ridge (April 9, 1917)</li>
                      <li>• WWII: 1 million+ served</li>
                      <li>• D-Day: Canadians captured Juno Beach</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Social Progress</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Women's suffrage (1916-1940)</li>
                      <li>• Charter of Rights and Freedoms (1982)</li>
                      <li>• Multiculturalism policy</li>
                      <li>• Official Languages Act (1969)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-red-500 pl-3">
                    <strong>1497</strong> - John Cabot maps Atlantic shore
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <strong>1608</strong> - Champlain founds Quebec City
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <strong>1759</strong> - Battle of Plains of Abraham
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <strong>1812-1814</strong> - War of 1812
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <strong>1867</strong> - Confederation
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <strong>1885</strong> - CPR completed
                  </div>
                  <div className="border-l-4 border-gray-500 pl-3">
                    <strong>1917</strong> - Vimy Ridge
                  </div>
                  <div className="border-l-4 border-red-500 pl-3">
                    <strong>1944</strong> - D-Day
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <strong>1982</strong> - Charter of Rights
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
                  <li>• Remember the three founding peoples: Aboriginal, French, British</li>
                  <li>• Know key battles and their significance</li>
                  <li>• Understand the path to Confederation</li>
                  <li>• Learn about important historical figures</li>
                  <li>• Study the timeline of major events</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/rights-responsibilities" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Next: Rights & Responsibilities</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
