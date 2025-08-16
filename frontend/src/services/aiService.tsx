import axios from "axios";

// This is a placeholder for the Gemini API service
// You'll need to replace the API_KEY with your actual Gemini API key in the .env file

// The base URL for the Gemini API - Updated to the correct endpoint
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Get the API key from environment variables
const getApiKey = () => {
  // Get the API key from the environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Log the API key status (not the actual key for security)
  console.log("Environment variables available:", Object.keys(import.meta.env));
  console.log(
    "Gemini API key status:",
    apiKey ? "Found" : "Not found (undefined)"
  );
  console.log(
    "API key value (first few chars):",
    apiKey ? apiKey.substring(0, 5) + "..." : "undefined"
  );

  if (!apiKey) {
    console.error("Gemini API key not found in environment variables.");
    throw new Error("Gemini API key not found in environment variables.");
  }

  return apiKey;
};

// Interface for the chat message
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Function to generate a response from Gemini
export const generateResponse = async (
  messages: ChatMessage[]
): Promise<string> => {
  try {
    const apiKey = getApiKey();

    // For Gemini, we need to convert the conversation history to the right format
    // We'll only send the most recent message, but include context from history
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();

    if (!lastUserMessage) {
      throw new Error("No user message found");
    }

    // Create a prompt that includes context from previous messages
    let prompt = lastUserMessage.content;

    if (messages.length > 1) {
      const context = messages
        .slice(0, -1) // Exclude the last message (which we're sending as the main prompt)
        .map(
          (msg) =>
            `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      // Add context to the beginning of the prompt
      prompt = `Here's the conversation history:\n${context}\n\nHuman: ${prompt}\nAssistant:`;
    }

    console.log("Making API request to:", GEMINI_API_URL);
    console.log("Prompt being sent:", prompt.substring(0, 100) + "...");

    // Make the API request - simplified payload structure
    const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    console.log("API response received:", response.status);

    // Extract and return the response text
    const responseText = response.data.candidates[0].content.parts[0].text;

    // Clean up any "Assistant:" prefix that might be in the response
    return responseText.replace(/^Assistant:\s*/i, "").trim();
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);

    // Log more detailed error information
    if (error.response) {
      console.error("API response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error details:", error.message);
    }

    // Also log the API URL being used (without the key)
    console.error("API URL:", GEMINI_API_URL);

    throw new Error(error.message || "Failed to generate response from AI");
  }
};

export default {
  generateResponse,
};
