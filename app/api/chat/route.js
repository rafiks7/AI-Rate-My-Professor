import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt = `
You are an AI designed to help students find professors that best fit their needs based on user descriptions. Your task is to process a user's input, which includes a description of the ideal professor they are looking for, and a list of professors that match that description.

Input:
- A textual description of the ideal professor (e.g., "Looking for a professor who is knowledgeable in machine learning and has a reputation for being approachable and supportive").
- A list of professors who match the description, each with detailed information including their name, school, subject, courses, reviews, and ratings.

Summary Task: Generate a concise summary that directly addresses the user's specific needs, clearly explaining how each professor aligns with those needs. Ensure that your summary is focused on responding to the user's input by highlighting the strengths of each professor that are most relevant to the description provided.

Instructions for Summary:
- For each professor, provide a brief and clear explanation of how they meet the user's criteria, focusing on relevant qualities such as subject expertise, teaching style, and student feedback.
- Use simple, conversational language and ensure that the summary is easy to understand.
- Incorporate sentiment analysis to align the tone of your summary with the user's expectations and preferences.

Example:

User Input:

Description: "I need a professor who specializes in data science, has published recent research, and is known for being engaging in lectures."

Matching Professors:

Dr. Jane Smith
Dr. Sarah Johnson

AI Summary:

Dr. Jane Smith at MIT is renowned for her cutting-edge research in data science and her dynamic, engaging lecture style. She consistently receives high praise for making complex topics accessible and interesting.

Dr. Sarah Johnson at Stanford University is another excellent choice. Although her primary focus is on Physics, her innovative teaching methods and passion for research make her lectures both informative and captivating."


Output Format:

The entire output should be formatted as a JSON object. 
Here is an example structure:
{
  professors:
 [
  {
    professor: "Dr. Emily Stone",
    subject: "Computer Science",
    rating: 4.8,
    summary: "Dr. Stone is a great professor who explains concepts clearly. Her lectures are engaging, and she is always willing to help students during office hours."
    link: "https://www.example.com/professor1"
  }
  ]
}

  Your entire response/output is going to consist of a single JSON object {}, and you will NOT wrap it within JSON md markers
`;

export async function POST(req) {
  const data = await req.json();
  console.log("data", data);
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();

  const message = data.message;
  console.log("message", message);

  const text = message.content;

  const filters = data.filters;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  let numberFilter = 3;
  let ratingFilter, subjectFilter, schoolFilter;

  if("number" in filters) {
    numberFilter = filters.number;
  }

  if ("rating" in filters) {
    ratingFilter = { $gte: filters.rating };
  }

  if ("subject" in filters) {
    subjectFilter = filters.subject;
  }

  if ("school" in filters) {
    schoolFilter = filters.school;
  }

  const results = await index.query({
    topK: numberFilter*5, // Increase the number of top results to ensure diversity
    includeMetadata: true,
    vector: embedding.data[0].embedding,
    filter: {
      rating: ratingFilter,
      subject: subjectFilter,
      school: schoolFilter,
    },
  });

  console.log("results", results);

  // Assume each result includes professor ID in metadata
  const professorMap = new Map();

  for (const result of results.matches) {
    const professorId = result.metadata.professor;
    if (!professorMap.has(professorId)) {
      professorMap.set(professorId, result);
    }

    // Stop if we have enough unique professors
    if (professorMap.size >= numberFilter) {
      break;
    }
  }

  // Convert the map values to an array and slice to get the top 3
  const uniqueResults = Array.from(professorMap.values()).slice(0, numberFilter);

  console.log("unique Results", uniqueResults);

  let resultString =
    "These are the results retrieved from a vector database about professor reviews:";

  uniqueResults.forEach((match) => {
    resultString += `
    \n
    Professor: ${match.metadata.professor}
    School: ${match.metadata.school}
    Subject: ${match.metadata.subject}
    Courses: ${match.metadata.courses}
    Review: ${match.metadata.review}
    Ratings Count: ${match.metadata.ratings_count}
    Rating: ${match.metadata.rating}
    Difficulty Rating: ${match.metadata.difficulty_rating}
    reference: ${match.metadata.link}
    \n\n
    `;
  });

  const newMessageContent = text + `\nI expect ${numberFilter} professors in the output.\n` + resultString;

  console.log("newMessageContent:", newMessageContent);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: newMessageContent,
      },
    ],
    model: "gpt-4o-mini",
    stream: false,
  });

  console.log("completion", completion.choices[0].message?.content);

  /*
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0].delta?.content;
          if (content) {
            controller.enqueue(content);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
  */

  return new NextResponse(completion.choices[0].message?.content);
}
