import { ChatRepository } from "../repository/chat.repository";
import { ContractRepository } from "../repository/contract.repository";
import { NotFoundError, InternalServerError, BadRequestError } from "../utils/error.utils";
import { analyzeContractQuery } from "../utils/chat.utils";


export class ChatService {
  private chatRepository: ChatRepository;
  private contractRepository: ContractRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
    this.contractRepository = new ContractRepository();
  }

  async getChatsForContract(contractId: string) {
    try {
      // Verify contract exists
      const contractExists = await this.contractRepository.findByIdWithRelations(contractId);
      if (!contractExists) {
        throw new NotFoundError("Contract not found");
      }

      // Get chats for the contract
      const chats = await this.chatRepository.findByContractId(contractId);
      return chats;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Failed to retrieve chats for contract");
    }
  }

  async analyzeContractQuery(contractId: string, chatQuery: string) {
    try {
      if (!contractId || !chatQuery?.trim()) {
        throw new BadRequestError("Contract ID and chat query are required");
      }

      const contract = await this.contractRepository.findByIdWithRelations(contractId);
      if (!contract) {
        throw new NotFoundError("Contract not found");
      }

      const aiResponse = await analyzeContractQuery(
        contract.contractText,
        contract.contractType,
        chatQuery.trim()
      );

      if (!aiResponse) {
        throw new InternalServerError("Failed to generate AI response");
      }

  
      const chatResponse = await this.chatRepository.create({
        userQuery: aiResponse.query,
        aiResponse: aiResponse.answer,
        contractId: contractId
      });

      return chatResponse;
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Failed to analyze contract query");
    }
  }
}
