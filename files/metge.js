var METGE = {}

if (typeof BROWSER == "undefined") { // BROWSER is a variable webpack injects into all files when it's packing it
    var universe = global // global is Node.js's global scope
} else {
    var universe = window // window is the global scope in browsers
}

universe.METGE = {}; // create an object in the global scope of the environment


module.exports = universe.METGE