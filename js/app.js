// Import required modules
const express = require("express");
const OpenAI = require("openai");
const path = require("path");

// Set the OpenAI API key as an environment variable
process.env.OPENAI_API_KEY = "own key";

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
  const { name, onderwerp, stijl, extraName } = req.query;

  try {
    // Use the OpenAI API to generate a chat-based completion for the given prompt
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `(variabel 1), (variabel 2), (variabel 3) controleer in elke denkbare context of deze variabelen aanstootgevend, obsceen, seksueel, racistisch of gewelddadig zijn voor kinderen. Het kan zijn dat er ook nog een (variabel 4) is; als deze leeg is, doe hier dan niets mee. 
            Als de variabelen kindvriendelijk zijn, schrijf dan een fantasieverhaal waar de hoofdpersonage ${name} heet. Voeg de naam ${extraName} toe als variabel 4 niet leeg is. Als deze leeg is of niet bestaat, doe er dan niets mee. 
            Dit verhaal moet een hero's journey hebben; het onderwerp is ${onderwerp} en het verhaal moet geschreven zijn in de stijl van ${stijl}. 
            Geef het verhaal ook een titel. Het verhaal moet minimaal 2000 woorden bevatten. 
            Je hoeft niet te vermelden of het verhaal kindvriendelijk is; je kunt direct met het verhaal beginnen. Als dit niet het geval is, genereer dan alleen de woorden (NIET kindvriendelijk).
            Genereer ook 3 keywords; laat de keywords slechts 1 woord lang zijn. Deze keywords moeten gebruikt kunnen worden om 1 foto per keyword te zoeken die goed bij het verhaal past. 
            Beschrijf de keywords als eerste bovenaan het verhaal voordat de titel wordt genoemd; DOE HET ALTIJD ALS VOLGT: Keywords: keyword1, keyword2, keyword3, .!!!! De keywords moeten geen namen zijn van de karakters.
            Je hoeft niet te vermelden in welke stijl het is geschreven of wat het doel van het verhaal was ook hoef je niet te zeggen story. zet de output in een JSON formaat.`,
        },
        {
          role: "user",
          content: `Variabel 1 = ${name} ; Variabel 2 = ${onderwerp} ; Variabel 3 = ${stijl} ; Variabel 4 = ${extraName}`,
        },
      ],
      model: "gpt-3.5-turbo-1106",
      // test only
      // model: "gpt-4-1106-preview",
      temperature: 0.6,
      stream: true,
      response_format: { type: "json_object" },
      top_p: 1,
      n: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
    });

    // Set response headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let count = 0;
    let test = "";
    // Handle the PassThrough stream events
    completion.response.body.on("data", (chunk) => {
      // Write each chunk of data to the response stream
      // res.write(`${chunk.toString().replace(/(?:\r\n|\r|\n)/g, "")}\n\n`);
      if (count == 0) {
        test = chunk.toString();
        // console.log("TEST1 = " + test);
      } else if (count == 1) {
        test += chunk.toString();
        res.write(`${test}\n\n`);
        // console.log("TEST2 = " + test);
      } else {
        res.write(`${chunk.toString()}\n\n`);
        // console.log("TEST3 = " + chunk.toString());
      }
      count++;
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
