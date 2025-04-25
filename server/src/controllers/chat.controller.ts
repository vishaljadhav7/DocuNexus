import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { analysisChatQueryWithAI } from "../services/chat.services";
import { prisma } from "../utils/clients";
import { getReceiverSocketId, sendMessageToSocketId } from "../socket";

interface ChatQueryBody {
  chatQuery: string;
}

export const retrieveChatsForContracts = async (req : Request<{contractId : string}>, res : Response) => {
  try {
    const {contractId} = req.params;
    
    const contractExist = await prisma.contractReview.findFirst({
        where : {
            id : contractId
        }
    });

    if(!contractExist) {
        throw new Error("Chats does not exist for the contract!");
    }

   const chatsForContract = await prisma.chat.findMany({
    where : {
       contractId : contractId
    }
   });

   res.status(200).json( new ApiResponse(200, chatsForContract, "retrieved chats for contract") );
   
   return;

  } catch (error : any) {
      
   res.status(400).json(new ApiError(400, `Error: ${error.message}`)) 
  }
}

export const analyzeQueryForContract = async (
  req: Request<{contractId: string}, {}, ChatQueryBody>,
  res: Response
) : Promise<any>=> {
  try {
    const { contractId } = req.params;
    const { chatQuery } = req.body;

    // Validate input
    if (!contractId || !chatQuery) {
      return res.status(400).json({ error: "contractId and chatQuery are required" });
    }

    // Fetch contract from database
    const contract = await prisma.contractReview.findFirst({
      where: { id: contractId },
      select: { contractText: true, contractType: true },
    });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" }); 
    }

    const { contractText, contractType } = contract;

 
    const response = await analysisChatQueryWithAI(contractText, contractType, chatQuery);
    
    if (!response) {
      return res.status(500).json({ error: "Failed to generate AI response" });
    }

    const socketId = getReceiverSocketId(req.user?.id as string)
    if(socketId){
      sendMessageToSocketId(socketId, {eventName : "newMessage" , data : response});
    }
    


    const chatResponse = await prisma.chat.create({
      data : {
        userQuery : response.query,
        aiResponse : response.answer,
        contractId : contractId
      }
    })

    console.log("===>>> ", chatResponse)

   if(!chatResponse) {
    return res.status(500).json({ error: "Could not save the response!" });
   }

    return new ApiResponse(200, chatResponse, "Generated response for the query!")
  } catch (error: any) {
    console.error("Error in analyzeQueryForContract:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};