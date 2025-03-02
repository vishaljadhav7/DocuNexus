"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const app_1 = require("./app");
const PORT = Number(process.env.PORT) || 5000;
app_1.app.listen(PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
});
