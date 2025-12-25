import { Memory, SearchResult } from "mem0ai/oss";
import * as dotenv from "dotenv";
import { Messages } from "./types/types";

dotenv.config();

const config = {
    enableGraph: true,
    graphStore: {
      provider: "neo4j",
      config: {
        url: "bolt://localhost:7687",
        username: process.env.NEO4J_USERNAME!,
        password: process.env.NEO4J_PASSWORD!,
        database: "neo4j",
      },
    },
    llm: {
        provider: "openai",
        config: {
            model: "gpt-4.1"
        }
    },
    vector_store: {
        provider: "qdrant",
        config: {
            collection_name: "test",
            host: "localhost",
            port: 6333,
            embedding_model_dims: 1536,
        }
    },
    embedder: {
        provider: "openai",
        config: {
            model: "text-embedding-3-small",
            embedding_dims: 1536
        }
    }
};

const memory = new Memory(config);

export async function store_mem0(messages:Messages,userId:string){
    await memory.add(messages,{userId});
}

export async function search_mem0(query:string,userId:string):Promise<SearchResult>{
    return await memory.search(query,{userId,limit:10});
}