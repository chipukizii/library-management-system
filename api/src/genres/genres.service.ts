import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    const existing = await this.prisma.genre.findUnique({
      where: { name: createGenreDto.name },
    });
    if (existing) {
      throw new ConflictException(`Genre with name "${createGenreDto.name}" already exists`);
    }

    const slug =
      createGenreDto.slug ||
      createGenreDto.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingSlug = await this.prisma.genre.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Genre with slug "${slug}" already exists`);
    }

    return this.prisma.genre.create({
      data: {
        name: createGenreDto.name,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    await this.findOne(id);

    const data: { name?: string; slug?: string } = {};
    if (updateGenreDto.name !== undefined) {
      data.name = updateGenreDto.name;
    }
    if (updateGenreDto.slug !== undefined) {
      data.slug = updateGenreDto.slug;
    } else if (updateGenreDto.name) {
      data.slug = updateGenreDto.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }

    try {
      return await this.prisma.genre.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('A genre with this name or slug already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
