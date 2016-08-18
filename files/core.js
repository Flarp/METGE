"use strict"

const METGE = require("./metge.js")

if (typeof BROWSER == "undefined") {
    var NODE = true
}

if (NODE) {
    let dir = require("require-dir")
    var extensions = dir("./extensions")
} else {
    var extensions = require.context("./extensions", false, /\.js$/)
    let returnVal = {}
    extensions.keys().map(key => returnVal[/^.*(?=(\.js))/.exec(key)[0]] = require(__dirname + "/extensions" + key.substring(1, key.length)))
    extensions = returnVal;
}

if (NODE) { // Game is being played through Node.js

    const readline = require("readline");
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    METGE.output = function(string) { 
        rl.question(string + "\n", (answer) => {
            METGE.input(answer);
        });
        
    };
    
    
} else if (BROWSER) { // Game is being played through browser
    METGE.output = function(string) {
        console.log(string)
    }
} else { // Game is being played through a toaster
    document.write("What are you even playing on? This is 2016!");
}



METGE.setOutputElement = function(e) {
    METGE.output = function(string) {
        e.innerHTML += `<p>${string}</p><br>`
        e.scrollTop = e.scrollHeight
    }
}

let output = METGE.output

METGE.input = function(string) {
    
    let split = string.split(" ");
    let cmdTest = split[0].toLowerCase()
    if (game.commands[cmdTest]) {
        game.commands[cmdTest](split.slice(1, split.length))
    } else {
        METGE.output("You don't know how to do that.");
    }
};


METGE.game = {
    
    
    commands: {
        help: function(arr) {
            output(`The available commands are -
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
                let result = new extensions[key].character(options)
                for (key in result) {
                    this[key] = result[key]
                }
            }
        }
        
        
        
    },
    
    Room: function(options) {
        this.items = options.items || null
        this.description = options.description || null
        
        for (let key in extensions) {
        
            if (extensions[key].room) {
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
        
            if (extensions[key].item) {
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

METGE.stateHandler = function(state, action) {
    state = state || {}
    switch (action.type) {
        case "set":
            Object.keys(action.object).map(key => state[key] = action.object[key])
            break;
        case "push":
            state[action.key].push(action.value)
            break;
    }
    return state
}

let game = METGE.game

game.state = {}

for (let key in extensions) {
    if (extensions[key].state) {
        Object.keys(extensions[key].state).map((val) => game.state[val] = extensions[key].state[val])
    }
}

let handler = {
    get: function(target, name) {
        return target[name]
    },
    set: function(obj, prop, val) {
        let old = obj[prop];
        obj[prop] = val;
        if (game.stateChange[prop]) {
            game.stateChange[prop](old, val)
        }
        return val;
    }
}

game.initState = game.state
        
game.state = new Proxy(game.initState, handler)



if (NODE) {
    let dir = require("require-dir")
    var addins = dir("./addins")
} else {
    var addins = require.context("./addins", false, /\.js/)
    let returnVal = {}
    addins.keys().map(key => returnVal[/^.*(?=(\.js))/.exec(key)[0]] = require(__dirname + "/addins" + key.substring(1, key.length)))
    addins = returnVal;
}


game.stateChange = {}



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
        
        
        
     

