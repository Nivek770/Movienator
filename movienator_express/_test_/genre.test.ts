import {
  afterAll,
  beforeAll,
  describe,
  expect,
  beforeEach,
  it,
} from '@jest/globals';
import { TestDatabaseManager } from './test_utils/TestDatabaseManager';
import app from '../app';
import Genre from '../entity/genre';
import request from 'supertest';

beforeAll(async () => {
  try {
    await TestDatabaseManager.getInstance().connectTestDatabase();
  } catch (error) {
    console.log(error);
  }
}, 10_000);

afterAll(async () => {
  await TestDatabaseManager.getInstance().resetTestDatabase();
});

beforeEach(async () => {
  try {
    await TestDatabaseManager.getInstance().resetTestDatabase();
    await createTestData();
  } catch (error) {
    console.log(error);
  }
}, 10_000);

async function createTestData() {
  let gen1: Genre = new Genre();
  gen1.genreId = 1;
  gen1.genreName = 'Aaa';
  await gen1.save();
  let gen2: Genre = new Genre();
  gen2.genreId = 2;
  gen2.genreName = 'Bbb';
  await gen2.save();
}

describe('Testing Genre getAll', () => {
  describe('Testing getAll Route', () => {
    it('Should return a list of Genres', async () => {
      let response = await request(app).get('/genre/all');
      expect(response.statusCode).toBe(200);
      const resGens = response.body.data as Genre[];
      expect(resGens.length).toBe(2);
      expect(resGens.at(0).genreName).toBe('Aaa');
      expect(resGens.at(1).genreName).toBe('Bbb');
    });

    it('Should not return a genre after it has been removed', async () => {
      let gen: Genre[] = await Genre.find();
      for (const oneGen of gen) {
        await oneGen.remove();
      }
      let response = await request(app).get('/genre/all');
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });
});
