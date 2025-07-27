import "dotenv/config";
import fetch from 'node-fetch';

export const getOpenAIResponse = async (messages) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-haiku",
      messages
    }),
  };

  try {
    console.log("Sending request to OpenRouter (https://openrouter.ai/api/v1/chat/completions)...");
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      options
    );
    const data = await response.json();

    // Log the full response for debugging
    console.log("Full response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${
          data.error?.message || "Unknown error"
        }`
      );
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Unexpected response format from API");
    }

    const content = data.choices[0].message.content;
    console.log("Generated content:", content);
    return content;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error.message || 'Failed to generate response');
  }
};


