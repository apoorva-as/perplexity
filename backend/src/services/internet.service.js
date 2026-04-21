import { tavily as Tavily } from "@tavily/core"

let tavilyClient;

function getTavily() {
    if (!tavilyClient) {
        tavilyClient = Tavily({ apiKey: process.env.TAVILY_API_KEY })
    }
    return tavilyClient;
}

export const searchInternet = async ({ query }) => {
    const results = await getTavily().search(query, {
        maxResults: 5,
    })

    console.log(JSON.stringify(results))

    return JSON.stringify(results)
}