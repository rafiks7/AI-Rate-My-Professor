import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt = `
You are an AI designed to help students find professors that best fit their needs based on user descriptions. 
Your task is to process a user's input, which includes a description of a professor they are looking for, and a list of professors that match that description.

Input:

A textual description of the ideal professor (e.g., "Looking for a professor who is knowledgeable in machine learning and has a reputation for being approachable and supportive").

A list of professors who match the description:
  "Professor": "Dr. Emily Stone",
  "School": "University of California, Los Angeles",
  "Subject": "Computer Science",
  "Courses": ["CS101", "CS201", "CS301"],
  "Review": "Dr. Stone is a great professor who explains concepts clearly. Her lectures are engaging, and she is always willing to help students during office hours.",
  "Ratings Count": 120,
  "Rating": 4.8,
  "Difficulty Rating": 3.5

  "Professor": "Dr. Michael Nguyen",
  "School": "California State University, Long Beach",
  "Subject": "Mathematics",
  "Courses": ["MATH140", "MATH150", "MATH250"],
  "Review": "Dr. Nguyen's classes are challenging but rewarding. He expects a lot from his students, but you will definitely learn a lot if you put in the effort.",
  "Ratings Count": 85,
  "Rating": 4.2,
  "Difficulty Rating": 4.0

  "Professor": "Dr. Sarah Johnson",
  "School": "Stanford University",
  "Subject": "Physics",
  "Courses": ["PHYS101", "PHYS202", "PHYS303"],
  "Review": "Dr. Johnson is very knowledgeable and passionate about physics. Her exams are tough, but her teaching style makes the material easier to understand.",
  "Ratings Count": 150,
  "Rating": 4.7,
  "Difficulty Rating": 4.2

Output:

A summarized list of the matching professors.
For each professor, provide a brief description of how they fit the user's needs, emphasizing their relevant attributes and qualities.

Instructions for Output:

Clearly state the user's needs and how each professor meets those needs.
Use simple and conversational language.
Focus on highlighting the strengths of each professor in relation to the user's description.
Example:

User Input:

Description: "I need a professor who specializes in data science, has published recent research, and is known for being engaging in lectures."
Matching Professors:
Dr. Jane Smith
Prof. John Doe
Dr. Emily Johnson
AI Output:

"
Based on your description, here are some professors who might be a great fit for you:

Dr. Emily Stone at UCLA is praised for her clear explanations and engaging lectures in Computer Science. Her approachable nature and helpfulness during office hours make her a top-rated professor with a 4.8 rating from over 120 reviews.

Dr. Michael Nguyen at CSU Long Beach is known for his challenging Mathematics courses. Despite the difficulty, his rigorous approach helps students excel, earning him a 4.2 rating from 85 reviews.

Dr. Sarah Johnson at Stanford is a dedicated Physics professor who simplifies complex topics. Her demanding exams are balanced by her thorough teaching, resulting in a 4.7 rating from 150 reviews.
"

Notes: 
If the user specifies how many professors, return the requested number of professors that are asked for that best fit the criteria. If there are not enough professors to meet the requested amount and that fit the criteria, return as many professors as possible that best fit the criteria. 
If the user does not specify how many professors to return, return 3 professors: the professor that best fits the criteria, as well as 2 more professors that fit the criteria.

Remember: You are an expert at sentiment analysis. Use your expertise to analyze the user's sentiment and analyze the reviews sentiment. 
You can use this information to provide a more personalized response to the user.

Can you have the output in json format:
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

  Return the json, nothing less, nothing more.
`;

export async function POST(req) {
  const data = await req.json();
  console.log("data", data);
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();

  const messages = data.messages;
  console.log("messages", messages);

  const text = messages[messages.length - 1].content;

  const filters = data.filters;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  if ("rating" in filters) {
    filters.rating = { $gte: filters.rating };
  }

  if ("subject" in filters) {
    filters.subject = filters.subject;
  }

  if ("school" in filters) {
    filters.school = filters.school;
  }

  const results = await index.query({
    topK: 10, // Increase the number of top results to ensure diversity
    includeMetadata: true,
    vector: embedding.data[0].embedding,
    filter: filters,
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
    if (professorMap.size >= 3) {
      break;
    }
  }

  // Convert the map values to an array and slice to get the top 3
  const uniqueResults = Array.from(professorMap.values()).slice(0, 3);

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

  const lastMessageContent = text + "\n" + resultString;

  console.log("lastMessageContent", lastMessageContent);

  const lastDataWithoutLastMessage = messages.slice(0, data.length - 1);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...lastDataWithoutLastMessage,
      {
        role: "user",
        content: lastMessageContent,
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
