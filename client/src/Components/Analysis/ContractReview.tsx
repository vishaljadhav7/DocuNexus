"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Minus, MessageSquareText, FileText, AlertTriangle, Lightbulb, List, Clock, Scale } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useAppSelector } from "@/redux/store"
import OverallScoreChart from "./Chart"

export default function ContractReview() {
  const analysisResults = useAppSelector((store) => store.contract.analysisResults)
  const [activeTab, setActiveTab] = useState("summary")

  if (!analysisResults) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Contract Analysis</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a contract to see analysis results</p>
        </div>
      </div>
    )
  }

  const getScore = () => {
    const score = analysisResults.overallScore
    if (score > 70) return { icon: ArrowUp, color: "text-emerald-500", bgColor: "bg-emerald-50", text: "Good" }
    if (score < 50) return { icon: ArrowDown, color: "text-rose-500", bgColor: "bg-rose-50", text: "Risky" }
    return { icon: Minus, color: "text-amber-500", bgColor: "bg-amber-50", text: "Average" }
  }

  const scoreTrend = getScore()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "LOW":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "LOW":
        return "bg-teal-100 text-teal-800 border-teal-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const renderRisksAndOpportunities = (
    items: Array<{
      risk?: string
      opportunity?: string
      explanation?: string
      severity?: string
      impact?: string
      riskDetails?: string
      opportunityDetails?: string
    }>,
    type: "risks" | "opportunities",
  ) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            {type === "risks" ? (
              <AlertTriangle className="h-6 w-6 text-gray-400" />
            ) : (
              <Lightbulb className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900">No {type} identified</h3>
          <p className="mt-1 text-sm text-gray-500">
            {type === "risks"
              ? "No potential risks were found in this contract"
              : "No opportunities were identified in this contract"}
          </p>
        </div>
      )
    }

    return (
      <ul className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="font-semibold text-lg">{type === "risks" ? item.risk : item.opportunity}</span>
              {(item.severity || item.impact) && (
                <Badge
                  className={`px-3 py-1 border ${
                    type === "risks" ? getSeverityColor(item.severity!) : getImpactColor(item.impact!)
                  }`}
                >
                  {(item.severity || item.impact)?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-gray-600 leading-relaxed">
              {type === "risks" ? item.riskDetails : item.opportunityDetails}
            </p>
          </motion.li>
        ))}
      </ul>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-500 bg-clip-text text-transparent">
            Contract Review
          </h1>
          <p className="text-gray-500 mt-1">Analysis and insights for your contract</p>
        </div>
        <Button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <MessageSquareText className="h-4 w-4 mr-2" />
          ASK AI
        </Button>
      </div>

      <Card className="mb-8 overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="text-xl">Overall Contract Score</CardTitle>
          <CardDescription>Based on risks and opportunities identified</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`text-5xl font-bold ${scoreTrend.color}`}>{analysisResults.overallScore ?? 0}</div>
                <div className={`flex items-center ${scoreTrend.color} ${scoreTrend.bgColor} px-3 py-1 rounded-full`}>
                  <scoreTrend.icon className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{scoreTrend.text}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Risk</span>
                    <span className="text-rose-600 font-medium">{100 - analysisResults.overallScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{ width: `${100 - analysisResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Opportunities</span>
                    <span className="text-emerald-600 font-medium">{analysisResults.overallScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${analysisResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6 italic">
                This score represents the overall balance of risks and opportunities identified in the contract.
              </p>
            </div>

            <div className="w-full md:w-1/2 h-64 flex justify-center items-center">
              <div className="w-full h-full max-w-xs">
                <OverallScoreChart overallScore={analysisResults.overallScore} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100 rounded-lg">
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-md"
          >
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="risks"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-md"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-md"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-md"
          >
            <List className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-3">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-lg leading-relaxed text-gray-700">{analysisResults.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-4">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-rose-500" />
                Identified Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">{renderRisksAndOpportunities(analysisResults.risks, "risks")}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-4">
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                Identified Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderRisksAndOpportunities(analysisResults.opportunities, "opportunities")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-md h-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-4">
                <CardTitle className="flex items-center">
                  <List className="h-5 w-5 mr-2 text-indigo-600" />
                  Key Clauses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analysisResults.clauses && analysisResults.clauses.length > 0 ? (
                  <ul className="space-y-3">
                    {analysisResults.clauses?.map((keyClause, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="flex-shrink-0 mr-3 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <span className="text-gray-700">{keyClause}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <List className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No key clauses</h3>
                    <p className="mt-1 text-sm text-gray-500">No key clauses were identified in this contract</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-none shadow-md h-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-4">
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {analysisResults.recommendations?.map((recommendation, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="flex-shrink-0 mr-3 mt-1">
                          <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <span className="text-gray-700">{recommendation}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <Lightbulb className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No recommendations</h3>
                    <p className="mt-1 text-sm text-gray-500">No recommendations were provided for this contract</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="mb-8">
        <AccordionItem value="contract-details" className="border rounded-lg shadow-md overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium">Contract Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-gray-800">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Duration and Termination
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">{analysisResults.contractDuration}</p>
                  </div>
                  <div>
                    <strong className="block text-gray-800 mb-1">Termination Conditions</strong>
                    <p className="text-gray-700 leading-relaxed">{analysisResults.terminationConditions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-gray-800">
                  <Scale className="h-5 w-5 mr-2 text-purple-600" />
                  Legal Information
                </h3>
                <div>
                  <strong className="block text-gray-800 mb-1">Legal Compliance</strong>
                  <p className="text-gray-700 leading-relaxed">
                    {analysisResults.legalCompliance || "Legal Compliance Not Available for this contract"}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b py-4">
          <CardTitle className="flex items-center">
            <MessageSquareText className="h-5 w-5 mr-2 text-purple-600" />
            Negotiation Points
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {analysisResults.negotiationPoints && analysisResults.negotiationPoints.length > 0 ? (
            <ul className="grid md:grid-cols-2 gap-4">
              {analysisResults.negotiationPoints?.map((point, index) => (
                <motion.li
                  className="flex items-start bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100 shadow-sm"
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <span className="text-gray-700">{point}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <MessageSquareText className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No negotiation points</h3>
              <p className="mt-1 text-sm text-gray-500">No negotiation points were identified for this contract</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

