// Import required modules
const express = require("express");
const OpenAI = require("openai");
const path = require("path");

// Set the OpenAI API key as an environment variable
process.env.OPENAI_API_KEY = "Eigen API KEY";

// Create an instance of the OpenAI class
const openai = new OpenAI();

// Create an Express application
const app = express();

// Define the port to listen on, using the specified port or defaulting to 3000
const port = process.env.PORT || 3000;

// Serve the HTML file
app.use(express.static(path.join(__dirname, "../")));

// Handle form submission
app.get("/generate-fairy-tale", async (req, res) => {
  // Extract query parameters (name and style) from the request
  const { name, stijl } = req.query;

  // Define a prompt for generating a fantasy story based on user input
  const prompt = `Schrijf me een fantasy verhaal waar de hoofdperson ${name} heet, dit verhaal moet een heroes journey hebben,
   het verhaal moet in de schrijfstijl van ${stijl} ook wil ik graag dat het verhaal een titel heeft. het verhaal moet minimum 2000 woorden hebben geef het een html formaat.`;

  try {
    // Use the OpenAI API to generate a chat-based completion for the given prompt
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4",
      temperature: 0.6,
      stream: true,
    });

    // Set response headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Handle the PassThrough stream events
    completion.response.body.on("data", (chunk) => {
      // Write each chunk of data to the response stream
      res.write(`${chunk.toString()}\n\n`);
    });

    // End the response when the stream is complete
    completion.response.body.on("end", () => {
      res.end();
    });
  } catch (error) {
    // Handle errors, log them, and send a 500 Internal Server Error status
    console.error("Error generating fairy tale:", error);
    res.status(500).end();
  }
});

// Start the Express application, listening on the specified port
app.listen(port, () => {
  console.log(`Visit http://localhost:${port}`);
});
