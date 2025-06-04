import { prisma } from "../utils/clients.utils";
import { InternalServerError } from "../utils/error.utils";

export class ChatRepository {
  async findByContractId(contractId: string) {
    try {
      return await prisma.chat.findMany({
        where: {
          contractId: contractId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error("Database error in ChatRepository.findByContractId:", error);
      throw new InternalServerError("Failed to retrieve chats from database");
    }
  }

  async create(data: {
    userQuery: string;
    aiResponse: string;
    contractId: string;
  }) {
    try {
      return await prisma.chat.create({
        data: data
      });
    } catch (error) {
      console.error("Database error in ChatRepository.create:", error);
      throw new InternalServerError("Failed to save chat to database");
    }
  }
}