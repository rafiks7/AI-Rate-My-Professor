import { JSDOM } from "jsdom";
import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export async function POST(req) {
  const data = await req.json();
  const url = data.data;

  const response = await fetch(url);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const profReview = await scrape(document, url);

  await load(profReview);

  return new NextResponse(profReview);
}

const scrape = async (document, url) => {
  const profName = document
    .querySelector(".NameTitle__Name-dowf0z-0")
    ?.textContent?.trim();

  const schoolName = document
    .querySelector(".NameTitle__Title-dowf0z-1")
    ?.querySelectorAll("a")[1]
    ?.textContent?.trim();

  const courses = document.querySelectorAll(
    ".RatingHeader__StyledClass-sc-1dlkqw1-3"
  );
  let coursesArray = [];
  courses.forEach((course) => {
    coursesArray.push(course.textContent?.trim() || "");
  });
  coursesArray = new Set(coursesArray);
  coursesArray = Array.from(coursesArray);

  let rating = document
    .querySelector(".RatingValue__Numerator-qw8sqy-2")
    ?.textContent?.trim();
  rating = rating ? parseFloat(rating) : null;

  const subject = document
    .querySelector(".TeacherDepartment__StyledDepartmentLink-fl79e8-0")
    ?.textContent
    ?.replace(/\s*department/i, '')
    ?.trim();

  let difficulty = document
    .querySelectorAll(".FeedbackItem__FeedbackNumber-uof32n-1")[1]
    ?.textContent?.trim();
  difficulty = difficulty ? parseFloat(difficulty) : null;

  let ratingsCount = document
    .querySelector(".RatingValue__NumRatings-qw8sqy-0")
    ?.querySelector("a")
    ?.textContent?.trim();
  ratingsCount = ratingsCount
    ? parseInt(ratingsCount.replace(/[^\d]/g, ""), 10)
    : null;

    const reviews = document.querySelectorAll(".Comments__StyledComments-dzzyvm-0");
    let reviewsArray = [];
    
    // Iterate over the NodeList and collect reviews
    reviews.forEach((review, index) => {
      if (index < 15) { // Limit to the first 20 reviews
        reviewsArray.push(review.textContent?.trim() || "");
      }
    });
    

  const profReview = {
    professor: profName,
    school: schoolName,
    subject: subject,
    courses: coursesArray,
    rating: rating,
    ratings_count: ratingsCount,
    difficulty_rating: difficulty,
    reviews: reviewsArray,
    link: url,
  };

  return profReview;
};

const load = async (profReview) => {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pc.index("rag");

  const client = new OpenAI();

  const reviews = profReview["reviews"];
  const combinedReviews = reviews.join('\n\n');
  console.log("combinedReviews", combinedReviews);


  const response = await client.embeddings.create({
    input: reviews,
    model: "text-embedding-3-small",
  });

  const embedding = response.data[0].embedding;

  /*
  const processed_data = [{
    values: embedding,
    id: profReview["professor"],
    metadata: {
      professor: profReview["professor"],
      reviews: reviews,
      school: profReview["school"],
      subject: profReview["subject"],
      courses: profReview["courses"],
      rating: profReview["rating"],
      ratings_count: profReview["ratings_count"],
      difficulty_rating: profReview["difficulty_rating"],
      link: profReview["link"],
    },
  }]
    */
  
  const processed_data = await Promise.all(
    reviews.map(async (review, index) => {
      const response = await client.embeddings.create({
        input: review,
        model: "text-embedding-3-small",
      });
      const embedding = response.data[0].embedding;
      return {
        values: embedding,
        id: `${profReview["professor"]}-${index}`,
        metadata: {
          professor: profReview["professor"],
          reviews: combinedReviews,
          school: profReview["school"],
          subject: profReview["subject"],
          courses: profReview["courses"],
          rating: profReview["rating"],
          ratings_count: profReview["ratings_count"],
          difficulty_rating: profReview["difficulty_rating"],
          link: profReview["link"],
        },
      };
    })
    
  );


  await index.namespace("ns3").upsert(processed_data);
};
