# Library Management System

A robust data layer for a modern library book catalog system, built using **NestJS**, **Prisma ORM**, and **PostgreSQL**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture & Data Models](#architecture--data-models)
- [Schema Decisions](#schema-decisions)
- [Prisma vs. Document Database Modeling](#prisma-vs-document-database-modeling)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Migration](#database-migration)
  - [Database Seeding](#database-seeding)
- [Prisma Service Integration](#prisma-service-integration)

---

## 🚀 Overview

This repository implements the data persistence layer for the Library Management System. It models patrons, librarians, genres, books, and book reviews with strong referential integrity, type safety, and database-level constraints.

---

## 🏛 Architecture & Data Models

The Prisma schema defines the following core models and enums:

1. **Role Enum**:
   - `PATRON`: General library patrons with borrowing and review privileges.
   - `LIBRARIAN`: Administrative staff responsible for catalog management and user oversight.

2. **User**:
   - Stores patron and librarian identities with unique email constraints, role assignments, and relations to reviews.

3. **Genre**:
   - Stores standardized book categories with unique names and optional descriptions.

4. **Book**:
   - Represents catalog entries (Title, Author, ISBN, Publication Date, Summary) and links to a specific `Genre` via `genreId`.

5. **Review** *(Stretch Task)*:
   - Relational model connecting a `Book` and a `User` (Patron) with numerical ratings and qualitative review comments.

---

## 💡 Schema Decisions

### Why `Book` References `Genre` Rather Than Embedding It

A foundational architectural decision in designing this relational catalog schema was modeling `Genre` as a standalone table referenced by `Book` through a foreign key (`genreId`) rather than embedding genre data (e.g., as a free-form string or JSON subdocument) inside the `Book` record.

The primary justifications include:

1. **Normalization & Single Source of Truth**:
   - Storing genres in an independent `Genre` table eliminates redundant text across hundreds or thousands of books.
   - If a genre is renamed, re-categorized, or updated with a refined description (e.g., updating *"Sci-Fi"* to *"Science Fiction"*), the change is executed in a single atomic update on the `Genre` table. With embedded data, this would require scanning and mutating every single book record, inviting update anomalies and data drift.

2. **Data Consistency & Referential Integrity**:
   - In catalog systems, inconsistent categorization (e.g., `"Sci-Fi"`, `"Sci Fi"`, `"Science Fiction"`, `"scifi"`) ruins faceted search, categorization filters, and browsing.
   - By using a foreign key constraint (`@relation(fields: [genreId], references: [id])`), the database engine enforces that no book can ever point to a non-existent or mislabeled genre.

3. **Independent Lifecycle & Rich Metadata**:
   - Genres possess their own identity, lifecycle, and metadata (such as descriptions, parent classifications, or shelf locations).
   - In a physical or digital library, a genre exists even if there are currently zero books in stock for that category. Embedding a genre within a book document would make empty genres impossible to represent without artificial placeholder records.

4. **Query Performance, Indexing & Aggregations**:
   - Foreign keys indexed on `genreId` allow lightning-fast SQL joins and indexed filtering (e.g., `WHERE genreId = ?`).
   - Computing catalog metrics—such as counting the number of volumes per genre, tracking genre popularity, or generating inventory reports—is significantly more efficient using standard relational `GROUP BY` and join operations than parsing and aggregating unstructured embedded strings.

5. **Controlled Deletion Semantics**:
   - Using foreign key constraints allows us to specify explicit referential policies. For instance, using `onDelete: Restrict` prevents accidental deletion of a genre that still contains books in the catalog, preventing dangling associations.

---

## 🔄 Prisma vs. Document Database Modeling

### Reflections on Modeling in Prisma (Relational) vs. a Document Database (e.g., MongoDB)

Coming from a document database (such as MongoDB with Mongoose), modeling in Prisma with PostgreSQL introduces a distinct paradigm shift:

* **Strict Relations & Migration-Driven Rigor vs. Schema Flexibility**:
  In a document database, relationships are often denormalized or embedded directly as subdocuments (e.g., embedding an array of reviews or an embedded `{ name: "Fantasy" }` object inside a book document). While this enables single-read retrieval without joins, it shifts the entire burden of data integrity, validation, and orphan management to application-level code.
  
  In Prisma with PostgreSQL, the relationship schema is declared upfront with explicit foreign keys (`genreId`, `userId`, `bookId`) and enforced at the database engine level. Prisma migrations (`prisma migrate dev`) codify every structural change as deterministic SQL migration files, guaranteeing that production, staging, and development environments stay in perfect parity.

* **Explicit Type-Safe Query Navigation**:
  Prisma generates fully typed TypeScript interfaces derived directly from the schema. Performing relational operations using Prisma's `include` or `select` (e.g., `prisma.book.findMany({ include: { genre: true, reviews: { include: { user: true } } } })`) provides compile-time auto-completion and compile-time type validation, eliminating runtime null-pointer surprises common when working with loosely typed document hierarchies.

---

## 📁 Project Structure

```text
library-management-system/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema (Role, User, Genre, Book, Review)
│   │   └── seed.ts             # Seed script (5 genres, 18 books, users, reviews)
│   ├── src/
│   │   └── prisma/
│   │       └── prisma.service.ts # NestJS PrismaService extending PrismaClient
│   ├── .env.example            # DATABASE_URL placeholder
│   ├── package.json            # Node dependencies & Prisma configuration
│   └── tsconfig.json           # TypeScript configuration
└── README.md                   # Project documentation & schema decisions
```

---

## 🛠 Getting Started

### Prerequisites

- **Node.js**: v18+ or v20+ recommended (verified on Node v24)
- **npm** or **pnpm**
- **PostgreSQL**: A running local or hosted PostgreSQL instance (e.g., Supabase, Neon, Railway, or AWS RDS)

### Environment Setup

1. Navigate to the `api` directory:
   ```bash
   cd api
   ```

2. Copy the sample environment file to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and replace the placeholder with your PostgreSQL connection URL:
   ```env
   DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public"
   ```

### Database Migration

Apply the Prisma schema to your hosted PostgreSQL database using Prisma Migrate:

```bash
npx prisma migrate dev --name init
```

*Or, if synchronizing directly to an existing database without migration tracking files:*

```bash
npx prisma db push
```

### Database Seeding

Run the seed script to populate the database with at least 4 genres (5 provided) and at least 15 books (18 provided across genres):

```bash
npx prisma db seed
```

This executes `prisma/seed.ts` via `ts-node` and logs insertion confirmations for:
- **5 Genres**: Science Fiction, Fantasy, Mystery & Thriller, Historical Non-Fiction, Dystopian Fiction.
- **18 Books**: Distributed evenly across the genres with realistic ISBNs, summaries, and publication dates.
- **3 Users**: 1 Librarian and 2 Patrons.
- **Sample Reviews**: Demonstrating the relational link between books, patrons, and ratings.

---

## 🔌 Prisma Service Integration

The application integrates with NestJS through `PrismaService` (`api/src/prisma/prisma.service.ts`):

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

This service can be injected into any NestJS module or service to perform type-safe queries while ensuring the database connection pool is established on application bootstrap.
