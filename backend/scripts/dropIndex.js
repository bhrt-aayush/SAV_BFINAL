import mongoose from 'mongoose';
import 'dotenv/config';

const dropIndex = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://ayu:1122@cluster0.crrax0u.mongodb.net/fyp-savorybytes');
        console.log('Connected to MongoDB');

        // Get the foods collection
        const collection = mongoose.connection.collection('foods');

        // Drop the id_1 index
        await collection.dropIndex('id_1');
        console.log('Successfully dropped id_1 index');

        // Verify indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex(); 