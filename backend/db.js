require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB Cloud!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Stop the app if DB fails to connect
    }
}

module.exports = { client, connectDB };
