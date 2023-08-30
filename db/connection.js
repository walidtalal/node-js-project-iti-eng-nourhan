import mongoose from "mongoose";

const connection = async () => {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/nodeJsPrject`);
        console.log("DB is connected");
    } catch (error) {
        console.error("Connection error:", error);
    }
};

export default connection;
