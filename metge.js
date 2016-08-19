"use strict"

const METGE = require("./files/metge.js")

const core = require("./files/core.js") // Where the input and output is stored
const game = METGE.game

METGE.start = function() {
    METGE.output("What is your name? Enter it in the format \"My name is {name}\"")
}

if (typeof window == "undefined") {
    METGE.start()
}

