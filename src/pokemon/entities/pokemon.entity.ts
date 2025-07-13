import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Favorite } from 'src/favorites/entities/favorite.entity';

@Entity('pokemon')
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  type1: string;

  @Column({ nullable: true })
  type2: string;

  @Column()
  total: number;

  @Column()
  hp: number;

  @Column()
  attack: number;

  @Column()
  defense: number;

  @Column()
  spAttack: number;

  @Column()
  spDefense: number;

  @Column()
  speed: number;

  @Column()
  generation: number;

  @Column({ default: false })
  legendary: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Favorite, favorite => favorite.pokemon)
  favorites: Favorite[];
}