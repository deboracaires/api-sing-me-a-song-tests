import  { jest } from '@jest/globals';
import { recommendationRepository } from '../../src/repositories/recommendationRepository';
import { CreateRecommendationData, recommendationService } from '../../src/services/recommendationsService.js';
import { createRecommendation, recommendationData } from '../factories/recommendationFactory.js';
import { prisma } from '../../src/database.js';
import { Recommendation } from '.prisma/client';

describe("insert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })
  it("should create a recommendation given valid body", async () => {
    const recommendation = recommendationData();

    jest
      .spyOn(recommendationRepository, 'findByName')
      .mockResolvedValue(null);
    
    const recommendationRepositoryCreate = jest
      .spyOn(recommendationRepository, "create")
      .mockResolvedValue(null);

    await recommendationService.insert(recommendation);
    
    expect(recommendationRepositoryCreate).toBeCalledTimes(1);
  });
  it("should throw a conflictError when name already exists", async () => {
    const recommendation: Recommendation = await createRecommendation();

    jest
      .spyOn(recommendationRepository, 'findByName')
      .mockResolvedValue(recommendation);
    
    const insertData: CreateRecommendationData = { name: recommendation.name, youtubeLink: recommendation.youtubeLink };

    expect(async () => {
      await recommendationService.insert(insertData);
    }).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique"})
  });
});

describe("getByIdOrFail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })
  it("should return with a recommendation when given valid id", async () => {
    const recommendation: Recommendation = await createRecommendation();

    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(recommendation);

    const result = await recommendationService.getById(recommendation.id);
      
    expect(result.id).not.toBe(undefined);
  });
  it("should throw a notFoundError when id is not registered", async () => {
    const recommendation: Recommendation = recommendationData();

    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(null);
  
    expect(async () => {
      await recommendationService.getById(recommendation.id)
    }).rejects.toEqual({ type: "not_found", message: ""});
  });
});

describe("upvote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })
  it("should upvote a recommendation given valid id", async () => {
    const recommendation: Recommendation = await createRecommendation();
    
    const recommendationRepositoryUpdateScore = jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue({ score: 1, ...recommendation });

    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(recommendation);
  
    await recommendationService.upvote(recommendation.id);
      
    expect(recommendationRepositoryUpdateScore).toBeCalledTimes(1);
  });
  it("should throw a notFoundError when id is not registered", async () => {
    const recommendation: Recommendation = recommendationData();
  
    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(null);
  
    expect(async () => {
      await recommendationService.upvote(recommendation.id);
    }).rejects.toEqual({ type: "not_found", message: ""})
  });
});

describe("downvote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })
  it("should downvote a recommandation given valid id", async () => {
    const recommendation: Recommendation = await createRecommendation();
      
    const recommendationRepositoryUpdateScore = jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue({ score: 1, ...recommendation });
  
    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(recommendation);
    
    await recommendationService.downvote(recommendation.id);
        
    expect(recommendationRepositoryUpdateScore).toBeCalledTimes(1);
  });
  it("should remove a recommandation if scores gets less than -5", async () => {
    const recommendation: Recommendation = await createRecommendation();
      
    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(recommendation);

    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue({ ...recommendation, score: -6 });
  

    const recommendationRepositoryRemove = jest
      .spyOn(recommendationRepository, 'remove')
      .mockResolvedValue(null);
    
    await recommendationService.downvote(recommendation.id);
        
    expect(recommendationRepositoryRemove).toBeCalledTimes(1);
  });
  it("should throw a notFoundError when id is not registered", async () => {
    const recommendation: Recommendation = recommendationData();
    
    jest
      .spyOn(recommendationRepository, 'find')
      .mockResolvedValue(null);
    
    expect(async () => {
      await recommendationService.downvote(recommendation.id);
    }).rejects.toEqual({ type: "not_found", message: ""})
  });
});

describe("get", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })

  it("should return with all recommendations", async () => {
    const recommendations: Recommendation[] = [];

    for (let i = 0; i < 10; i++) {
      const recom = await createRecommendation();
      recommendations.push(recom);
    }
    const recommendationRepositoryFindAll = jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue(recommendations);

    await recommendationService.get();

    expect(recommendationRepositoryFindAll).toBeCalledTimes(1);
  })
});

describe("getTop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })
  
  it("should return with the number of recommendations given amount", async () => {
    const recommendations: Recommendation[] = [];

    for (let i = 0; i < 10; i++) {
      const recom = await createRecommendation();
      recommendations.push(recom);
    }
    const recommendationRepositoryAmountByScore = jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockResolvedValue(recommendations);

    const result = await recommendationService.getTop(10);
  
    expect(result).toHaveLength(10);
    expect(recommendationRepositoryAmountByScore).toBeCalledTimes(1);
  })
});

describe("getRandom", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    truncateRecommendations();
  });
  afterAll(() => {
    disconnect();
  })
    
  it("should return with an random recommendation", async () => {
    const recommendations: Recommendation[] = [];
  
    for (let i = 0; i < 10; i++) {
      const recom = await createRecommendation();
      recommendations.push(recom);
    }

    jest
      .spyOn(global.Math, 'random');
    
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue(recommendations);

    jest
      .spyOn(global.Math, 'floor');

    jest
      .spyOn(global.Math, 'random');
  
    const result = await recommendationService.getRandom();
    
    expect(result.id).not.toBe(undefined);
  });

  it("should return with 0 recommendation when there's nothing registered", async () => {
    jest
      .spyOn(global.Math, 'random');
    
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue([]);
    
    expect(async () => {
      await recommendationService.getRandom();
    }).rejects.toEqual({ type: 'not_found', message: "" });
  })
});

async function disconnect() {
  await prisma.$disconnect();
}
  
async function truncateRecommendations() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}