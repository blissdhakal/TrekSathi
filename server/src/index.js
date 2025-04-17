import connectDb from "./db/db.js"
import "dotenv/config";

import { app } from "./app.js";
import {createServer} from "http"


const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);


connectDb().then(()=>{
    httpServer.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
}).catch((error)=>{
    console.log("Error while connecting to MongoDB", error);
});