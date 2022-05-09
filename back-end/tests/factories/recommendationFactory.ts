import { prisma } from '../../src/database.js';
import faker from '@faker-js/faker';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';
import { Recommendation } from '.prisma/client';

export async function createRecommendation () {
  const recommendation: CreateRecommendationData = {
    name: faker.lorem.sentence(),
    youtubeLink: "https://www.youtube.com/watch?v="+ faker.lorem.word(),
  }

  const insertedRecommendation = await prisma.recommendation.create({
    data: recommendation,
  });

  return insertedRecommendation;
}

export function createRecommendationData () {
  const recommendation: CreateRecommendationData = {
    name: faker.lorem.sentence(),
    youtubeLink: "https://www.youtube.com/watch?v="+ faker.lorem.word(),
  }
  
  return recommendation;
}

export function recommendationData () {
  const recommendation: Recommendation = {
    id: Number(faker.random.numeric(5)),
    name: faker.lorem.sentence(5),
    score: Number(faker.random.numeric(1)),
    youtubeLink: "https://www.youtube.com/watch?v="+ faker.lorem.word(),
  }

  return recommendation;
}
