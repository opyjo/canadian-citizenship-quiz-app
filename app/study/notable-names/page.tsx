import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Crown,
  Lightbulb,
  Palette,
  Trophy,
  Sword,
} from "lucide-react";

export default function NotableNamesPage() {
  const historicalFigures = [
    {
      name: "John Cabot",
      description:
        "Italian immigrant to England, first to map Canada's Atlantic shore (1497)",
      significance:
        "Set foot on Newfoundland, claimed New Founde Land for England",
    },
    {
      name: "Jacques Cartier",
      description: "French explorer who made three voyages (1534-1542)",
      significance:
        "First European to explore St. Lawrence River, heard word 'kanata'",
    },
    {
      name: "Samuel de Champlain",
      description: "French explorer and founder of Quebec City (1608)",
      significance:
        "Built fortress at Quebec City, allied with Algonquin and Huron",
    },
    {
      name: "Count Frontenac",
      description: "Governor of New France, defender of Quebec",
      significance: "Refused to surrender Quebec to English in 1690",
    },
    {
      name: "Sir Isaac Brock",
      description: "Major-General who captured Detroit in War of 1812",
      significance: "Killed defending Queenston Heights, Canadian war hero",
    },
    {
      name: "Chief Tecumseh",
      description: "Shawnee leader who supported British in War of 1812",
      significance:
        "Led First Nations in Canada's defence against American invasion",
    },
    {
      name: "Laura Secord",
      description:
        "Pioneer wife and mother who warned of American attack (1813)",
      significance:
        "Made dangerous 19-mile journey to warn Lieutenant FitzGibbon",
    },
    {
      name: "Louis Riel",
      description: "Métis leader who led armed uprisings (1869, 1885)",
      significance:
        "Defender of Métis rights, father of Manitoba, executed for treason",
    },
    {
      name: "Sir John A. Macdonald",
      description: "Canada's first Prime Minister (1867-1873, 1878-1891)",
      significance:
        "Father of Confederation, portrait on $10 bill, January 11 is his day",
    },
    {
      name: "Sir George-Étienne Cartier",
      description: "Key architect of Confederation from Quebec",
      significance:
        "Led Quebec into Confederation, helped negotiate western expansion",
    },
  ];

  const politicalLeaders = [
    {
      name: "Sir Louis-Hippolyte La Fontaine",
      description: "Champion of French language rights and democracy",
      significance: "First head of responsible government in Canada (1849)",
    },
    {
      name: "Robert Baldwin",
      description: "Reformer who worked toward responsible government",
      significance:
        "Worked with La Fontaine to establish responsible government",
    },
    {
      name: "Joseph Howe",
      description: "Nova Scotia reformer and journalist",
      significance: "Worked toward responsible government in Nova Scotia",
    },
    {
      name: "Sir Wilfrid Laurier",
      description: "7th Prime Minister (1896-1911), first French-Canadian PM",
      significance: "Encouraged western immigration, portrait on $5 bill",
    },
    {
      name: "John Diefenbaker",
      description: "13th Prime Minister (1957-1963)",
      significance: "Famous quote about Canadian freedom and heritage",
    },
    {
      name: "Sir Robert Borden",
      description: "Prime Minister during WWI",
      significance: "Gave women the right to vote in federal elections (1917)",
    },
  ];

  const militaryHeroes = [
    {
      name: "Sir Arthur Currie",
      description: "Canada's greatest soldier, led Canadian Corps in WWI",
      significance: "Commanded in last hundred days, Battle of Amiens",
    },
    {
      name: "Sir Sam Steele",
      description: "Great frontier hero, Mounted Policeman",
      significance: "Colourful hero from ranks of the Mounties",
    },
    {
      name: "Lieutenant Colonel John Graves Simcoe",
      description: "Upper Canada's first Lieutenant Governor",
      significance: "Founded Toronto, first to move toward abolishing slavery",
    },
    {
      name: "Alexander Roberts Dunn",
      description: "Born in Toronto, served in British Army",
      significance: "First Canadian awarded Victoria Cross (Crimean War, 1854)",
    },
    {
      name: "William Hall",
      description: "Able Seaman from Nova Scotia",
      significance: "First black man awarded Victoria Cross (1857)",
    },
    {
      name: "Billy Bishop",
      description: "Flying ace from Owen Sound, Ontario",
      significance: "Earned Victoria Cross in WWI, later Air Marshal",
    },
    {
      name: "Paul Triquet",
      description: "Captain from Quebec",
      significance: "Earned Victoria Cross at Casa Berardi, Italy (1943)",
    },
  ];

  const inventorsScientists = [
    {
      name: "Alexander Graham Bell",
      description: "Inventor of the telephone",
      significance: "Hit on idea of telephone at his summer house in Canada",
    },
    {
      name: "Sir Frederick Banting & Charles Best",
      description: "Medical researchers from Toronto",
      significance: "Discovered insulin, saved 16 million lives worldwide",
    },
    {
      name: "Joseph-Armand Bombardier",
      description: "Quebec inventor",
      significance: "Invented the snowmobile, light-weight winter vehicle",
    },
    {
      name: "Sir Sandford Fleming",
      description: "Engineer and inventor",
      significance: "Invented worldwide system of standard time zones",
    },
    {
      name: "Matthew Evans & Henry Woodward",
      description: "Canadian inventors",
      significance: "Invented first electric light bulb, sold patent to Edison",
    },
    {
      name: "Reginald Fessenden",
      description: "Radio pioneer",
      significance: "Sent first wireless voice message in the world",
    },
    {
      name: "Dr. Wilder Penfield",
      description: "Brain surgeon at McGill University",
      significance: "Known as 'the greatest living Canadian'",
    },
    {
      name: "Dr. John A. Hopps",
      description: "Medical inventor",
      significance: "Invented first cardiac pacemaker",
    },
    {
      name: "Mike Lazaridis & Jim Balsillie",
      description: "Co-founders of Research in Motion (RIM)",
      significance: "Invented the BlackBerry wireless device",
    },
  ];

  const artistsCultural = [
    {
      name: "Group of Seven",
      description: "Founded 1920, developed Canadian painting style",
      significance: "Captured rugged wilderness landscapes",
    },
    {
      name: "Emily Carr",
      description: "West Coast painter",
      significance: "Painted forests and Aboriginal artifacts",
    },
    {
      name: "Jean-Paul Riopelle",
      description: "Quebec abstract artist",
      significance: "Pioneer of modern abstract art in 1950s",
    },
    {
      name: "Tom Thomson",
      description: "Painter, precursor to Group of Seven",
      significance: "Famous for 'The Jack Pine' painting",
    },
    {
      name: "Kenojuak Ashevak",
      description: "Inuit artist",
      significance: "Pioneered modern Inuit art with etchings and sculptures",
    },
    {
      name: "Louis-Philippe Hébert",
      description: "Quebec sculptor",
      significance: "Celebrated sculptor of historical figures",
    },
    {
      name: "Stephen Leacock",
      description: "Humorist and writer",
      significance: "Significant contribution to Canadian literature",
    },
    {
      name: "Robertson Davies",
      description: "Novelist and playwright",
      significance: "Major figure in Canadian literature",
    },
    {
      name: "Margaret Laurence",
      description: "Novelist",
      significance: "Important Canadian writer",
    },
    {
      name: "Mordecai Richler",
      description: "Novelist",
      significance: "Significant Canadian literary figure",
    },
  ];

  const athletes = [
    {
      name: "Terry Fox",
      description: "British Columbian who lost leg to cancer at 18",
      significance: "Marathon of Hope cross-country run for cancer research",
    },
    {
      name: "Rick Hansen",
      description: "British Columbian wheelchair athlete",
      significance:
        "Circled globe in wheelchair (1985) for spinal cord research",
    },
    {
      name: "Wayne Gretzky",
      description: "Hockey player, Edmonton Oilers (1979-1988)",
      significance: "One of greatest hockey players of all time",
    },
    {
      name: "Donovan Bailey",
      description: "Sprinter",
      significance:
        "World record sprinter, double Olympic gold medallist (1996)",
    },
    {
      name: "Chantal Petitclerc",
      description: "Wheelchair racer",
      significance:
        "World champion wheelchair racer, Paralympic gold medallist",
    },
    {
      name: "Mark Tewksbury",
      description: "Swimmer",
      significance: "Olympic gold medallist, prominent LGBTQ+ activist",
    },
    {
      name: "Paul Henderson",
      description: "Hockey player",
      significance: "Scored winning goal in 1972 Canada-Soviet Summit Series",
    },
    {
      name: "Catriona Le May Doan",
      description: "Speed skater",
      significance: "Gold medallist at 2002 Olympic Winter Games",
    },
    {
      name: "Phil Edwards",
      description: "Track and field champion",
      significance: "Won bronze medals in 1928, 1932, 1936 Olympics",
    },
    {
      name: "James Naismith",
      description: "Canadian physical educator",
      significance: "Invented basketball in 1891",
    },
  ];

  const governorsGeneral = [
    {
      name: "John Buchan (1st Baron Tweedsmuir)",
      description: "Governor General (1935-1940)",
      significance: "Promoted unity in diversity, popular Governor General",
    },
    {
      name: "Vincent Massey",
      description: "18th Governor General",
      significance: "First Canadian-born Governor General",
    },
    {
      name: "Roland Michener",
      description: "20th Governor General",
      significance: "Presented Order of Canada to Oscar Peterson",
    },
    {
      name: "Adrienne Clarkson",
      description: "26th Governor General",
      significance: "First of Asian origin, established Clarkson Cup",
    },
    {
      name: "David Johnston",
      description: "28th Governor General",
      significance: "Governor General since Confederation",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/study-guide">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Notable Names
          </h1>
          <p className="text-xl text-gray-600">
            Important Canadians you should know for the citizenship test
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Historical Figures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalFigures.map((person, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-blue-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-6 w-6 mr-2" />
                  Political Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {politicalLeaders.map((person, index) => (
                    <div key={index} className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-purple-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sword className="h-6 w-6 mr-2" />
                  Military Heroes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {militaryHeroes.map((person, index) => (
                    <div key={index} className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-red-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-6 w-6 mr-2" />
                  Inventors & Scientists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventorsScientists.map((person, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-green-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-6 w-6 mr-2" />
                  Artists & Cultural Figures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artistsCultural.map((person, index) => (
                    <div key={index} className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-orange-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-6 w-6 mr-2" />
                  Athletes & Sports Figures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {athletes.map((person, index) => (
                    <div key={index} className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-yellow-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governors General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {governorsGeneral.map((person, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg">{person.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {person.description}
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        {person.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>Focus on Key Facts:</strong> Remember what each
                    person is famous for and when they lived.
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>Group by Category:</strong> Study similar figures
                    together (explorers, Prime Ministers, etc.).
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>Connect to Events:</strong> Link people to major
                    historical events and dates.
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <strong>Remember Firsts:</strong> Many are notable for being
                    "first" to do something.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>First PM:</strong> Sir John A. Macdonald
                  </div>
                  <div>
                    <strong>First French-Canadian PM:</strong> Sir Wilfrid
                    Laurier
                  </div>
                  <div>
                    <strong>First to map Atlantic:</strong> John Cabot
                  </div>
                  <div>
                    <strong>Founded Quebec:</strong> Samuel de Champlain
                  </div>
                  <div>
                    <strong>Discovered insulin:</strong> Banting & Best
                  </div>
                  <div>
                    <strong>Invented telephone:</strong> Alexander Graham Bell
                  </div>
                  <div>
                    <strong>Marathon of Hope:</strong> Terry Fox
                  </div>
                  <div>
                    <strong>Hockey great:</strong> Wayne Gretzky
                  </div>
                  <div>
                    <strong>War of 1812 hero:</strong> Sir Isaac Brock
                  </div>
                  <div>
                    <strong>Métis leader:</strong> Louis Riel
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Know why each person is significant</li>
                  <li>• Remember key dates and events</li>
                  <li>• Understand their contribution to Canada</li>
                  <li>• Connect names to specific achievements</li>
                  <li>• Study both English and French-Canadian figures</li>
                  <li>• Remember military heroes and their battles</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/symbols" className="flex-1">
                <Button variant="outline" className="w-full">
                  Previous: Symbols
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
