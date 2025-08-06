import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Users, Scale, Heart } from "lucide-react";

export default function RightsResponsibilitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/study-guide">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Guide
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rights and Responsibilities
          </h1>
          <p className="text-xl text-gray-600">
            Understanding Canadian citizenship
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2" />
                  Canadian Rights and Freedoms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Canadian law has several sources, including laws passed by
                  Parliament and provincial legislatures, English common law,
                  the civil code of France, and the unwritten constitution
                  inherited from Great Britain.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Fundamental Freedoms (800-year tradition from Magna Carta
                    1215):
                  </h4>
                  <ul className="space-y-1">
                    <li>• Freedom of conscience and religion</li>
                    <li>
                      • Freedom of thought, belief, opinion and expression
                    </li>
                    <li>• Freedom of peaceful assembly</li>
                    <li>• Freedom of association</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Charter of Rights and Freedoms (1982)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="italic">
                  "Whereas Canada is founded upon principles that recognize the
                  supremacy of God and the rule of law."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Mobility Rights</h4>
                    <p className="text-sm">
                      Canadians can live and work anywhere in Canada, enter and
                      leave freely, and apply for a passport.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">
                      Aboriginal Peoples' Rights
                    </h4>
                    <p className="text-sm">
                      Rights guaranteed in the Charter will not adversely affect
                      treaty or other Aboriginal rights.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Official Language Rights</h4>
                    <p className="text-sm">
                      French and English have equal status in Parliament and
                      throughout government.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Multiculturalism</h4>
                    <p className="text-sm">
                      A fundamental characteristic of Canadian heritage and
                      identity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-6 w-6 mr-2" />
                  Equality of Women and Men
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  In Canada, men and women are equal under the law. Canada's
                  openness and generosity do not extend to barbaric cultural
                  practices that tolerate:
                </p>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <ul className="space-y-1 text-sm">
                    <li>• Spousal abuse</li>
                    <li>• "Honour killings"</li>
                    <li>• Female genital mutilation</li>
                    <li>• Forced marriage</li>
                    <li>• Other gender-based violence</li>
                  </ul>
                  <p className="text-sm mt-2 font-semibold">
                    Those guilty of these crimes are severely punished under
                    Canada's criminal laws.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Citizenship Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>In Canada, rights come with responsibilities:</p>
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Obeying the Law</h4>
                    <p className="text-sm">
                      One of Canada's founding principles is the rule of law. No
                      person or group is above the law.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Taking Responsibility</h4>
                    <p className="text-sm">
                      Getting a job, taking care of family, and working hard are
                      important Canadian values.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Serving on a Jury</h4>
                    <p className="text-sm">
                      When called, you are legally required to serve. This makes
                      the justice system work.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Voting in Elections</h4>
                    <p className="text-sm">
                      The right to vote comes with responsibility to vote in
                      federal, provincial, and local elections.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Helping Others</h4>
                    <p className="text-sm">
                      Millions volunteer freely - helping people in need,
                      schools, food banks, and newcomers.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Protecting Heritage</h4>
                    <p className="text-sm">
                      Every citizen has a role in avoiding waste and protecting
                      Canada's natural and cultural heritage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Who We Are</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  To understand what it means to be Canadian, it is important to
                  know about our three founding peoples: Aboriginal, French, and
                  British.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Aboriginal Peoples</h4>
                    <p className="text-sm">
                      First Nations, Inuit, and Métis - the original inhabitants
                      with diverse cultures rooted in spiritual beliefs.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">French</h4>
                    <p className="text-sm">
                      7 million Francophones, mostly in Quebec. Acadians are
                      descendants of French colonists from 1604.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold">British</h4>
                    <p className="text-sm">
                      18 million Anglophones. English, Welsh, Scottish, and
                      Irish settlers established the basic way of life.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-6 w-6 mr-2" />
                  Diversity in Canada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Canada is often referred to as a land of immigrants. Over the
                  past 200 years, millions of newcomers have helped build and
                  defend our way of life.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Largest Groups:</h4>
                  <p className="text-sm">
                    English, French, Scottish, Irish, German, Italian, Chinese,
                    Aboriginal, Ukrainian, Dutch, South Asian, and Scandinavian.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Religious Diversity:</h4>
                  <p className="text-sm">
                    Majority identify as Christians (Catholic largest, followed
                    by Protestant churches). Growing numbers of Muslims, Jews,
                    Hindus, Sikhs, and others.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">LGBTQ+ Rights:</h4>
                  <p className="text-sm">
                    Gay and lesbian Canadians enjoy full protection and equal
                    treatment under the law, including access to civil marriage.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <strong>Rule of Law</strong> - No one is above the law
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <strong>Habeas Corpus</strong> - Right to challenge unlawful
                    detention
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <strong>Due Process</strong> - Government must respect legal
                    rights
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <strong>Presumption of Innocence</strong> - Innocent until
                    proven guilty
                  </div>
                  <div className="border-l-4 border-red-500 pl-3">
                    <strong>Multiculturalism</strong> - Celebrating diversity in
                    unity
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
                  <li>• Know the four fundamental freedoms</li>
                  <li>
                    • Understand Charter rights (mobility, language, etc.)
                  </li>
                  <li>• Remember the six citizenship responsibilities</li>
                  <li>• Learn about the three founding peoples</li>
                  <li>• Understand equality principles</li>
                  <li>• Know about Canadian diversity</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Link href="/study/canadian-history" className="flex-1">
                <Button variant="outline" className="w-full">
                  Previous: History
                </Button>
              </Link>
              <Link href="/study/government-structure" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Next: Government
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
