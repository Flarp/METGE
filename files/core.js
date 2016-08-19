"use strict"

const METGE = require("./metge.js")

METGE.unknownCommand = "You don't know how to do that."

if (typeof BROWSER == "undefined") {  // BROWSER is a variable webpack injects into all files when it's packing it
    var NODE = true
}

if (NODE) {
    let dir = require("require-dir")
    var extensions = dir("./extensions") // require an entire directory of files 
} else {
    var extensions = require.context("./extensions", false, /\.js$/) // halfway requires all files in a directory via webpack
    let returnVal = {}
    extensions.keys().map(key => returnVal[/^.*(?=(\.js))/.exec(key)[0]] = require(__dirname + "/extensions" + key.substring(1, key.length))) // get all javascript files in a directory via regular expressions, then require them
    extensions = returnVal;
}

if (NODE) { // Game is being played through Node.js

    const readline = require("readline");
    let rl = readline.createInterface({ // creates a readline interface in Node.js where the console can take input.
        input: process.stdin,
        output: process.stdout
    });
    
    METGE.outputNewLines = 0 // the "line" event listener for read lines is triggered whenever a new line is printed to stdout (usually the console), either by a function or the user doing it manually by pressing ENTER. However, the METGE output function logs a string and then appends a newline to it, which triggers the line event listener. We don't want that, so we need a way around it.
    METGE.totalNewLines = 0; // so, two variables are created, the number of times output has sent a newline to stdout (METGE.outputNewLines), and the number of times total a newline has been sent to output (METGE.totalNewLines). (Note: Anytime you hit enter in a console environment, a newline is sent to the process.)
    
    METGE.output = function(string) { 
        METGE.outputNewLines++ // Increment the METGE.outputNewLines variable
        
        rl.write(string + "\n") // Write the string to stdout with the troublemaking newline.
        
    };
    
        rl.on("line", (input) => { // The readline interface has detected a newline, so the event has been triggered
            METGE.totalNewLines++ // Here's where the solution comes in. Every time a newline is logged to stdout (the console, for the most part), a variable that stores the total new lines is incremented. Also, remember that every time METGE.output() runs, it increments a variable that stores how many times it has logged a newline to console. 
            if (METGE.totalNewLines > METGE.outputNewLines) { // If the only thing that is logging newlines to stdout is the METGE.output() function, METGE.outputNewLines will be equal to METGE.totalNewLines. If the totalNewLines is greater, this means the user has sent a newline to the console from the user by hitting enter, so reset both variables and store the input to be processed as a command.
                METGE.totalNewLines = 0;
                METGE.outputNewLines = 0;
                METGE.input(input.trim()) // trim whitespace to prevent a space from being sent.
                
            }
        })
    
    
    
    
    
} else if (BROWSER) { // Game is being played through browser
    METGE.output = function(string) {
        console.log(string)
    }
} else { // Game is being played through a toaster
    document.write("What are you even playing on? This is 2016!");
}



METGE.setOutputElement = function(element) {
    METGE.output = function(string) { // pretty self explanitory, sets the METGE.output() function to instead of logging to a console, append it's output as a paragraph element to an HTML element, and then append a line break to it.
        element.innerHTML += `<p>${string}</p><br>` 
        element.scrollTop = element.scrollHeight // scrollTop is how far away from the top the scrollbar is in a scrollable element. Setting it to the height of the element scrolls to the bottom, so everything this function runs the scroll bar is set to the bottom, where new messages are being outputted.
    }
}

let output = METGE.output

METGE.input = function(string) {
    
    let split = string.split(" "); // get all the words from the input.
    let cmdTest = split[0].toLowerCase() // lowercase it for less headache
    if (game.commands[cmdTest]) { // if it's a command
        game.commands[cmdTest](split.slice(1, split.length)) // pass the rest of the words to the command handler
    } else {
        METGE.output(METGE.unknownCommand); // if the first word is not a command, scold the user
    }
};


METGE.game = {
    
    
    commands: {
        help: function(arr) {
            METGE.output(`The available commands are -
            ${Object.keys(METGE.game.commands).sort().map(command => ` ${command}`)}
            ${typeof BROWSER != "undefined" ? `<br><br>` : ""}
For details on each command, check the GitHub wiki page.
            `);
            
        }
    },
    Character: function(options) {
        this.name = options.name || null;
        this.gender = options.gender || "O";
        this.diedAt = null;
        this.HP = options.HP || 100;
        this.relationship = options.relationship || "neutral";
        this.inParty = options.inParty || false;
        for (let key in extensions) {
        
            if (extensions[key].character) {
                let result = new extensions[key].character(options) // this is why the Character extension is a function constructor, options are passed to it, and the resulting object is added to the "this" value of the Character constructor below.
                for (key in result) {
                    this[key] = result[key] // magic
                }
            }
        }
        
        
        
    },
    
    Room: function(options) {
        this.items = options.items || null
        this.description = options.description || null
        
        for (let key in extensions) {
        
            if (extensions[key].room) { // just check Character for an explanation of the below code
                let result = new extensions[key].room(options)
                for (key in result) {
                    this[key] = result[key]
                }
            }
        }
        
    },
    
    Item: function(options) {
        this.isWeapon = options.isWeapon || false
        this.damage = options.damage || 0
        
        
        for (let key in extensions) {
        
            if (extensions[key].item) { // just check Character for an explanation of the below code
                let result = new extensions[key].item(options)
                for (key in result) {
                    this[key] = result[key]
                }
            }
        }
    },
    
    rooms: {
        
    },
    
    
    
};

let game = METGE.game 

game.state = {}

for (let key in extensions) {
    if (extensions[key].state) {
        Object.keys(extensions[key].state).map((val) => game.state[val] = extensions[key].state[val]) // loop over every loaded extension, map over each key in a state extension if there is one, and add it to the game's state.
    }
}

let handler = {
    get: function(target, name) {
        return target[name]
    },
    set: function(obj, prop, val) {
        let old = obj[prop];
        obj[prop] = val;
        if (game.stateChange[prop]) { // if there is a handler for this property, pass the old value, and the new value to the function handler.
            game.stateChange[prop](old, val)
        }
        return val;
    }
}

game.initState = game.state
        
game.state = new Proxy(game.initState, handler) // Proxies are this cool new ES6 feature that allow you to trap requests to get and set items in an object. Check the handler object to see how this works.



if (NODE) { // check the extensions block above for an explanation of the below code
    let dir = require("require-dir")
    var addins = dir("./addins")
} else {
    var addins = require.context("./addins", false, /\.js/)
    let returnVal = {}
    addins.keys().map(key => returnVal[/^.*(?=(\.js))/.exec(key)[0]] = require(__dirname + "/addins" + key.substring(1, key.length)))
    addins = returnVal;
}


game.stateChange = {}


// load all state change event listeners (but they're not really event listeners)
for (let attr in addins) {
        for (let prop in addins[attr].stateChange) {
            game.stateChange[prop] = addins[attr].stateChange[prop] 
        }
    }    
       





       
// Load the commands from the plugins
    for (let attr in addins) {
            if (addins[attr].commands) {
                for (let prop in addins[attr].commands) {
                    game.commands[prop] = addins[attr].commands[prop]
                }
            } else {
                
            }
        }
        

// Load the rooms from the plugins        
    for (let attr in addins) {
            
                for (let prop in addins[attr].rooms) {
                    game.rooms[prop] = addins[attr].rooms[prop]
                }
            
        }
        
        
        
     

