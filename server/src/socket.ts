import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

interface ConnectedUsers {
  [userId: string]: string; 
}

interface MessageObject {
  eventName: string;
  data: any; 
}

interface JoinData {
  userId: string;
}

// Global variables
let io: SocketIOServer | undefined;
let connectedUsers: ConnectedUsers = {};

function createSocketConnection(server: HttpServer): void {
  io = new SocketIOServer(server, {
    cors: {
      origin: ['https://docu-nexus.vercel.app', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join', (data: JoinData) => {
      console.log("data: JoinData => ", data)
      connectedUsers[data.userId] = socket.id;
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
  
      for (const [userId, socketId] of Object.entries(connectedUsers)) {
        if (socketId === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });
}

const getReceiverSocketId = (receiverId: string): string | undefined => {
  return connectedUsers[receiverId];
};

const sendMessageToSocketId = (socketId: string, messageObject: MessageObject): void => {
  if (io) {
    io.to(socketId).emit(messageObject.eventName, messageObject.data);
  } else {
    console.log('Socket.io not initialized.');
  }
};

export { createSocketConnection, sendMessageToSocketId, getReceiverSocketId };