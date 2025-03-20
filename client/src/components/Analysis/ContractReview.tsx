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

export default function ContractReview({ analysisResults }: { analysisResults: Analysis | undefined }) {
  const [activeTab, setActiveTab] = useState("summary");

  if (!analysisResults) {
    return (
      <div className="flex items-center justify-center h-96  rounded-md border border-gray-200 mt-6">
        <div className="text-center">
          <FileText className="h-10 w-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800">No Contract Analysis</h3>
          <p className="mt-1 text-sm text-gray-600">Upload a contract to see analysis results</p>
        </div>
      </div>
    );
  }

  const getScore = () => {
    const score = analysisResults.overallScore;
    if (score > 70) return { icon: ArrowUp, color: "text-teal-600", bgColor: "bg-teal-50", text: "Good" };
    if (score < 50) return { icon: ArrowDown, color: "text-red-600", bgColor: "bg-red-50", text: "Risky" };
    return { icon: Minus, color: "text-amber-600", bgColor: "bg-amber-50", text: "Average" };
  };

  const scoreTrend = getScore();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-100 text-red-600 border-red-200";
      case "MEDIUM": return "bg-amber-100 text-amber-600 border-amber-200";
      case "LOW": return "bg-teal-100 text-teal-600 border-teal-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH": return "bg-teal-100 text-teal-600 border-teal-200";
      case "MEDIUM": return "bg-amber-100 text-amber-600 border-amber-200";
      case "LOW": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
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
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-gray-100 p-2 mb-3">
            {type === "risks" ? (
              <AlertTriangle className="h-5 w-5 text-gray-500" />
            ) : (
              <Lightbulb className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-800">No {type} identified</h3>
          <p className="mt-1 text-sm text-gray-600">
            {type === "risks" ? "No potential risks found" : "No opportunities identified"}
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <motion.li
            className="border border-gray-200 rounded-md p-4 shadow-sm hover:bg-gray-50 transition-colors"
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-800">{type === "risks" ? item.risk : item.opportunity}</span>
              {(item.severity || item.impact) && (
                <Badge
                  className={`px-2 py-0.5 border ${type === "risks" ? getSeverityColor(item.severity!) : getImpactColor(item.impact!)}`}
                >
                  {(item.severity || item.impact)?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{type === "risks" ? item.riskDetails : item.opportunityDetails}</p>
          </motion.li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl ">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Contract Review</h1>
          <p className="text-sm text-gray-600 mt-1">Analysis and insights for your contract</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <MessageSquareText className="h-4 w-4 mr-2" />
          Ask AI
        </Button>
      </div>

      <Card className="mb-6 border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
          <CardTitle className="text-lg text-gray-800">Overall Contract Score</CardTitle>
          <CardDescription className="text-gray-600 text-sm">Based on risks and opportunities</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`text-4xl font-semibold ${scoreTrend.color}`}>{analysisResults.overallScore ?? 0}</div>
                <div className={`flex items-center ${scoreTrend.color} ${scoreTrend.bgColor} px-2 py-1 rounded-md`}>
                  <scoreTrend.icon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{scoreTrend.text}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Risk</span>
                    <span className="text-red-600">{100 - analysisResults.overallScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${100 - analysisResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Opportunities</span>
                    <span className="text-teal-600">{analysisResults.overallScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-teal-600 h-1.5 rounded-full"
                      style={{ width: `${analysisResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4 italic">Balance of risks and opportunities</p>
            </div>
            <div className="w-full md:w-1/2 h-56 flex justify-center items-center">
              <div className="w-full max-w-xs">
                <OverallScoreChart overallScore={analysisResults.overallScore} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-200 rounded-md">
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-gray-50 data-[state=active]:text-teal-600 data-[state=active]:shadow-sm rounded-md"
          >
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="risks"
            className="data-[state=active]:bg-gray-50 data-[state=active]:text-teal-600 data-[state=active]:shadow-sm rounded-md"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="data-[state=active]:bg-gray-50 data-[state=active]:text-teal-600 data-[state=active]:shadow-sm rounded-md"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-gray-50 data-[state=active]:text-teal-600 data-[state=active]:shadow-sm rounded-md"
          >
            <List className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <FileText className="h-4 w-4 mr-2 text-teal-600" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-sm text-gray-700">{analysisResults.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                Identified Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">{renderRisksAndOpportunities(analysisResults.risks, "risks")}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />
                Identified Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {renderRisksAndOpportunities(analysisResults.opportunities, "opportunities")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <List className="h-4 w-4 mr-2 text-teal-600" />
                  Key Clauses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {analysisResults.clauses && analysisResults.clauses.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResults.clauses.map((keyClause, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <div className="flex-shrink-0 mr-2 mt-0.5">
                          <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{keyClause}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="rounded-full bg-gray-100 p-2 mb-3">
                      <List className="h-5 w-5 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No key clauses</h3>
                    <p className="mt-1 text-sm text-gray-600">No key clauses identified</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start p-2 rounded-md bg-amber-50 hover:bg-amber-100 transition-colors"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <div className="flex-shrink-0 mr-2 mt-0.5">
                          <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="rounded-full bg-gray-100 p-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No recommendations</h3>
                    <p className="mt-1 text-sm text-gray-600">No recommendations provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="contract-details" className="border border-gray-200 rounded-md shadow-sm">
          <AccordionTrigger className="px-5 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-600" />
              <span className="font-medium text-gray-800">Contract Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-4 bg-gray-50">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-teal-600" />
                  Duration and Termination
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">{analysisResults.contractDuration}</p>
                  <div>
                    <strong className="block text-gray-800 text-sm mb-1">Termination Conditions</strong>
                    <p className="text-sm text-gray-700">{analysisResults.terminationConditions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Scale className="h-4 w-4 mr-2 text-teal-600" />
                  Legal Information
                </h3>
                <div>
                  <strong className="block text-gray-800 text-sm mb-1">Legal Compliance</strong>
                  <p className="text-sm text-gray-700">
                    {analysisResults.legalCompliance || "Not Available"}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
          <CardTitle className="flex items-center text-lg text-gray-800">
            <MessageSquareText className="h-4 w-4 mr-2 text-teal-600" />
            Negotiation Points
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {analysisResults.negotiationPoints && analysisResults.negotiationPoints.length > 0 ? (
            <ul className="grid md:grid-cols-2 gap-3">
              {analysisResults.negotiationPoints.map((point, index) => (
                <motion.li
                  className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-100"
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">{point}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-gray-100 p-2 mb-3">
                <MessageSquareText className="h-5 w-5 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">No negotiation points</h3>
              <p className="mt-1 text-sm text-gray-600">No negotiation points identified</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}