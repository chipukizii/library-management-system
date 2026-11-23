import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean existing data for deterministic seeding
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  const genreData = [
    { name: "Fantasy", description: "Imaginative literature featuring mythical beings, magic, and epic quests." },
    { name: "Science Fiction", description: "Speculative fiction dealing with imaginative concepts such as advanced science and space exploration." },
    { name: "Mystery", description: "Suspenseful fiction focused on solving puzzles, crimes, or unexplained phenomena." },
    { name: "Biography", description: "Non-fiction accounts of a person's life written by another individual." },
  ];

  const genres = await Promise.all(
    genreData.map((g) =>
      prisma.genre.create({
        data: {
          name: g.name,
          slug: g.name.toLowerCase().replace(/\s+/g, "-"),
          description: g.description,
        },
      }),
    ),
  );

  const sampleBooks = [
    // Fantasy (4 books)
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", publishedYear: 1937 },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", publishedYear: 2007 },
    { title: "The Way of Kings", author: "Brandon Sanderson", genre: "Fantasy", publishedYear: 2010 },
    { title: "A Game of Thrones", author: "George R.R. Martin", genre: "Fantasy", publishedYear: 1996 },

    // Science Fiction (4 books)
    { title: "Dune", author: "Frank Herbert", genre: "Science Fiction", publishedYear: 1965 },
    { title: "Neuromancer", author: "William Gibson", genre: "Science Fiction", publishedYear: 1984 },
    { title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction", publishedYear: 1951 },
    { title: "Hyperion", author: "Dan Simmons", genre: "Science Fiction", publishedYear: 1989 },

    // Mystery (4 books)
    { title: "The Big Sleep", author: "Raymond Chandler", genre: "Mystery", publishedYear: 1939 },
    { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", genre: "Mystery", publishedYear: 1902 },
    { title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery", publishedYear: 1939 },
    { title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery", publishedYear: 2012 },

    // Biography (4 books)
    { title: "Educated", author: "Tara Westover", genre: "Biography", publishedYear: 2018 },
    { title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", publishedYear: 2011 },
    { title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Biography", publishedYear: 1947 },
    { title: "Long Walk to Freedom", author: "Nelson Mandela", genre: "Biography", publishedYear: 1994 },
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
        publishedYear: book.publishedYear,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genre.id,
      },
    });
  }

  // Seed sample users with Role enum
  await prisma.user.createMany({
    data: [
      {
        email: "librarian@library.org",
        name: "Head Librarian",
        password: "hashed_password_123",
        role: Role.LIBRARIAN,
      },
      {
        email: "patron@library.org",
        name: "Jane Patron",
        password: "hashed_password_456",
        role: Role.PATRON,
      },
      {
        email: "member@library.org",
        name: "John Member",
        password: "hashed_password_789",
        role: Role.MEMBER,
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
