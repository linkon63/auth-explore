const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");
const prisma = new PrismaClient().$extends(withAccelerate());

async function seedNotes() {
    try {
        const notes = await prisma.note.createMany({
            data: [
                { title: "Note 1", content: "Content 1", file: [{ fileName: "file1.jpg", url: "https://example.com/file1.jpg" }] },
                { title: "Note 2", content: "Content 2", file: [{ fileName: "file2.jpg", url: "https://example.com/file2.jpg" }] },
                { title: "Note 3", content: "Content 3", file: [{ fileName: "file3.jpg", url: "https://example.com/file3.jpg" }] },
            ],
        });
        console.log("Notes seeded successfully:", notes);
    } catch (error) {
        console.error("Error seeding notes:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedNotes();