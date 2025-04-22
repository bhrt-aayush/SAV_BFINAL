import mongoose from "mongoose";

class Database {
    static instance = null;

    constructor() {
        if (!Database.instance) {
            Database.instance = this;
        }
        return Database.instance;
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connectDB(uri, options = {}) {
        if (!uri) {
            console.error("Database connection URI is required.");
            return;
        }

        const defaultOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ...options,
        };

        try {
            await mongoose.connect(uri, defaultOptions);
            console.log("✅ Database connected successfully");
            
            mongoose.connection.on("disconnected", () => {
                console.warn("⚠️ Database disconnected. Attempting to reconnect...");
                this.reconnectDB(uri, options);
            });
        } catch (error) {
            console.error("❌ Database connection failed:", error);
            process.exit(1);
        }
    }

    async disconnectDB() {
        try {
            await mongoose.disconnect();
            console.log("✅ Database disconnected successfully");
        } catch (error) {
            console.error("❌ Error disconnecting database:", error);
        }
    }

    async reconnectDB(uri, options) {
        console.log("🔄 Attempting to reconnect to the database...");
        setTimeout(() => this.connectDB(uri, options), 5000); // Retry after 5 seconds
    }
}

export default Database;
