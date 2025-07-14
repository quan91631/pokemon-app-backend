import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { PokemonService } from '../pokemon/pokemon.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    private pokemonService: PokemonService,
  ) {}

  async addFavorite(userId: number, pokemonId: number): Promise<Favorite> {
    const pokemon = await this.pokemonService.findOne(pokemonId);

    const existingFavorite = await this.favoritesRepository.findOne({
      where: { user: { id: userId }, pokemon: { id: pokemonId } },
    });

    if (existingFavorite) {
      throw new ConflictException('Pokemon already in favorites');
    }

    const favorite = this.favoritesRepository.create({
      user: { id: userId } as User,
      pokemon: { id: pokemonId },
    });

    return this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userId: number, pokemonId: number): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user: { id: userId }, pokemon: { id: pokemonId } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoritesRepository.find({
      where: { user: { id: userId } },
      relations: ['pokemon'],
    });
  }

  async isFavorite(userId: number, pokemonId: number): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user: { id: userId }, pokemon: { id: pokemonId } },
    });
    return !!favorite;
  }
}
