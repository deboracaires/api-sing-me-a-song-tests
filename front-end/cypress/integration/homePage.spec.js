/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe("Home page", () => {
  it("should add a video successfully", () => {
    
    const video = {
      text: faker.lorem.paragraph(1),
      link: 'https://www.youtube.com/watch?v=6NXnxTNIWkc&list=RD6NXnxTNIWkc&start_radio=1&ab_channel=4NonBlondesVEVO',
    };
    
    cy.visit('http://localhost:3000');

    cy.get("#name").type(video.text);
    cy.get("#link").type(video.link);

    cy.get("#postButton").click();
    cy.reload();
  });

  it("upvote a video successfully", () => {
    cy.get("#upVote").click();
  });


  it("downvote a video successfully", () => {
    cy.get("#downVote").click();
  });

  it("play a video successfully", () => {
    cy.get("#youtubeLink").click();
  });
})