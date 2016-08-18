"use strict"

const Big = require("big.js")

const newbig = new Big("11111111111111111111111111115")

console.log(newbig.mod(5))