import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt = 
`
You are an AI designed to help students find professors that best fit their needs based on user descriptions. Your task is to process a user's input, which includes a description of a professor they are looking for, and a list of professors that match that description.

Input:

A textual description of the ideal professor (e.g., "Looking for a professor who is knowledgeable in machine learning and has a reputation for being approachable and supportive").
A list of professors who match the description.
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

"Based on your description, here are some professors who might be a great fit for you:

Dr. Jane Smith: Dr. Smith is a renowned expert in data science and has recently published influential research in the field. Her lectures are highly engaging, and she is known for her ability to make complex topics accessible and interesting.

Prof. John Doe: Prof. Doe also specializes in data science and has an impressive record of recent publications. He is well-regarded for his interactive teaching style, which keeps students actively involved and motivated.

Dr. Emily Johnson: Dr. Johnson is a leading researcher in data science with a strong focus on practical applications. Her classes are known for being dynamic and thought-provoking, and she is praised for her approachability and willingness to help students outside of class.

Note: Please return 3 professors not just the best one
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
    topK: 10, // Increase the number of top results to ensure diversity
    includeMetadata: true,
    vector: embedding.data[0].embedding
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

  let resultString = 'Returned results from vector db:';

  uniqueResults.forEach((match) => {
    resultString += `
    Professor: ${match.metadata.professor}
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
