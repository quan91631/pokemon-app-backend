import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('favorites')
@Unique(['user', 'pokemon'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pokemonId' })
  pokemon: Pokemon;
}
