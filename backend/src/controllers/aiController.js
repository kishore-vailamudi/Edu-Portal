const axios = require("axios");

// The base URL for the Gemini API - Using a model from the provided list
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

// Get the API key from environment variables
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key:", apiKey ? "Found" : "Not found");

  if (!apiKey) {
    console.error("Gemini API key not found in environment variables.");
    throw new Error("Gemini API key not found in environment variables.");
  }

  return apiKey;
};

// Generate a response using the Gemini API
exports.generateResponse = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const apiKey = getApiKey();
    console.log("Using API URL:", GEMINI_API_URL);

    // Convert messages to the format expected by Gemini API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    console.log("Making Gemini API request");
    console.log("Messages count:", formattedMessages.length);

    // Make the API request with the correct format for gemini-1.5-flash
    const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    console.log("API response received with status:", response.status);

    // Extract the response text
    const responseText = response.data.candidates[0].content.parts[0].text;

    res.status(200).json({
      message: "Response generated successfully",
      response: responseText,
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Log more detailed error information
    if (error.response) {
      console.error("API response error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    res.status(500).json({
      message: "Failed to generate response from AI",
      error: error.message,
    });
  }
};
