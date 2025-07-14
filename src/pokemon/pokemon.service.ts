import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private pokemonRepository: Repository<Pokemon>,
  ) {}

  async importFromCsv(
    filePath: string,
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;
    const pokemonData: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const pokemon = {
            id: data.id,
            name: data.name?.trim(),
            type1: data.type1?.trim(),
            type2: data.type2?.trim() || null,
            total: parseInt(data.total) || 0,
            hp: parseInt(data.hp) || 0,
            attack: parseInt(data.attack) || 0,
            defense: parseInt(data.defense) || 0,
            spAttack: parseInt(data.spAttack ?? data['spAttack'] ?? data['Sp. Atk']) || 0,
            spDefense: parseInt(data.spDefense ?? data['spDefense'] ?? data['Sp. Def']) || 0,
            speed: parseInt(data.speed) || 0,
            generation: parseInt(data.generation) || 1,
            legendary: data.legendary === 'True' || data.legendary === 'true' || data.legendary === 'false' ? data.legendary === 'True' || data.legendary === 'true' : false,
            image: data.image ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.length + 1}.png`,
          };

          if (!pokemon.name || !pokemon.type1) {
            errors.push(`Invalid pokemon data: ${JSON.stringify(data)}`);
            return;
          }

          pokemonData.push(pokemon);
        })
        .on('end', async () => {
          try {
            await this.pokemonRepository
              .createQueryBuilder()
              .delete()
              .execute();
            const batchSize = 100;
            for (let i = 0; i < pokemonData.length; i += batchSize) {
              const batch = pokemonData.slice(i, i + batchSize);
              await this.pokemonRepository.save(batch);
              imported += batch.length;
            }

            resolve({ imported, errors });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async findPokemon(query: PokemonQueryDto): Promise<{
    data: Pokemon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      legendary,
      speedMin,
      speedMax,
    } = query;

    const queryBuilder = this.pokemonRepository.createQueryBuilder('pokemon');

    if (search) {
      queryBuilder.andWhere('pokemon.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere(
        '(pokemon.type1 = :type OR pokemon.type2 = :type)',
        { type },
      );
    }

    if (legendary !== undefined) {
      queryBuilder.andWhere('pokemon.legendary = :legendary', { legendary });
    }

    if (speedMin !== undefined || speedMax !== undefined) {
      if (speedMin !== undefined && speedMax !== undefined) {
        queryBuilder.andWhere('pokemon.speed BETWEEN :speedMin AND :speedMax', {
          speedMin,
          speedMax,
        });
      } else if (speedMin !== undefined) {
        queryBuilder.andWhere('pokemon.speed >= :speedMin', { speedMin });
      } else if (speedMax !== undefined) {
        queryBuilder.andWhere('pokemon.speed <= :speedMax', { speedMax });
      }
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    queryBuilder.orderBy('pokemon.id', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Pokemon> {
    const pokemon = await this.pokemonRepository.findOne({ where: { id } });
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
    return pokemon;
  }

  async findFirst(limit: number = 10): Promise<Pokemon[]> {
    return this.pokemonRepository.find({
      take: limit,
      order: { id: 'ASC' },
    });
  }

  async getTypes(): Promise<string[]> {
    const types = await this.pokemonRepository
      .createQueryBuilder('pokemon')
      .select('DISTINCT pokemon.type1', 'type')
      .getRawMany();

    const types2 = await this.pokemonRepository
      .createQueryBuilder('pokemon')
      .select('DISTINCT pokemon.type2', 'type')
      .where('pokemon.type2 IS NOT NULL')
      .getRawMany();

    const allTypes = [...types, ...types2]
      .map((t) => t.type)
      .filter(Boolean)
      .sort();

    return [...new Set(allTypes)];
  }
}
