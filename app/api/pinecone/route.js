import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function POST(req) {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("rag").namespace("ns3");

  const results = await index.listPaginated();
  //console.log('results', results);

  const listIds = await results["vectors"];
  //console.log('listIds', listIds);

  const IDs = listIds.map((id) => id.id);
  //console.log('IDs', IDs);

  const fetchResult = await index.fetch(IDs);
  //console.log("fetchResult", fetchResult);

  const records = await fetchResult["records"];
  //console.log("Records", records);

  const metadata = Object.values(records).map((record) => record.metadata);
  //console.log("MetaData", metadata);

  const allSubjects = metadata.flatMap((record) => record.subject);
  const uniqueSubjects = [...new Set(allSubjects)];

  //console.log("subjects", uniqueSubjects);

  const allSchools = metadata.flatMap((record) => record.school);
  const uniqueSchools = [...new Set(allSchools)];

  //console.log('schools', uniqueSchools); 

  const response ={
    "subjects": uniqueSubjects,
    "schools": uniqueSchools
  };

  //console.log('respoen from server side:', response)

  return new NextResponse(JSON.stringify(response));
}
