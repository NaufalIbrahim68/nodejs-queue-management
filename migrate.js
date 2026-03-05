require('dotenv').config();

const mongoose = require('mongoose');
const Counter = require('./models/Counter');
const Queue = require('./models/Queue');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueapp';

const migrate = async () => {
    const isReset = process.argv.includes('--reset');

    console.log('╔══════════════════════════════════════════════╗');
    console.log('║    🗄️  Queue App - Database Migration         ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    try {
        console.log(`📡 Connecting to MongoDB: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ MongoDB Connected!\n');

        if (isReset) {
            console.log('🔄 Resetting database...');
            await Queue.deleteMany({});
            await Counter.deleteMany({});
            console.log('   ✓ Cleared queues collection');
            console.log('   ✓ Cleared counters collection\n');
        }

        console.log('📋 Ensuring collections exist...');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        if (!collectionNames.includes('queues')) {
            await mongoose.connection.db.createCollection('queues');
            console.log('   ✓ Created "queues" collection');
        } else {
            console.log('   ✓ "queues" collection already exists');
        }

        if (!collectionNames.includes('counters')) {
            await mongoose.connection.db.createCollection('counters');
            console.log('   ✓ Created "counters" collection');
        } else {
            console.log('   ✓ "counters" collection already exists');
        }

        console.log('\n🌱 Seeding initial data...');

        const existingCounter = await Counter.findOne({ name: 'queue' });
        if (!existingCounter) {
            await Counter.create({ name: 'queue', seq: 0 });
            console.log('   ✓ Created queue counter (seq: 0)');
        } else {
            console.log(`   ✓ Queue counter already exists (seq: ${existingCounter.seq})`);
        }

        console.log('\n🔑 Ensuring indexes...');
        await Queue.ensureIndexes();
        await Counter.ensureIndexes();
        console.log('   ✓ Indexes created/verified');

        const queueCount = await Queue.countDocuments();
        const counterDoc = await Counter.findOne({ name: 'queue' });

        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║    ✅ Migration Complete!                     ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log(`\n📊 Database Summary:`);
        console.log(`   • Queues in database : ${queueCount}`);
        console.log(`   • Counter sequence   : ${counterDoc ? counterDoc.seq : 0}`);
        console.log(`   • Database           : ${mongoose.connection.name}`);
        console.log(`\n💡 You can now start the server with: npm run dev\n`);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\n💡 Tips:');
        console.error('   1. Make sure MongoDB is running');
        console.error('   2. Check your MONGO_URI in the .env file');
        console.error('   3. Default: mongodb://localhost:27017/queueapp\n');
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

migrate();
