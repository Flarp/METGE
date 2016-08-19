"use strict"

const METGE = require("../metge.js")
const state = METGE.game.state

let look = function(arr) {
    switch(arr[0]) {
        case "around":
            METGE.output(state.currentRoom.description)
            break;
        default: 
            METGE.output("Try looking another way.")
    }
}

let go = function(arr) {
    switch(arr[0]) {
        case "through":
            
            break;
    }
}

let Main = new METGE.game.Room({ description: "You seem to be trapped in a dungeon. In front of you is a door." })

let name = function(oldVar, newVar) {
    METGE.output(`Greetings, ${newVar}.`)
}

let currentRoom = function(oldVar, newVar) {
    
        METGE.output(newVar.description)
    
}

let my = function(arr) {
    if (arr[0] == "name" && arr[1] == "is") {
        if (state.name) {
            METGE.output("I already know who you are!")
        } else {
            state.name = arr.slice(2, arr.length).join(" ")
            state.currentRoom = METGE.game.rooms.Main
        }
        
    } else {
        METGE.output("What? I didn't understand you")
    }
}

module.exports = {
    commands: {
            look: look,
            my: my,
            go: go
        },
    rooms: {
            Main: Main
        },
    stateChange: {
        currentRoom: currentRoom,
        name: name
    }
}