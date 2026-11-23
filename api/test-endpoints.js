const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('./dist/src/app.module');

async function runTests() {
  console.log('--- Starting Automated Backend Verification ---');
  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const testPort = 3099;
  await app.listen(testPort);
  const baseUrl = `http://localhost:${testPort}`;
  console.log(`Test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Register Librarian
    const libEmail = `librarian_${timestamp}@test.org`;
    const regLibRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: libEmail,
        name: 'Test Librarian',
        password: 'Password123!',
        role: 'LIBRARIAN',
      }),
    });
    const regLibData = await regLibRes.json();
    assert(regLibRes.status === 201 && regLibData.access_token, 'Register Librarian returns 201 and access_token');
    const librarianToken = regLibData.access_token;

    // 2. Register Member / Patron
    const memEmail = `member_${timestamp}@test.org`;
    const regMemRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memEmail,
        name: 'Test Member',
        password: 'Password123!',
        role: 'MEMBER',
      }),
    });
    const regMemData = await regMemRes.json();
    assert(regMemRes.status === 201 && regMemData.access_token, 'Register Member returns 201 and access_token');
    const memberToken = regMemData.access_token;

    // 3. Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: libEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.access_token, 'Login returns 200 and access_token');

    // 4. Public Genres List
    const genresRes = await fetch(`${baseUrl}/genres`);
    const genresData = await genresRes.json();
    assert(genresRes.status === 200 && Array.isArray(genresData), 'GET /genres returns 200 and array of genres');
    assert(genresData.length > 0 && genresData[0]._count !== undefined, 'GET /genres includes book count (_count.books)');

    // 5. Create Genre - Unauthorized check (missing token -> 401)
    const unauthGenreRes = await fetch(`${baseUrl}/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Genre Unauth ${timestamp}` }),
    });
    assert(unauthGenreRes.status === 401, 'POST /genres without token returns 401 Unauthorized');

    // 6. Create Genre - Forbidden check (member token -> 403)
    const forbGenreRes = await fetch(`${baseUrl}/genres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({ name: `Genre Forbid ${timestamp}` }),
    });
    assert(forbGenreRes.status === 403, 'POST /genres with Member token returns 403 Forbidden');

    // 7. Create Genre - Authorized (librarian token -> 201)
    const newGenreName = `Genre Created ${timestamp}`;
    const createGenreRes = await fetch(`${baseUrl}/genres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${librarianToken}`,
      },
      body: JSON.stringify({
        name: newGenreName,
        description: 'A test genre description',
      }),
    });
    const createGenreData = await createGenreRes.json();
    assert(createGenreRes.status === 201 && createGenreData.id, 'POST /genres with Librarian token creates genre (201)');
    const createdGenreId = createGenreData.id;

    // 8. Get Genre By ID
    const getGenreRes = await fetch(`${baseUrl}/genres/${createdGenreId}`);
    const getGenreData = await getGenreRes.json();
    assert(getGenreRes.status === 200 && getGenreData.name === newGenreName, 'GET /genres/:id returns genre details');

    // 9. Update Genre
    const patchGenreRes = await fetch(`${baseUrl}/genres/${createdGenreId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${librarianToken}`,
      },
      body: JSON.stringify({ description: 'Updated genre description' }),
    });
    const patchGenreData = await patchGenreRes.json();
    assert(patchGenreRes.status === 200 && patchGenreData.description === 'Updated genre description', 'PATCH /genres/:id updates genre');

    // 10. Public Books List (Paginated { data, meta })
    const booksRes = await fetch(`${baseUrl}/books?page=1&limit=5`);
    const booksData = await booksRes.json();
    if (!booksData.meta) {
      console.log('DEBUG BOOKS RESPONSE:', booksRes.status, booksData);
    }
    assert(booksRes.status === 200 && Array.isArray(booksData.data) && booksData.meta !== undefined, 'GET /books returns 200 with { data, meta }');
    assert(booksData.meta && booksData.meta.limit === 5 && booksData.meta.page === 1, 'GET /books pagination meta matches query params');

    // 11. Create Book - Unauthorized (401)
    const unauthBookRes = await fetch(`${baseUrl}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauth Book',
        author: 'Unauth Author',
        isbn: `978${timestamp.toString().slice(-9)}`,
        totalCopies: 2,
        genreId: createdGenreId,
      }),
    });
    assert(unauthBookRes.status === 401, 'POST /books without token returns 401 Unauthorized');

    // 12. Create Book - Forbidden (403)
    const forbBookRes = await fetch(`${baseUrl}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        title: 'Forbidden Book',
        author: 'Forbidden Author',
        isbn: `978${timestamp.toString().slice(-9)}`,
        totalCopies: 2,
        genreId: createdGenreId,
      }),
    });
    assert(forbBookRes.status === 403, 'POST /books with Member token returns 403 Forbidden');

    // 13. Create Book - Authorized (201)
    const bookIsbn = `978${timestamp.toString().slice(-9)}`;
    const createBookRes = await fetch(`${baseUrl}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${librarianToken}`,
      },
      body: JSON.stringify({
        title: `Test Book ${timestamp}`,
        author: 'Arthur C. Author',
        isbn: bookIsbn,
        description: 'A test book synopsis',
        publishedYear: 2024,
        totalCopies: 5,
        availableCopies: 5,
        genreId: createdGenreId,
      }),
    });
    const createBookData = await createBookRes.json();
    assert(createBookRes.status === 201 && createBookData.id, 'POST /books with Librarian creates book (201)');
    const createdBookId = createBookData.id;

    // 14. Get Book By ID
    const getBookRes = await fetch(`${baseUrl}/books/${createdBookId}`);
    const getBookData = await getBookRes.json();
    assert(getBookRes.status === 200 && getBookData.isbn === bookIsbn && getBookData.genre, 'GET /books/:id returns book with related genre');

    // 15. Query Books - Search filtering (case-insensitive across title, author, isbn)
    const searchRes = await fetch(`${baseUrl}/books?search=Arthur`);
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 &&
      searchData.data.some((b) => b.author.includes('Arthur')),
      'GET /books?search=Arthur finds books by author'
    );

    const searchIsbnRes = await fetch(`${baseUrl}/books?search=${bookIsbn}`);
    const searchIsbnData = await searchIsbnRes.json();
    assert(
      searchIsbnRes.status === 200 &&
      searchIsbnData.data.some((b) => b.isbn === bookIsbn),
      'GET /books?search=<isbn> finds books by ISBN'
    );

    // 16. Query Books - Filter by genreId
    const filterGenreRes = await fetch(`${baseUrl}/books?genreId=${createdGenreId}`);
    const filterGenreData = await filterGenreRes.json();
    assert(
      filterGenreRes.status === 200 &&
      filterGenreData.data.every((b) => b.genreId === createdGenreId),
      'GET /books?genreId=... filters books by genreId'
    );

    // 17. Update Book (Librarian)
    const patchBookRes = await fetch(`${baseUrl}/books/${createdBookId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${librarianToken}`,
      },
      body: JSON.stringify({
        availableCopies: 4,
      }),
    });
    const patchBookData = await patchBookRes.json();
    assert(patchBookRes.status === 200 && patchBookData.availableCopies === 4, 'PATCH /books/:id updates book details');

    // 18. Delete Book (Librarian)
    const deleteBookRes = await fetch(`${baseUrl}/books/${createdBookId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${librarianToken}`,
      },
    });
    assert(deleteBookRes.status === 200, 'DELETE /books/:id deletes book');

    // 19. Delete Genre (Librarian)
    const deleteGenreRes = await fetch(`${baseUrl}/genres/${createdGenreId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${librarianToken}`,
      },
    });
    assert(deleteGenreRes.status === 200, 'DELETE /genres/:id deletes genre');

    // 20. Users profile
    const profileRes = await fetch(`${baseUrl}/users/profile`, {
      headers: {
        Authorization: `Bearer ${librarianToken}`,
      },
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && profileData.email === libEmail, 'GET /users/profile returns authenticated user');

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runTests();
