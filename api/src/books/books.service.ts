import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });
    if (!genre) {
      throw new BadRequestException(`Genre with ID ${createBookDto.genreId} does not exist`);
    }

    const existingIsbn = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });
    if (existingIsbn) {
      throw new ConflictException(`Book with ISBN "${createBookDto.isbn}" already exists`);
    }

    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        description: createBookDto.description ?? '',
        publishedYear: createBookDto.publishedYear,
        coverImage: createBookDto.coverImage,
        totalCopies: createBookDto.totalCopies,
        availableCopies: createBookDto.availableCopies ?? createBookDto.totalCopies,
        genreId: createBookDto.genreId,
      },
      include: {
        genre: true,
      },
    });
  }

  async findAll(query?: QueryBooksDto) {
    const genreId = query?.genreId;
    const search = query?.search;
    const pageNum = Number(query?.page) > 0 ? Number(query?.page) : 1;
    const limitNum = Number(query?.limit) > 0 ? Number(query?.limit) : 10;
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const where: Prisma.BookWhereInput = {};

    if (genreId !== undefined && genreId !== null && String(genreId) !== '') {
      where.genreId = Number(genreId);
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { author: { contains: term, mode: 'insensitive' } },
        { isbn: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take,
        include: {
          genre: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
      },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!genre) {
        throw new BadRequestException(`Genre with ID ${updateBookDto.genreId} does not exist`);
      }
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data: updateBookDto,
        include: {
          genre: true,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('A book with this ISBN already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
