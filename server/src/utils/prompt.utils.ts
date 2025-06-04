export const promptForContractRecognition = (contractText: string) => {
  const prompt = `
    Analyze the following contract text and determine the type of contract it is.
    Provide only the contract type as a single string (e.g., "Employment", "Non-Disclosure Agreement", "Sales", "Lease", etc.).
    Do not include any additional explanation or text.

    Contract text:
    ${contractText.substring(0, 2000)} `;

  return prompt;
};

export const promptForReviewingContract = (
  contractType: string,
  contractText: string
) => {
  let prompt = `
 Analyze the following ${contractType} contract and provide:
1. A list of at least 10 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
2. A list of at least 10 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
3. A comprehensive summary of the contract, including key terms and conditions, and a summary of any specific clauses relevant to this type of contract.
4. Any recommendations for improving the contract from the receiving party's perspective.
5. A list of key clauses in the contract.
6. An assessment of the contract's legal compliance.
7. A list of potential negotiation points.
8. The contract duration or term, if applicable.
9. A summary of termination conditions, if applicable.
10. A breakdown of any general financial terms, if applicable.
11. A breakdown of the compensation structure, including base salary, bonuses, equity, and other benefits, if applicable.
12. Any performance metrics or KPIs mentioned, if applicable.
13. An overall score from 1 to 100, with 100 being the highest. This score represents the overall favorability of the contract based on the identified risks and opportunities.

Format your response as a JSON object with the following structure:
{
"risks": [{"risk": "Risk description", "riskDetails": "Brief explanation", "severity": "LOW" | "MEDIUM" | "HIGH"}],
"opportunities": [{"opportunity": "Opportunity description", "opportunityDetails": "Brief explanation", "impact": "LOW" | "MEDIUM" | "HIGH"}],
"summary": "Comprehensive summary of the contract",
"recommendations": ["Recommendation 1", "Recommendation 2", ...],
"clauses": ["Clause 1", "Clause 2", ...],
"legalCompliance": "Assessment of legal compliance",
"negotiationPoints": ["Point 1", "Point 2", ...],
"contractDuration": "Duration of the contract, if applicable",
"terminationConditions": "Summary of termination conditions, if applicable",
"overallScore": 65,
"contractFinancialTerms": {
"description": "Overview of general financial terms",
"details": ["Detail 1", "Detail 2", ...]
},
"compensationStructure": {
"baseSalary": "value or null",
"bonuses": "value or null",
"equity": "value or null",
"otherBenefits": "value or null"
},
"performanceMetrics": ["Metric 1", "Metric 2", ...]
}
  `;

  prompt += `
Important: Provide only the JSON object in your response, without any additional text or formatting.
Contract text:
  ${contractText}
  `;

  return prompt;
};
