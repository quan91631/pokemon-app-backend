import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
// import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':pokemonId')
  async addFavorite(
    // @CurrentUser() user: User,
    @Param('pokemonId', ParseIntPipe) pokemonId: number,
  ) {
    return this.favoritesService.addFavorite(1, pokemonId);
  }

  @Delete(':pokemonId')
  async removeFavorite(
    // @CurrentUser() user: User,
    @Param('pokemonId', ParseIntPipe) pokemonId: number,
  ) {
    await this.favoritesService.removeFavorite(1, pokemonId);
    return { message: 'Favorite removed successfully' };
  }

  @Get()
  async getUserFavorites() {
    // @CurrentUser() user: User
    return this.favoritesService.getUserFavorites(1);
  }

  @Get(':pokemonId/status')
  async checkFavoriteStatus(
    // @CurrentUser() user: User,
    @Param('pokemonId', ParseIntPipe) pokemonId: number,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(1, pokemonId);
    return { isFavorite };
  }
}
