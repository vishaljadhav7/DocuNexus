import { Request, Response, NextFunction } from "express";
import ApiResponse from "../utils/apiResponse.utils";
import { ChatService } from "../services/chat.service";

interface ChatQueryBody {
  chatQuery: string;
}

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

   retrieveChatsForContracts = async (
    req: Request<{contractId: string}>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const { contractId } = req.params;
       
      const chatsForContract = await this.chatService.getChatsForContract(contractId);
      
      res.status(200).json(
        new ApiResponse(200, chatsForContract, "Retrieved chats for contract")
      );
    } catch (error) {
      next(error);
    }
  };

   analyzeQueryForContract = async (
    req: Request<{contractId: string}, {}, ChatQueryBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { contractId } = req.params;
      const { chatQuery } = req.body;

      const chatResponse = await this.chatService.analyzeContractQuery(contractId, chatQuery);
      
      res.status(200).json(
        new ApiResponse(200, chatResponse, "Generated response for the query!")
      );
    } catch (error) {
      next(error);
    }
  };
}