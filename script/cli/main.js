// <!-- <#
// .NOTES
//     Developer      : Emad Adel
//     GitHub         : https://github.com/emadadel4
//     © 2024 Emad Adel. All rights reserved.
// #> -->

const inputField = document.getElementById('input');
const outputDiv = document.getElementById('output');
const clockDiv = document.getElementById('clock'); // Get clock div

// Load existing commands from localStorage or initialize an empty object
let urlMapping = JSON.parse(localStorage.getItem('mycommands')) || {
    yt: 'https://www.youtube.com/@emadadel4',
    github: 'https://github.com/emadadel4',
    blog: 'https://emadadel4.github.io/'
};

// Load command history from localStorage or initialize an empty array
let commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];
let commandHistoryIndex = -1; // To track the current position in the command history

// Define commands
const commands = {
    about: () => {
        return "Developer: emadadel\n© 2024 Emad Adel. All rights reserved.\n"+
        "telegram: https://t.me/emadadel4  \n"+
        "Github: https://github.com/emadadel4"
        ;              
    },
    help: () => {
        return "Available commands:\n" +
               "help - Show this help message\n" +
               "clear - Clear the terminal\n" +
               "cls - Clear the terminal\n" +
               "print [text] - Display the text\n" +
               "open [keyword] - Open the specified URL\n" +
               "newurl [keyword] [url] - Add a new URL mapping\n" +
               "mycommands - Show all stored commands\n" +
               "search [query] - Search DuckDuckGo for the query";
    },
    clear: () => {
        outputDiv.innerHTML = ""; // Clear output
    },
    cls: () => {
        outputDiv.innerHTML = ""; // Clear output
    },
    print: (args) => {

         return displayOutput(args.join(" "), "info","1");

    },
    open: (args) => {
        if (args.length === 0) {
            return displayOutput("Usage: open [keyword]","info","1");
        }
        const keyword = args[0].toLowerCase(); // Get the keyword
        const url = urlMapping[keyword]; // Get the corresponding URL

        if (url) {
            // Open the URL in a new tab
            window.open(url, '_blank');
            return displayOutput(`🌐 Opening ${url}...`, "info","1"); 
        } else {

            // No URL found message
            return displayOutput(`❌ No URL found. Make sure you've added it, Type "mycommands" to see url list`,"error", "1"); 
        }
    },
    newurl: (args) => {
        if (args.length < 2) {
            return "Usage: newurl [keyword] [url]";
        }
        const keyword = args[0].toLowerCase(); // Get the keyword
        const url = args.slice(1).join(" "); // Join remaining args as the URL

        // Add new keyword and URL to the mapping
        urlMapping[keyword] = url;

        // Save updated mapping to localStorage
        localStorage.setItem('mycommands', JSON.stringify(urlMapping));

        return `Added new url command: ${keyword} -> ${url}`;
    },
    mycommands: () => {
        return Object.entries(urlMapping)
            .map(([key, value]) => `${key} -> ${value}`)
            .join("\n") || "No custom commands found.";
    },
    search: (query) => {
        const searchQuery = query.join(" ").trim(); // Join the arguments to form the search query and trim whitespace
        if (searchQuery === "") {
            return "Usage: search [query] - Please provide a search term."; // Return a message if the search query is empty
        }
        const searchUrl = `https://duckduckgo.com/?t=ffab&q=${encodeURIComponent(searchQuery)}`; // Construct the search URL
        window.open(searchUrl, '_blank'); // Open search in a new tab
        return `Searching for: ${searchQuery}`; // Return the search query confirmation
    }
};

// Function to update the clock
function updateClock() {
    const now = new Date(); // Get current time
    let hours = now.getHours(); // Get hours

    const minutes = String(now.getMinutes()).padStart(2, '0'); // Format minutes
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Format seconds
    
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM
    hours = hours % 12; // Convert to 12-hour format
    hours = hours ? String(hours).padStart(2, '0') : '00'; // Format hours, convert 0 to 12 for AM/PM

    clockDiv.textContent = `${hours}:${minutes} ${ampm}`; // Update clock div
}

// Update the clock every second
setInterval(updateClock, 1000); // Call updateClock every 1000 milliseconds (1 second)

// Add event listener for input field
inputField.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const userInput = inputField.value.trim(); // Trim any extra whitespace
        if (userInput) {
            processCommand(userInput);
            commandHistory.push(userInput); // Add to history
            commandHistoryIndex = commandHistory.length; // Reset index

            // Save command history to localStorage
            localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
        }
        inputField.value = ''; // Clear input field
    } else if (event.key === 'ArrowUp') {
        // Navigate up in the command history
        if (commandHistoryIndex > 0) {
            commandHistoryIndex--;
            inputField.value = commandHistory[commandHistoryIndex]; // Set input value to the previous command
        }
    } else if (event.key === 'ArrowDown') {
        // Navigate down in the command history
        if (commandHistoryIndex < commandHistory.length - 1) {
            commandHistoryIndex++;
            inputField.value = commandHistory[commandHistoryIndex]; // Set input value to the next command
        } else {
            commandHistoryIndex = commandHistory.length; // Reset index if at the end
            inputField.value = ''; // Clear input field
        }
    } else if (event.key === 'Tab') {
        event.preventDefault(); // Prevent the default tab action
        const currentInput = inputField.value.trim();
        if (currentInput) {
            const matchingCommands = getMatchingCommands(currentInput); // Get commands matching the current input
            if (matchingCommands.length === 1) {
                // If there's only one match, complete it
                inputField.value = matchingCommands[0] + ' '; // Complete the command
            } else if (matchingCommands.length > 1) {
                // If multiple matches, display them
                displayOutput(`Possible commands: ${matchingCommands.join(', ')}`);
            }
        }
    }
});

// Load command history on initialization
commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];
commandHistoryIndex = commandHistory.length; // Set the current index to the length of the history

function processCommand(input) {
    const args = input.split(" "); // Split input into command and arguments
    const command = args[0].toLowerCase(); // Convert command to lowercase
    const commandArgs = args.slice(1); // Remaining words are the arguments

    if (commands[command]) {
        // Execute command if it exists
        const output = commands[command](commandArgs);
        if (output !== undefined) {
            displayOutput(output); // Display command output
        }
    } else {
        displayOutput(`<h5>❌ Unknown command. Type 'help' to see the list of available commands.</h5>`, "error", "1"); // Command not found message
    }
}

// Function to render output to the terminal with clickable URLs
function displayOutput(output, level, fontsize) {
    const outputLine = document.createElement('div');
    outputLine.classList.add('your-class-name');
    outputLine.id = level;

    // Set the font size if provided
    if (fontsize) {
        outputLine.style.fontSize = fontsize + 'rem'; 
    }


    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const formattedOutput = output.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" class="link">${url}</a>`;
    });

    // Use switch to handle different levels
    switch(level) {
        case "info":
            outputLine.style.color = 'white'; 
            break;
        case "warning":
            outputLine.style.color = 'orange'; 
            break;
        case "error":
            outputLine.style.color = 'red'; 
            break;
        default:
            outputLine.style.color = 'white';
            break;
    }

    // Set the inner HTML with formatted output
    outputLine.innerHTML = formattedOutput; 
    outputDiv.appendChild(outputLine);
    outputDiv.scrollTop = outputDiv.scrollHeight; // Scroll to the bottom
}


// Function to get matching commands
function getMatchingCommands(input) {
    // Get commands that start with the current input
    return Object.keys(commands).filter(cmd => cmd.startsWith(input));
}



function focusInput() {
    document.getElementById('input').focus();
}

// Initialize clock display on load
updateClock();
