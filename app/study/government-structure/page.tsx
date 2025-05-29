import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building, Vote, Scale, Crown } from "lucide-react"

export default function GovernmentStructurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Government Structure</h1>
          <p className="text-xl text-gray-600">How Canadians govern themselves</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-6 w-6 mr-2" />
                  Three Key Facts About Canada's Government
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">Federal State</h4>
                    <p className="text-sm">Federal, provincial, territorial, and municipal governments</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">Parliamentary Democracy</h4>
                    <p className="text-sm">People elect representatives to make laws</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">Constitutional Monarchy</h4>
                    <p className="text-sm">Queen/King as Head of State</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Federal State - Division of Powers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Federal Government Responsibilities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• National Defence</li>
                      <li>• Foreign Policy</li>
                      <li>• Interprovincial Trade</li>
                      <li>• Currency</li>
                      <li>• Navigation</li>
                      <li>• Criminal Law</li>
                      <li>• Citizenship</li>
                      <li>• Immigration (shared)</li>
                      <li>• Agriculture (shared)</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Provincial Responsibilities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Municipal Government</li>
                      <li>• Education</li>
                      <li>• Health Care</li>
                      <li>• Natural Resources</li>
                      <li>• Property and Civil Rights</li>
                      <li>• Highways</li>
                      <li>• Immigration (shared)</li>
                      <li>• Agriculture (shared)</li>
                      <li>• Environment (shared)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parliamentary Democracy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  In Canada's parliamentary democracy, people elect members to the House of Commons and
                  provincial/territorial legislatures. These representatives pass laws, approve expenditures, and keep
                  government accountable.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Parliament has three parts:</h4>
                  <ul className="space-y-1">
                    <li>
                      • <strong>The Sovereign</strong> (Queen or King)
                    </li>
                    <li>
                      • <strong>The Senate</strong> (appointed until age 75)
                    </li>
                    <li>
                      • <strong>The House of Commons</strong> (elected by the people)
                    </li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How a Bill Becomes Law:</h4>
                  <ol className="space-y-1 text-sm">
                    <li>1. First Reading - Bill is printed</li>
                    <li>2. Second Reading - Debate on principle</li>
                    <li>3. Committee Stage - Study clause by clause</li>
                    <li>4. Report Stage - Make amendments</li>
                    <li>5. Third Reading - Final debate and vote</li>
                    <li>6. Senate - Similar process</li>
                    <li>7. Royal Assent - Governor General approves</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-6 w-6 mr-2" />
                  Constitutional Monarchy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Canada's Head of State is a hereditary Sovereign (Queen or King), who reigns according to the
                  Constitution. There is a clear distinction between the head of state and head of government.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Head of State</h4>
                    <p className="text-sm mb-2">
                      <strong>The Sovereign (Queen/King)</strong>
                    </p>
                    <p className="text-sm">• Symbol of Canadian sovereignty</p>
                    <p className="text-sm">• Guardian of constitutional freedoms</p>
                    <p className="text-sm">• Non-partisan role</p>
                    <p className="text-sm">• Represented by Governor General</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Head of Government</h4>
                    <p className="text-sm mb-2">
                      <strong>The Prime Minister</strong>
                    </p>
                    <p className="text-sm">• Actually directs governing</p>
                    <p className="text-sm">• Selects Cabinet ministers</p>
                    <p className="text-sm">• Responsible for operations and policy</p>
                    <p className="text-sm">• Must have confidence of House</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Vote className="h-6 w-6 mr-2" />
                  Federal Elections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Canadians vote for people to represent them in the House of Commons. Canada is divided into 308
                  electoral districts (ridings). The candidate with the most votes becomes the MP.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Voting Eligibility:</h4>
                  <ul className="space-y-1">
                    <li>• Canadian citizen</li>
                    <li>• At least 18 years old on voting day</li>
                    <li>• On the voters' list</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">After an Election:</h4>
                  <p className="text-sm">
                    The party with the most seats forms government. If they have at least half the seats, it's a{" "}
                    <strong>majority government</strong>. If less than half, it's a <strong>minority government</strong>
                    .
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Secret Ballot:</h4>
                  <p className="text-sm">
                    No one can watch you vote. No one has the right to insist you tell them how you voted, including
                    family, employers, or union representatives.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-6 w-6 mr-2" />
                  The Justice System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Canadian justice system guarantees everyone due process under the law. Our judicial system is
                  founded on the presumption of innocence - everyone is innocent until proven guilty.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Courts</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Supreme Court of Canada (highest)</li>
                      <li>• Federal Court of Canada</li>
                      <li>• Provincial appeal courts</li>
                      <li>• Provincial trial courts</li>
                      <li>• Family, traffic, small claims courts</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Police</h4>
                    <ul className="text-sm space-y-1">
                      <li>• RCMP (federal laws, most provinces)</li>
                      <li>• Provincial police (Ontario, Quebec)</li>
                      <li>• Municipal police departments</li>
                      <li>• Keep people safe and enforce law</li>
                      <li>• You can question police conduct</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Three Branches of Government</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Executive</h4>
                    <p className="text-sm">Prime Minister and Cabinet implement and enforce laws</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Legislative</h4>
                    <p className="text-sm">Parliament (House of Commons and Senate) makes laws</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Judicial</h4>
                    <p className="text-sm">Courts interpret laws and ensure justice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Government Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-red-500 pl-3">
                    <strong>Federal</strong>
                    <br />
                    MPs - National/international matters
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <strong>Provincial/Territorial</strong>
                    <br />
                    MLAs/MNAs/MPPs/MHAs - Regional matters
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <strong>Municipal</strong>
                    <br />
                    Mayor/Councillors - Local matters
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <strong>First Nations</strong>
                    <br />
                    Chiefs/Councillors - Reserve matters
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>MP:</strong> Member of Parliament
                  </div>
                  <div>
                    <strong>MLA:</strong> Member of Legislative Assembly
                  </div>
                  <div>
                    <strong>Riding:</strong> Electoral district
                  </div>
                  <div>
                    <strong>Cabinet:</strong> PM and ministers
                  </div>
                  <div>
                    <strong>Opposition:</strong> Parties not in power
                  </div>
                  <div>
                    <strong>Confidence:</strong> Support of majority
                  </div>
                  <div>
                    <strong>Royal Assent:</strong> Final approval of bills
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
                  <li>• Know the three key facts about government</li>
                  <li>• Understand division of powers</li>
                  <li>• Learn how bills become laws</li>
                  <li>• Know voting requirements</li>
                  <li>• Understand majority vs minority government</li>
                  <li>• Learn about the three branches</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/rights-responsibilities" className="flex-1">
                <Button variant="outline" className="w-full">
                  Previous: Rights
                </Button>
              </Link>
              <Link href="/study/geography" className="flex-1">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">Next: Geography</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
