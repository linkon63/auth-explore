
const Database = require('better-sqlite3');  // Fixed: Require better-sqlite3, not the database file
const path = require('path');
const { faker } = require('@faker-js/faker');

// Initialize database - point to the correct database file
const db = new Database(path.join(__dirname, '../data/notes.db'));


// Function to generate random notes
function generateNotes(userId, count = 1000) {
    const notes = [];
    for (let i = 0; i < count; i++) {
        notes.push({
            user_id: userId,
            title: faker.lorem.words({ min: 2, max: 7 }),  // Removed .join(' ')
            content: faker.lorem.paragraphs({ min: 1, max: 5 }),
            created_at: faker.date.past({ years: 1 }).toISOString(),
            updated_at: faker.date.recent({ days: 30 }).toISOString()
        });
    }
    return notes;
}

// Function to insert notes
async function seedNotes(userId, count = 1000) {
    try {
        // Begin transaction
        const insert = db.prepare(`
      INSERT INTO notes (user_id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

        const insertMany = db.transaction((notes) => {
            for (const note of notes) {
                insert.run(
                    note.user_id,
                    note.title,
                    note.content,
                    note.created_at,
                    note.updated_at
                );
            }
        });

        // Generate and insert notes
        const notes = generateNotes(userId, count);
        console.log(`Inserting ${notes.length} notes for user ${userId}...`);

        // Insert in batches of 100 for better performance
        const batchSize = 100;
        for (let i = 0; i < notes.length; i += batchSize) {
            const batch = notes.slice(i, i + batchSize);
            insertMany(batch);
            console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(notes.length / batchSize)}`);
        }

        console.log('✅ Successfully seeded notes!');
    } catch (error) {
        console.error('Error seeding notes:', error);
    } finally {
        db.close();
    }
}

// Get user ID from command line arguments or use default (1)
const userId = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const count = process.argv[3] ? parseInt(process.argv[3], 10) : 1000;

// Run the seeder
seedNotes(userId, count);