import app from '../../src/app.js';
import supertest from 'supertest';
import { prisma } from '../../src/database.js';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';
import { createRecommendation, createRecommendationData } from '../factories/recommendationFactory.js';

describe("POST /recommendations", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("given a valid body and unique name should return 201", async () => {
    const recommendation: CreateRecommendationData = createRecommendationData();
    const response = await supertest(app).post("/recommendations").send({ name: recommendation.name, youtubeLink: recommendation.youtubeLink });
    expect(response.status).toBe(201);
  });
  it("given an invalid body should return 422", async () => {
    const invalidRecommendation = { };
    const response = await supertest(app).post("/recommendations").send({ invalidRecommendation });
    expect(response.status).toBe(422);
  });
  it("given a valid body and an not unique name should return 409", async () => {
    const recommendationData = await createRecommendation();
    const response = await supertest(app).post("/recommendations").send({ name: recommendationData.name, youtubeLink: recommendationData.youtubeLink });
    expect(response).toBe(409);
  });
});

describe("GET /recommendations", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("should return with max 10 recommendations given ordered on register", async () => {
    for (let i = 0; i < 20; i++) await createRecommendation();
    const response = await supertest(app).get('/recommendations');
    expect(response.body).toHaveLength(10);
  });
  it("should return with 0 recommendations when recommendations is empty", async () => {
    const response = await supertest(app).get('/recommendations');
    expect(response.body).toHaveLength(0);
  });
});

describe("GET /recommendations/random", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("should return an random single recommendation", async () => {
    for (let i = 0; i < 5; i++) await createRecommendation();
    const response = await supertest(app).get('/recommendations/random');
    expect(response.status).toBe(200);
    expect(response.body.id).not.toBe(undefined);
  });
  it("should return status 404 when there's nothing registered", async () => {
    const response = await supertest(app).get('/recommendations/random');
    expect(response.status).toBe(404);
  });

});

describe("GET /recommendations/top/:amount", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("should return with top amount given requested and registered", async () => {
    for (let i = 0; i < 10; i++) await createRecommendation();
    const response = await supertest(app).get('/recommendations/top/5');
    expect(response.body).toHaveLength(5);
  });

  it("should return with top amount according registered", async () => {
    for (let i = 0; i < 3; i++) await createRecommendation();
    const response = await supertest(app).get('/recommendations/top/5');
    expect(response.body).toHaveLength(3);
  });
  it("should return with 0 recommendation when there's nothing registered", async () => {
    const response = await supertest(app).get('/recommendations/top/5');
    expect(response.body).toHaveLength(0);
  });
});

describe("GET /recommendations/:id", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("should return with a single recommendation given a valid id", async () => {
    const recommendationData = await createRecommendation();
    const response = await supertest(app).get(`/recommendations/${recommendationData.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).not.toBe(undefined);
  });
  it("should return status 404  given an invalid id", async () => {
    const response = await supertest(app).get(`/recommendations/1`);
    expect(response.status).toBe(404);
    expect(response.body.id).toBe(undefined);
  });
});

describe("POST /recommendations/:id/upvote", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("should return status 404  given an invalid id", async () => {
    const response = await supertest(app).post(`/recommendations/1/upvote`);
    expect(response.status).toBe(404);
    expect(response.body.id).toBe(undefined);
  });
  it("should return status 200 given a valid id", async () => {
    const recommendationData = await createRecommendation();
    const response = await supertest(app).post(`/recommendations/${recommendationData.id}/upvote`);
    expect(response.status).toBe(200);
  });
});

describe("POST /recommendations/:id/downvote", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);

  it("should return status 404  given an invalid id", async () => {
    const response = await supertest(app).post(`/recommendations/1/downvote`);
    expect(response.status).toBe(404);
    expect(response.body.id).toBe(undefined);
  });
  it("should return status 200 given a valid id", async () => {
    const recommendationData = await createRecommendation();
    const response = await supertest(app).post(`/recommendations/${recommendationData.id}/downvote`);
    expect(response.status).toBe(200);
  });
});

async function disconnect() {
  await prisma.$disconnect();
}

async function truncateRecommendations() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}
