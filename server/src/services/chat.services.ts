import { aiModel } from "../utils/GeminiModel";

interface AIResponse {
    query: string;
    answer: string;
  }


  function parseJsonToObject(data: string): { query: string; answer: string } | null {
    try {
 
      const cleanedData = data.replace(/```json\n|```/g, '').trim();
  
   
      const parsed = JSON.parse(cleanedData);
  
  
      if (!parsed.query || !parsed.answer) {
        throw new Error("Missing query or answer fields");
      }
  
      return { query: parsed.query, answer: parsed.answer };
    } catch (error : any) {
      console.error("Error parsing JSON string:", error.message);
      return null;
    }
  }

export const analysisChatQueryWithAI = async (
    contractText: string,
    contractType: string,
    chatQuery: string
  ): Promise<AIResponse | null> => {
    try {
      if (!contractText || !contractType || !chatQuery) {
        throw new Error("Missing required parameters: contractText, contractType, or chatQuery");
      }
  
      const prompt = `
        You are an expert contract analyst tasked with answering a user's query about a ${contractType} contract. Your objective is to deliver a clear, concise, and accessible response by analyzing the provided contract text. Use the following inputs:
  
        1. **chatQuery**: ${chatQuery} (The user's specific question or request regarding the contract).
        2. **contractText**: ${contractText} (The full contract text, extracted from a PDF using pdfjs).
        3. **contractType**: ${contractType} (The contract type, e.g., employment, service, lease).
  
        ### Instructions:
        - Examine the **contractText** within the context of the **contractType** to directly address the **chatQuery**.
        - Provide a straightforward, user-friendly answer that directly responds to the query.
        - Extract and reference specific details (e.g., terms, clauses, or conditions) from the **contractText** if required by the query.
        - Keep the response accurate, relevant, and free of complex technical jargon.
        - Format the response as a JSON object with the following structure:
          {
            "query": "${chatQuery}",
            "answer": "A clear and concise response to the query, referencing the contract text as needed"
          }
  
        ### Important:
        - Output only the JSON object, without additional text, markdown, or formatting.
        - Ensure the **answer** is easy to understand for non-experts.
  
        Contract text:
        ${contractText}
      `;
  
      const results = await aiModel.generateContent(prompt);
      const text = results.response.text();
  
      if (!text) {
        throw new Error("No response received from AI model");
      }
  

      try {
        const resData = parseJsonToObject(text);
        return resData 
      } catch (parseError) {
        throw new Error("Invalid JSON response from AI model");
      }
    } catch (error: any) {
      console.error("Error in analysisChatQueryWithAI:", {
        message: error.message,
        stack: error.stack,
      });
      return null;
    }
  };