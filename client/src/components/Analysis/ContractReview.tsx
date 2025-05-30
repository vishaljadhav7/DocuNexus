"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, MessageSquareText, FileText, AlertTriangle, Lightbulb, List, Clock, Scale } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import OverallScoreChart from "./ViewChart";
import { Analysis } from "@/features/contracts/contractSlice";
import ChatModal from "../Modals/ChatModal";

export default function ContractReview({ analysisResults }: { analysisResults: Analysis | undefined }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [isOpen, setIsOpen]  = useState(false)

  if (!analysisResults) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96 rounded-lg border border-gray-200 bg-white shadow-sm mt-6 mx-4 sm:mx-0">
        <div className="text-center px-4">
          <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">No Contract Analysis</h3>
          <p className="mt-2 text-sm text-gray-500">Upload a contract to see analysis results</p>
        </div>
      </div>
    );
  }

  const getScore = () => {
    const score = analysisResults.overallScore;
    if (score > 70) return { icon: ArrowUp, color: "text-teal-500", bgColor: "bg-teal-50", text: "Good" };
    if (score < 50) return { icon: ArrowDown, color: "text-red-500", bgColor: "bg-red-50", text: "Risky" };
    return { icon: Minus, color: "text-amber-500", bgColor: "bg-amber-50", text: "Average" };
  };

  const scoreTrend = getScore();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-100 text-red-600 border-red-200 hover:bg-red-200";
      case "MEDIUM": return "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200";
      case "LOW": return "bg-teal-100 text-teal-600 border-teal-200 hover:bg-teal-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH": return "bg-teal-100 text-teal-600 border-teal-200 hover:bg-teal-200";
      case "MEDIUM": return "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200";
      case "LOW": return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
    }
  };

  const renderRisksAndOpportunities = (
    items: Array<{
      risk?: string;
      opportunity?: string;
      explanation?: string;
      severity?: string;
      impact?: string;
      riskDetails?: string;
      opportunityDetails?: string;
    }>,
    type: "risks" | "opportunities"
  ) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center px-4">
          <div className="rounded-full bg-gray-50 p-3 mb-4 shadow-sm">
            {type === "risks" ? (
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            ) : (
              <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">No {type} Identified</h3>
          <p className="mt-2 text-sm text-gray-500">
            {type === "risks" ? "No potential risks found" : "No opportunities identified"}
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-3 sm:space-y-4">
        {items.map((item, index) => (
          <motion.li
            className="border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all bg-white"
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 sm:gap-0">
              <span className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{type === "risks" ? item.risk : item.opportunity}</span>
              {(item.severity || item.impact) && (
                <Badge
                  className={`px-2 sm:px-3 py-1 text-xs font-medium border transition-colors self-start sm:self-auto ${type === "risks" ? getSeverityColor(item.severity!) : getImpactColor(item.impact!)}`}
                >
                  {(item.severity || item.impact)?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{type === "risks" ? item.riskDetails : item.opportunityDetails}</p>
          </motion.li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
      <ChatModal isOpen={isOpen} setIsOpen={setIsOpen} contractId={analysisResults?.id as string}/>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contract Review</h1>
          <p className="text-sm text-gray-500 mt-2">Detailed analysis and insights for your contract</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-md transition-all w-full sm:w-auto" 
          onClick={() => { setIsOpen(prev => !prev) }}
        >
          <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Ask AI
        </Button>
      </div>

      <Card className="mb-6 sm:mb-8 border border-gray-100 shadow-lg rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4 sm:py-5">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Overall Contract Score</CardTitle>
          <CardDescription className="text-gray-500 text-sm">Based on risks and opportunities</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="w-full lg:w-1/2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6 text-center sm:text-left">
                <div className={`text-4xl sm:text-5xl font-bold ${scoreTrend.color}`}>{analysisResults.overallScore ?? 0}</div>
                <div className={`flex items-center ${scoreTrend.color} ${scoreTrend.bgColor} px-3 py-1.5 rounded-full shadow-sm`}>
                  <scoreTrend.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm font-semibold">{scoreTrend.text}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Risk</span>
                    <span className="text-red-500 font-semibold">{100 - analysisResults.overallScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${100 - analysisResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Opportunities</span>
                    <span className="text-teal-500 font-semibold">{analysisResults.overallScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-5 italic text-center sm:text-left">Balance of risks and opportunities</p>
            </div>
            <div className="w-full lg:w-1/2 h-48 sm:h-64 flex justify-center items-center">
              <div className="w-full max-w-xs sm:max-w-sm">
                <OverallScoreChart overallScore={analysisResults.overallScore} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 sm:mb-8">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-max grid-cols-4 p-1.5 bg-gray-100 rounded-xl shadow-sm">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg py-2.5 px-3 font-medium transition-all whitespace-nowrap"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Summary</span>
            </TabsTrigger>
            <TabsTrigger
              value="risks"
              className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg py-2.5 px-3 font-medium transition-all whitespace-nowrap"
            >
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Risks</span>
            </TabsTrigger>
            <TabsTrigger
              value="opportunities"
              className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg py-2.5 px-3 font-medium transition-all whitespace-nowrap"
            >
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Opportunities</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg py-2.5 px-3 font-medium transition-all whitespace-nowrap"
            >
              <List className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Details</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="mt-4 sm:mt-6">
          <Card className="border border-gray-100 shadow-lg rounded-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4">
              <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-500" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-4 sm:mt-6">
          <Card className="border border-gray-100 shadow-lg rounded-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4">
              <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
                Identified Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">{renderRisksAndOpportunities(analysisResults.risks, "risks")}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-4 sm:mt-6">
          <Card className="border border-gray-100 shadow-lg rounded-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4">
              <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" />
                Identified Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRisksAndOpportunities(analysisResults.opportunities, "opportunities")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4 sm:mt-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card className="border border-gray-100 shadow-lg rounded-xl bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4">
                <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <List className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-500" />
                  Key Clauses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {analysisResults.clauses && analysisResults.clauses.length > 0 ? (
                  <ul className="space-y-3">
                    {analysisResults.clauses.map((keyClause, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
                      >
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs sm:text-sm font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{keyClause}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                    <div className="rounded-full bg-gray-50 p-3 mb-4 shadow-sm">
                      <List className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">No Key Clauses</h3>
                    <p className="mt-2 text-sm text-gray-500">No key clauses identified</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-lg rounded-xl bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4">
                <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors shadow-sm"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
                      >
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs sm:text-sm font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{recommendation}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                    <div className="rounded-full bg-gray-50 p-3 mb-4 shadow-sm">
                      <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">No Recommendations</h3>
                    <p className="mt-2 text-sm text-gray-500">No recommendations provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="mb-6 sm:mb-8">
        <AccordionItem value="contract-details" className="border border-gray-100 rounded-xl shadow-lg bg-white overflow-hidden">
          <AccordionTrigger className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Contract Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-500" />
                  Duration and Termination
                </h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{analysisResults.contractDuration}</p>
                  <div>
                    <strong className="block text-gray-900 text-xs sm:text-sm mb-1.5 font-semibold">Termination Conditions</strong>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{analysisResults.terminationConditions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                  <Scale className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-500" />
                  Legal Information
                </h3>
                <div>
                  <strong className="block text-gray-900 text-xs sm:text-sm mb-1.5 font-semibold">Legal Compliance</strong>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {analysisResults.legalCompliance || "Not Available"}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border border-gray-100 shadow-lg rounded-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 py-4">
          <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
            <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-500" />
            Negotiation Points
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {analysisResults.negotiationPoints && analysisResults.negotiationPoints.length > 0 ? (
            <ul className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {analysisResults.negotiationPoints.map((point, index) => (
                <motion.li
                  className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-100 transition-colors"
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
                >
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs sm:text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <div className="rounded-full bg-gray-50 p-3 mb-4 shadow-sm">
                <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">No Negotiation Points</h3>
              <p className="mt-2 text-sm text-gray-500">No negotiation points identified</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}