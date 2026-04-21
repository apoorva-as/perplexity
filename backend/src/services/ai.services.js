import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { searchInternet } from "./internet.service.js";

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

let agent;

function getAgent() {
    if (!agent) {
        const model = new ChatMistralAI({
            model: "mistral-medium-latest",
            apiKey: process.env.MISTRAL_API_KEY
        })
        agent = createReactAgent({
            llm: model,
            tools: [ searchInternetTool ],
        })
    }
    return agent;
}

export async function generateResponse(messages) {
    console.log(messages)

    const response = await getAgent().invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant like Perplexity AI.
                You MUST ALWAYS use the "searchInternet" tool for ANY question about news, current events, latest updates, prices, weather, sports scores, or anything that may have changed recently.
                Never answer from memory for time-sensitive topics. Always search first, then answer based on results.
            `),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            }))
        ]
    });

    return response.messages[ response.messages.length - 1 ].content;

}

export async function generateChatTitle(message) {
    const model = new ChatMistralAI({
        model: "mistral-medium-latest",
        apiKey: process.env.MISTRAL_API_KEY
    })
    const response = await model.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words.
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
        `)
    ])

    return response.content;

}
