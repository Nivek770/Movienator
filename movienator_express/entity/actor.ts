import { BaseEntity, Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import Movie from './movie';

@Entity()
export default class Actor extends BaseEntity {
  @PrimaryColumn()
  actorId: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.actors)
  movies: Movie[];
}
