import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean existing data for deterministic seeding
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  const genreNames = ["Fantasy", "Science Fiction", "Mystery", "Biography"];

  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
      }),
    ),
  );

  const sampleBooks = [
    // Fantasy (4 books)
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy" },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy" },
    { title: "The Way of Kings", author: "Brandon Sanderson", genre: "Fantasy" },
    { title: "A Game of Thrones", author: "George R.R. Martin", genre: "Fantasy" },

    // Science Fiction (4 books)
    { title: "Dune", author: "Frank Herbert", genre: "Science Fiction" },
    { title: "Neuromancer", author: "William Gibson", genre: "Science Fiction" },
    { title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction" },
    { title: "Hyperion", author: "Dan Simmons", genre: "Science Fiction" },

    // Mystery (4 books)
    { title: "The Big Sleep", author: "Raymond Chandler", genre: "Mystery" },
    { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", genre: "Mystery" },
    { title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery" },
    { title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery" },

    // Biography (4 books)
    { title: "Educated", author: "Tara Westover", genre: "Biography" },
    { title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography" },
    { title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Biography" },
    { title: "Long Walk to Freedom", author: "Nelson Mandela", genre: "Biography" },
  ];

  for (const book of sampleBooks) {
    const genre = genres.find((g) => g.name === book.genre);
    if (!genre) continue;

    await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        isbn: `978${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        description: `${book.title} by ${book.author}.`,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genre.id,
      },
    });
  }

  // Also seed sample users with Role enum
  await prisma.user.createMany({
    data: [
      {
        email: "librarian@library.org",
        password: "hashed_password_123",
        role: "LIBRARIAN",
      },
      {
        email: "patron@library.org",
        password: "hashed_password_456",
        role: "PATRON",
      },
    ],
  });

  console.log("Seeding complete: 4 genres and 16 books inserted.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
