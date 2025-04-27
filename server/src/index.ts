import { configDotenv } from "dotenv";
configDotenv();

import { app } from "./app";


const PORT = Number(process.env.PORT) || 5000;


app.listen(PORT , () => {
    console.log(`listening on port ${process.env.PORT}`)
});
