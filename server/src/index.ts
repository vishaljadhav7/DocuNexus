import { configDotenv } from "dotenv";
import http from 'http'

configDotenv();

import { app } from "./app";
import { createSocketConnection } from "./socket";


const httpServer = http.createServer(app);

createSocketConnection(httpServer);

const PORT = Number(process.env.PORT) || 5000;


httpServer.listen(PORT , () => {
    console.log(`listening on port ${process.env.PORT}`)
});
