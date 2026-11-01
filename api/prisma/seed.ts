import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Seed Genres (at least 4 genres required)
  const genresData = [
    {
      name: 'Science Fiction',
      description: 'Speculative fiction exploring futuristic concepts, advanced science, space exploration, and time travel.',
    },
    {
      name: 'Fantasy',
      description: 'Stories set in magical universes with mythical creatures, epic quests, and supernatural phenomena.',
    },
    {
      name: 'Mystery & Thriller',
      description: 'Suspenseful narratives focused on investigating crimes, solving puzzles, and uncovering dark secrets.',
    },
    {
      name: 'Historical Non-Fiction',
      description: 'Factual accounts and analyses of past civilizations, pivotal events, and historical figures.',
    },
    {
      name: 'Dystopian Fiction',
      description: 'Explorations of oppressive societal control, environmental collapse, and totalitarian regimes.',
    },
  ];

  console.log('Upserting genres...');
  const genres = await Promise.all(
    genresData.map((genre) =>
      prisma.genre.upsert({
        where: { name: genre.name },
        update: { description: genre.description },
        create: genre,
      }),
    ),
  );

  const genreMap = new Map(genres.map((g) => [g.name, g.id]));

  // 2. Seed Users (Roles: PATRON and LIBRARIAN)
  console.log('Upserting users...');
  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@central-library.org' },
    update: {},
    create: {
      email: 'librarian@central-library.org',
      name: 'Eleanor Vance',
      role: Role.LIBRARIAN,
    },
  });

  const patron1 = await prisma.user.upsert({
    where: { email: 'alice.reader@example.com' },
    update: {},
    create: {
      email: 'alice.reader@example.com',
      name: 'Alice Cooper',
      role: Role.PATRON,
    },
  });

  const patron2 = await prisma.user.upsert({
    where: { email: 'bob.martin@example.com' },
    update: {},
    create: {
      email: 'bob.martin@example.com',
      name: 'Bob Martin',
      role: Role.PATRON,
    },
  });

  // 3. Seed Books (at least 15 books required across the genres)
  console.log('Upserting books...');
  const booksData = [
    // Science Fiction
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441172719',
      summary: 'The epic saga of Paul Atreides and the desert planet Arrakis, home of the spice melange.',
      publishedAt: new Date('1965-08-01'),
      genreId: genreMap.get('Science Fiction')!,
    },
    {
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '978-0441569595',
      summary: 'A washed-up computer hacker is hired by a mysterious employer for the ultimate cyber heist.',
      publishedAt: new Date('1984-07-01'),
      genreId: genreMap.get('Science Fiction')!,
    },
    {
      title: 'Foundation',
      author: 'Isaac Asimov',
      isbn: '978-0553293357',
      summary: 'Hari Seldon creates psychohistory to preserve human knowledge before the Galactic Empire falls.',
      publishedAt: new Date('1951-05-01'),
      genreId: genreMap.get('Science Fiction')!,
    },
    {
      title: 'Hyperion',
      author: 'Dan Simmons',
      isbn: '978-0553283686',
      summary: 'Seven pilgrims journey across space to the Time Tombs to meet the terrifying creature known as the Shrike.',
      publishedAt: new Date('1989-05-26'),
      genreId: genreMap.get('Science Fiction')!,
    },

    // Fantasy
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '978-0547928227',
      summary: 'Bilbo Baggins leaves the comfort of the Shire to embark on a quest to reclaim the Lonely Mountain.',
      publishedAt: new Date('1937-09-21'),
      genreId: genreMap.get('Fantasy')!,
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '978-0756404741',
      summary: 'The tale of Kvothe, an orphan boy who grows to become a legendary arcanist, musician, and kingkiller.',
      publishedAt: new Date('2007-03-27'),
      genreId: genreMap.get('Fantasy')!,
    },
    {
      title: 'The Way of Kings',
      author: 'Brandon Sanderson',
      isbn: '978-0765326355',
      summary: 'On the shattered plains of Roshar, an epic high-fantasy conflict unfolds with the ancient Knights Radiant.',
      publishedAt: new Date('2010-08-31'),
      genreId: genreMap.get('Fantasy')!,
    },
    {
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      isbn: '978-0553103540',
      summary: 'Noble families battle for control of the Iron Throne while an ancient evil awakens in the far north.',
      publishedAt: new Date('1996-08-01'),
      genreId: genreMap.get('Fantasy')!,
    },

    // Mystery & Thriller
    {
      title: 'The Hound of the Baskervilles',
      author: 'Arthur Conan Doyle',
      isbn: '978-0141440934',
      summary: 'Sherlock Holmes and Dr. Watson investigate a legendary curse and a demonic hound on Dartmoor.',
      publishedAt: new Date('1902-04-01'),
      genreId: genreMap.get('Mystery & Thriller')!,
    },
    {
      title: 'And Then There Were None',
      author: 'Agatha Christie',
      isbn: '978-0062073488',
      summary: 'Ten strangers are lured to an isolated island mansion where they are murdered one by one.',
      publishedAt: new Date('1939-11-06'),
      genreId: genreMap.get('Mystery & Thriller')!,
    },
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      isbn: '978-0307269751',
      summary: 'Journalist Mikael Blomkvist and hacker Lisbeth Salander uncover decades of dark family secrets.',
      publishedAt: new Date('2005-08-01'),
      genreId: genreMap.get('Mystery & Thriller')!,
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '978-0307588364',
      summary: 'On their fifth anniversary, Amy Dunne disappears, and secrets reveal that her husband might be responsible.',
      publishedAt: new Date('2012-05-24'),
      genreId: genreMap.get('Mystery & Thriller')!,
    },

    // Historical Non-Fiction
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      summary: 'A sweeping narrative exploring how Homo sapiens conquered the globe through cognitive and agricultural revolutions.',
      publishedAt: new Date('2014-09-04'),
      genreId: genreMap.get('Historical Non-Fiction')!,
    },
    {
      title: 'Guns, Germs, and Steel',
      author: 'Jared Diamond',
      isbn: '978-0393317558',
      summary: 'An inquiry into how environmental and geographic factors shaped the fate of human societies.',
      publishedAt: new Date('1997-03-01'),
      genreId: genreMap.get('Historical Non-Fiction')!,
    },
    {
      title: 'The Silk Roads: A New History of the World',
      author: 'Peter Frankopan',
      isbn: '978-1101912379',
      summary: 'A re-evaluation of global history centered along the trade and cultural networks connecting East and West.',
      publishedAt: new Date('2015-08-27'),
      genreId: genreMap.get('Historical Non-Fiction')!,
    },

    // Dystopian Fiction
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      summary: 'Winston Smith struggles against the totalitarian surveillance state of Big Brother in Oceania.',
      publishedAt: new Date('1949-06-08'),
      genreId: genreMap.get('Dystopian Fiction')!,
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      isbn: '978-0060850524',
      summary: 'A futuristic World State conditions citizens through reproductive technology, psychological conditioning, and soma.',
      publishedAt: new Date('1932-01-01'),
      genreId: genreMap.get('Dystopian Fiction')!,
    },
    {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      isbn: '978-1451673319',
      summary: 'Guy Montag is a fireman tasked with burning books in a society that outlawed literature and independent thought.',
      publishedAt: new Date('1953-10-19'),
      genreId: genreMap.get('Dystopian Fiction')!,
    },
  ];

  const seededBooks = [];
  for (const book of booksData) {
    const record = await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        author: book.author,
        summary: book.summary,
        publishedAt: book.publishedAt,
        genreId: book.genreId,
      },
      create: book,
    });
    seededBooks.push(record);
  }

  // 4. Seed Reviews (Stretch Task relation demonstration)
  console.log('Upserting sample reviews...');
  const duneBook = seededBooks.find((b) => b.isbn === '978-0441172719');
  const sapiensBook = seededBooks.find((b) => b.isbn === '978-0062316097');

  if (duneBook && patron1) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: 'A monumental masterpiece of science fiction world-building!',
        bookId: duneBook.id,
        userId: patron1.id,
      },
    }).catch(() => {
      // Ignore if review already exists during repeat runs
    });
  }

  if (sapiensBook && patron2) {
    await prisma.review.create({
      data: {
        rating: 4,
        comment: 'Fascinating perspective on our shared history, highly recommended.',
        bookId: sapiensBook.id,
        userId: patron2.id,
      },
    }).catch(() => {
      // Ignore if review already exists during repeat runs
    });
  }

  console.log('Seeding complete!');
  console.log(`   - Genres inserted: ${genres.length}`);
  console.log(`   - Books inserted: ${seededBooks.length}`);
  console.log(`   - Users inserted: 3 (1 LIBRARIAN, 2 PATRONs)`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
