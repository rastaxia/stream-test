// Get references to HTML elements using their IDs
const form = document.getElementById("fairyTaleForm");
const nameInput = document.getElementById("name");
const stijlInput = document.getElementById("stijl");
const outputDiv = document.getElementById("output");

// Add a submit event listener to the form
form.addEventListener("submit", function (event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the values entered by the user for name and writing style
  const name = nameInput.value;
  const stijl = stijlInput.value;

  // Create a new EventSource to establish a connection for Server-Sent Events
  const eventSource = new EventSource(
    `/generate-fairy-tale?name=${encodeURIComponent(
      name
    )}&stijl=${encodeURIComponent(stijl)}`
  );

  // Define the behavior when a message is received from the Server-Sent Events stream
  eventSource.onmessage = function (event) {
    try {
      // Parse the received JSON data
      const data = JSON.parse(event.data);

      // Check if the data contains choices and is not empty
      if (data.choices && data.choices.length > 0) {
        // Extract the content of the first choice
        const content = data.choices[0].delta.content;
        console.log(content);

        // Check if the content is not an empty string before adding it to the output
        if (content.trim() !== "") {
          // Append the content to the outputDiv
          outputDiv.innerHTML += content;
        }
      }
    } catch (error) {
      // Handle errors related to invalid JSON structure
      console.error(
        "Invalid JSON structure. Expected properties are missing. Raw data:",
        event.data
      );

      // Close the EventSource connection in case of an error
      eventSource.close();
    }
  };

  // Define the behavior when an error occurs with the EventSource connection
  eventSource.onerror = function (error) {
    console.error("EventSource failed:", error);

    // Log more details about the error
    if (error.target.readyState === EventSource.CLOSED) {
      console.log("EventSource is closed.");
    } else {
      console.log("EventSource readyState:", error.target.readyState);
    }
  };
});
