import mongoose from "mongoose"

const connectDb = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            retryWrites: true,
            
            writeConcern: {
                w: "majority"
            },
            appName: "trekbackend",
        });
        console.log(`\n MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`Error while connecting to MongoDB: ${error.message}`);
    }
}
export default connectDb;