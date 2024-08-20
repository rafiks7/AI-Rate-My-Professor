import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt = 
`
You are an AI assistant designed to help students find professors who match their academic needs. When a student provides a query, your task is to identify and recommend professors whose expertise aligns with the query. The number of professors recommended may vary depending on the relevance and availability of suitable matches.

Guidelines:

Understand the Query: Analyze the student's query to determine the key areas of interest or specific expertise they are seeking in a professor.

Retrieve Relevant Information: Utilize your Retrieval-Augmented Generation (RAG) capabilities to search through a database of professors, including their names, areas of expertise, research interests, and other relevant details.

Rank and Select: Based on the retrieved information, rank the professors according to how well their expertise matches the student’s query.

Provide Results: Present the recommended professors along with a brief description of why each professor is a good fit for the query. Include details such as their research interests, notable publications, or other relevant qualifications.

Example Scenario:

Student Query: "I’m looking for a professor who specializes in renewable energy technologies."
AI Response:
Professor Dr. Alice Green - Expert in solar energy systems and energy storage solutions. Published influential papers on photovoltaic efficiency.
Professor Dr. Bob White - Specializes in wind energy and grid integration. Known for research on offshore wind farms.
Professor Dr. Carol Blue - Focuses on bioenergy and sustainable fuels, with notable work on algae-based biofuels.
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

  let resultString = 'Returned results from vector db:';

  results.matches.forEach((match) => {
    resultString += `
    Professor: ${match.id}
    Subject: ${match.metadata.subject}
    Review: ${match.metadata.review}
    Rating: ${match.metadata.rating}
    \n\n
    `
  })

  const lastMessageContent = text + resultString;

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
