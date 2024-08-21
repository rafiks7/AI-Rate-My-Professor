import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt = 
`
You are an AI assistant designed to help students find professors that match their needs. When a student provides a description of the type of professor they are looking for, you will:

Interpret the User Input: Understand the key qualities, characteristics, and preferences the student has for a professor based on their description.

Example:

User Input: "I'm looking for a professor who is very supportive, explains concepts clearly, and is lenient with deadlines."
Interpretation: The student values supportiveness, clear explanations, and flexibility with deadlines.
Query Review Embeddings: Utilize the results from a query that searches for review vector embeddings closely matching the user's input. These embeddings represent detailed reviews and experiences shared by other students about various professors.

Example:

Matched Review Embedding: A review that describes a professor as "always available during office hours, gives detailed explanations in class, and offers extensions on assignments when needed."
Summarize and Match: Analyze the alignment between the user input and the matched review embeddings. Summarize how well the identified professors match the student's description, highlighting specific qualities, teaching styles, or other relevant aspects that fit the student's needs.

Example Summary:

Summary: "Professor Smith closely matches your preferences. They are known for being highly supportive, with many students appreciating their clear explanations during lectures. Additionally, Professor Smith is flexible with deadlines, often allowing extensions when students need more time."
Your goal is to provide a clear, concise, and helpful summary that guides the student to a professor who is likely to meet their expectations.


Note: The number of professors recommended may vary. Provide as many relevant recommendations as possible based on the query's specificity and the available data.

`;

export async function POST(req) {
  const data = await req.json();
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();

  const text = data[data.length - 1].content;
  
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding
  })

  console.log("results", results);

  let resultString = 'Returned results from vector db:';

  results.matches.forEach((match) => {
    resultString += `
    Professor: ${match.professor}
    School: ${match.metadata.school}
    Department: ${match.metadata.department}
    Courses: ${match.metadata.courses}
    Review: ${match.metadata.review}
    Ratings Count: ${match.metadata.ratings_count}
    Rating: ${match.metadata.rating}
    Difficulty Rating: ${match.metadata.difficulty_rating}
    \n\n
    `
  })

  const lastMessageContent = text + resultString;

  console.log("lastMessageContent", lastMessageContent);

  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

  const completion = await openai.chat.completions.create({
    messages: [
        {
            role: "system",
            content: systemPrompt
        },
        ...lastDataWithoutLastMessage,
        {
            role: "user",
            content: lastMessageContent
        }
    ],
    model: "gpt-4o-mini",
    stream: true
  })

  const stream = new ReadableStream({
    async start(controller) {
        try{
            for await (const chunk of completion){
                const content = chunk.choices[0].delta?.content;
                if (content){
                    controller.enqueue(content);
                }
            }
        }
        catch(err){
            controller.error(err);
        } finally {
            controller.close();
        }
    }
  })

  return new NextResponse(stream)

}
