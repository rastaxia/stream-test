// Get references to HTML elements using their IDs
const extraBtn = document.querySelector("#extra");
const form = document.querySelector("#fairyTaleForm");
let nameInput = document.querySelector("#name");
const stijlInput = document.querySelector("#stijl");
const outputDiv = document.querySelector("#output");
const onderwerpInput = document.querySelector("#onderwerp");
let extra = false;
let keywords = [];

extraBtn.addEventListener("click", function () {
  const add = document.querySelector(".addChar");
  extra = true;
  let names = document.querySelector(".names");
  names.innerHTML += `
  <span class="divider">
  <label for="extraName">Extra karakter naam</label>
  <input type="text" name="extraName" id="extraName" placeholder="Daantje" required />
  </span>
  `;
  add.style.display = "none";
});

// Add a submit event listener to the form
form.addEventListener("submit", function (event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the values entered by the user for name and writing style
  const stijl = stijlInput.value;
  const onderwerp = onderwerpInput.value;
  let name = ""; // Define name variable here
  let extraName = "";
  if (extra === true) {
    // Get the extraName input dynamically
    const extraNameInput = document.querySelector("#extraName");
    extraName = extraNameInput ? extraNameInput.value : "";

    // Get the name input dynamically
    const nameInputDynamic = document.querySelector("#name");
    name = nameInputDynamic ? nameInputDynamic.value : "";
  } else {
    // Get the name input
    const nameInputStatic = document.querySelector("#name");
    name = nameInputStatic ? nameInputStatic.value : "";
  }

  // Create a new EventSource to establish a connection for Server-Sent Events
  let eventSource = "";
  if (extra === false) {
    eventSource = new EventSource(
      `/generate-fairy-tale?name=${encodeURIComponent(
        name
      )}&onderwerp=${encodeURIComponent(onderwerp)}&stijl=${encodeURIComponent(
        stijl
      )}`
    );
  } else {
    eventSource = new EventSource(
      `/generate-fairy-tale?name=${encodeURIComponent(
        name
      )}&extraName=${encodeURIComponent(
        extraName
      )}&onderwerp=${encodeURIComponent(onderwerp)}&stijl=${encodeURIComponent(
        stijl
      )}`
    );
  }

  // Define the behavior when a message is received from the Server-Sent Events stream
  eventSource.onmessage = function (event) {
    try {
      // Parse the received JSON data
      const data = JSON.parse(event.data);
      // Check if the data contains choices and is not empty
      if (data.choices && data.choices.length > 0) {
        // Extract the content of the first choice
        const content = data.choices[0].delta.content;

        // Check if the content is not an empty string before adding it to the output
        if (content.trim() !== "") {
          // Append the content to the outputDiv

          outputDiv.insertAdjacentHTML("beforeend", content);
        }
      }
    } catch (error) {
      // Handle errors related to invalid JSON structure
      console.error("Invalid JSON structure.", event.data);

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
