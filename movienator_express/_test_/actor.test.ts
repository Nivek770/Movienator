import {
  describe,
  expect,
  afterAll,
  beforeAll,
  it,
  beforeEach,
} from '@jest/globals';
import { TestDatabaseManager } from './test_utils/TestDatabaseManager';
import Actor from '../entity/actor';
import app from '../app';
import request from 'supertest';
import Movie from '../entity/movie';

beforeAll(async () => {
  await TestDatabaseManager.getInstance().connectTestDatabase();
}, 10_000);

afterAll(async () => {
  await TestDatabaseManager.getInstance().resetTestDatabase();
});

beforeEach(async () => {
  await TestDatabaseManager.getInstance().resetTestDatabase();
  await createTestData();
}, 10_000);

async function createTestData() {
  const actor1: Actor = new Actor();
  actor1.actorId = 1;
  actor1.name = 'Kevin';
  actor1.movies = [];
  await actor1.save();

  const actor2: Actor = new Actor();
  actor2.actorId = 2;
  actor2.name = 'Andreas';
  actor2.movies = [];
  await actor2.save();

  const movie1: Movie = new Movie();
  movie1.movieId = 1;
  movie1.title = 'Movie';
  movie1.adultContent = false;
  movie1.actors = [actor1];
  await movie1.save();
}

describe('ActorTests', () => {
  describe('getAll route', () => {
    describe('good case', () => {
      it('Should return all actors in the database', async () => {
        const response = await request(app).get('/actor/all');
        expect(response.statusCode).toBe(200);
        const allActors: Actor[] = response.body.data;
        expect(allActors.length).toBe(2);
        expect(allActors[0].name).toBe('Andreas');
      });

      it('Should return the actors with filled movies array', async () => {
        const response = await request(app).get('/actor/all');
        expect(response.statusCode).toBe(200);
        const allActors: Actor[] = response.body.data;
        expect(allActors.length).toBe(2);
        expect(allActors[1].movies.length).toBe(1);
      });
    });
    describe('bad cases', () => {
      describe('given no actors exist', () => {
        // second;
      });
    });
  });

  describe('Testing getOne Route', () => {
    it('Should return a single actor with movies filled', async () => {
      const response = await request(app).get('/actor/one/1');
      expect(response.statusCode).toBe(200);
      const actor: Actor = response.body.data;
      expect(actor.actorId).toBe(1);
      expect(actor.movies.length).toBe(1);
    });

    it("Should return 404 if actor doesn't exist", async () => {
      const response = await request(app).get('/actor/one/10');
      expect(response.statusCode).toBe(404);
    });

    it('Inserting a movie should automatically insert actors', async () => {
      const movie: Movie = await Movie.findOne({
        where: { movieId: 1 },
        relations: { actors: true },
      });
      const actor3: Actor = new Actor();
      actor3.actorId = 3;
      actor3.name = 'Nick';
      actor3.movies = [];
      movie.actors.push(actor3);
      await movie.save();

      const response = await request(app).get('/actor/one/3');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Testing getActorsToMovie Route', () => {
    it('Should return all actors to that movie with movies array filled', async () => {
      const response = await request(app).get('/actor/movie/1');
      expect(response.statusCode).toBe(200);
      const actors: Actor[] = response.body.data as Actor[];
      expect(actors.length).toBeGreaterThanOrEqual(1);
      expect(actors[0].name).toBe('Kevin');
      expect(actors[0].movies.length).toBeGreaterThanOrEqual(1);
    });

    it("Should return 404 if the actor doesn't exist", async () => {
      const response = await request(app).get('/actor/movie/10');
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Testing putActor Route', () => {
    it('Should update the actor in the database', async () => {
      const actor: Actor = await Actor.findOne({ where: { actorId: 1 } });
      actor.name = 'Gideon';
      const response = await request(app).put('/actor/').send(actor);
      expect(response.statusCode).toBe(201);
      expect(response.body.data.name).toBe('Gideon');
    });

    it("Should return 404 if the actor doesn't exist", async () => {
      const actor: Actor = await Actor.findOne({ where: { actorId: 1 } });
      actor.actorId = 10;
      const response = await request(app).put('/actor/').send(actor);
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Testing delete Actor Route', () => {
    it('Should delete the actor from the database', async () => {
      const actorResponse = await request(app).get('/actor/one/1');
      expect(actorResponse.statusCode).toBe(200);
      const response = await request(app).delete('/actor/1');
      expect(response.statusCode).toBe(204);
      const actor = await Actor.findOne({ where: { actorId: 1 } });
      expect(actor).toBeNull();
    });

    it("Should return 404 if the actor doesn't exist", async () => {
      const response = await request(app).delete('/actor/10');
      expect(response.statusCode).toBe(404);
    });
  });
});
