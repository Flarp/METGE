# METGE: The Multi-Environment Text-Game Engine

## What is METGE?

METGE is a text-based game engine/API. That probably sounds dumb, like why would you need a text-based game API? Well, if you're developing for Node.js or Javascript (browser) exclusively, you probably don't. However, the METGE API allows you to develop for *both at once*. Simply run the metge.js file in a Node.js environment, and you can enjoy your text-based adventure from there. Or, you could use the webpack config that the package comes with, webpack everything, and deliver the same file to a browser, in which you could either interact with the file from a console, which is the default, or you could set the game up to display its output to HTML elements, which will be later on. 

With that said, here is the API.

## Functions

#### ```METGE.start()```

Starts the game.

#### ```METGE.output(string)```

Outputs a string to the destination, the console in Node.js, browser console, or an HTML element. (Note: Don't add newlines to your strings, it will be done automatically. If you do, everything will break.)

#### ```METGE.input(string)```

Takes a string, splits the string into an array of words, then sees if the first word in the array is a command. If so, the rest of the array will be passed to the function defining the command. (For defining a command, see [Addins](#addins))

#### ```METGE.setOutputElement(element)```

Redirects all output to a specified HTML element. Should be called before ```METGE.start()```, or the first message will be printed to the console.

## Constructors

#### <a name="room"></a>```METGE.game.Room(options)```

Creates a new Room object. Options are taken in the form of an object. The comments in the source code explain it better, check [```core.js```](https://github.com/Flarp/METGE/blob/master/files/core.js)

#### ```METGE.game.Character(options)```

Creates a new Character object. Options are taken in the form of an object. The comments in the source code explain it better, check [```core.js```](https://github.com/Flarp/METGE/blob/master/files/core.js)

#### ```METGE.game.Item(options)```
 
Creates a new Item object. Options are taken in the form of an object. The comments in the source code explain it better, check [```core.js```](https://github.com/Flarp/METGE/blob/master/files/core.js)

## State

Stored in ```METGE.game.state```. 

The game's state is stored in a [```Proxy```](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object. The only thing you need to know is the set trap of it. Whenever you change a property, a function is called from the ```stateChange``` object loaded from an [Addin](#addins). The name of this function must correspond with the name of the changed property, and take two arguments, the old value, and the new value of the changed property. (Don't worry if this is confusing, it's explained later on.)

By default, the game's state includes a ```name``` property, which stores the name of the player, and a ```currentRoom``` property, which stores a [```Room```](#room) object. More properties can be added with [Extensions](#extensions).

## <a name="extensions"></a>Extensions

Extensions are METGE's way of extending constructors in the API. Say, you want the [```Character```](#character) object to have a ```hasKey``` property, or something of the sort. To do this, the constructor needs to be edited before it's called, and that's where extensions come it. It *extends* the constructor of an object, and modifies it, so that constructor will now have that property.

Here's an example of an extension file.

```javascript
// notice "extension" is a constructor, and not an object.

let extension = function(options) { // options from the parent object (what you are extending) are passed down to the extension
    this.hasKey = options.hasKey || 0 // it's always good to have a default when setting something, because options won't always define a "hasKey" property
}

module.exports = { // this file is being required by the main METGE program, so it needs to be a module (Note, you don't have to edit the METGE program to require it, it automatically does that for you)
    Character: { // we are extending the "Character" constructor, so we put that here
        extension: extension
    }
}

```

And that's it! That method allows you to extend multiple constructors, so every time a Character constructor is called, it will have a ```foo``` property!

You can extend the ```Room``` constructor, the ```Character``` constructor, and the ```Item``` constructor using constructor functions. 

Extending the initial state, however, is different. You have to use an object, because there is only one state, so there is no need to use a constructor.

```javascript
let extendedState = {
    someProp: someVal
}

module.exports = {
    state: {
        extendedState: extendedState
    }
}

```

Store this in the ```files/extensions``` directory, and METGE will automatically pick it up.

## <a name="addins"></a> Addins

Addins are slightly different from extensions, as they don't extend, or modify, constructors, rather, they add new things. Commands, functions that run on a state change, rooms, characters, and items are the things you can create with addins. 

Addins and extensions cannot be in the same file, because addins use the constructors you modified with your extensions file and does something with them.

Currently, there is only support for adding new rooms and commands, along with functions that fire when a property in the game's state changes. Soon you will be able to add in your own items and characters, which should be in an upcoming commit.

To add your own things in, the layout is almost identical to the way extensions are done, however slightly different. To start off, let's make a command. A command in METGE is the first word you type when inputting something. So, for example, if you typed "go to door", the command here is "go". 

On that note, let's create a command called "jump".

```javascript

let jump = function(arr) { // the name of the function must be the name of the command, that's just how METGE works.
    // the function has been passed an array, there are all the words that were put after the word "jump". So, if somebody were to type "jump onto wall", arr would be ["onto, wall"]
    if (arr[0] == "up") {
        METGE.output("You jumped up!") // using METGE.output allows METGE to take care of where your text is displayed.
    } else {
        METGE.output("I don't know how to jump that way.") // deal with somebody trying to jump into space or something
    }
}

module.exports = {
    commands: {
        jump: jump
    }
}

```

Put this in your ```files/addins``` folder, and run it. Now you can (kind of) jump, cool!

## A quick tutorial

Alright, so with the basics of addins and extensions out of the way, let's try and make our own little game!

First, we need to create an extension file, so we can create our rooms and stuff. Here is the content of ```my-extension.js``` as of now.

```javascript
module.exports = {
    
}
```

Empty, so we need to add something. Let's extend the character constructor, and give all created characters a "isArmed" property

```javascript

let CharacterExtension = function(options) { // remember, options from the main character constructor are passed to all extensions!
    this.isArmed = options.isArmed || false
}

module.exports = {
    character: CharacterExtension
}

```

Awesome! Now all characters created from now on will have an isArmed property, that will be either set from the options object, or default to false. Remember that all extensions except state take constructor functions as their input, and only one extension per parent constructor (character, room, item) can made per file. This is invalid -

```javascript

let CharacterExtension = function(options) { // remember, options from the main character constructor are passed to all extensions!
    this.isArmed = options.isArmed || false
}

module.exports = {
    character: {
        CharacterExtension: CharacterExtension // can't do this!
    }
}
```

That's cool and all, but what good is a character if you can't interact with them? Let's make some commands! Remember in METGE that commands work by the *first word* that the user inputs. All other words will be passed to the command function as an array. With that being said, let's make a "say" command! (Note, right now, you can't interact with characters, but this will be added soon.) First, let's create a file called ```my-addin.js``` in the ```files/addins``` directory. Then, hit it! (Note, you *can* have more than one addin for the addin-able objects (commands, rooms, characters, items, etc))

```javascript

const METGE = require("../metge.js") // in order to access the METGE object, we need to require it from the parent directory (that's what the ".." is)


let say = function(arr) { // arr is an array of all words typed after "say". If the user types "say something cool", arr will be ["something", "cool"]
    METGE.output("You said " + arr.join(" "))
}

module.exports = {
    commands: { 
        say: say
    }
}
```

Neato!

Now, what if we want to keep track of when a user says something? Like, state! We can extend the state with a ```hasSpoken``` property, so we can keep track of anytime a user has spoken! Why don't we do so now? Go back to your ```my-extension.js``` file and add this to it.

Remember, state is the only extension that does not take a constructor as it's extender, it takes an object.

```javascript

let CharacterExtension = function(options) { 
    this.isArmed = options.isArmed || false
}

let stateExtender = {
    hasSpoken: false
}

module.exports = {
    character: CharacterExtension,
    state: stateExtender
}

```

Awesome!

Now, what happens if the ```hasSpoken``` value in that state changes? Thanks to ES6 proxies, we'll know! 

We're gonna need to open back up our ```my-addin.js``` file, and add some more stuff.

```javascript

const METGE = require("../metge.js")


let hasSpoken = function(oldVar, newVar) { // the function will be passed the old variable, and the new variable from the state.
    if (oldVar === false && newVar === true) { // the user hadn't spoke before, but now they have
        METGE.output("You have spoken.")
    }
}

let say = function(arr) { 
    METGE.output("You said " + arr.join(" "))
}

module.exports = {
    commands: { 
        say: say
    },
    stateChange: {
        hasSpoken: hasSpoken
    }
}

```

Just like commands, the name of the changed state key must correspond to the name of the function. So ```hasSpoken()``` is invoked when something in the state changed.

Right now though, the state isn't ever changed, even if the user talks. We can change that by changing a value in the state as you would any other object in JavaScript.

```javascript

const METGE = require("../metge.js")


let hasSpoken = function(oldVar, newVar) { // the function will be passed the old variable, and the new variable from the state.
    if (oldVar === false && newVar === true) { // the user hadn't spoke before, but now they have
        METGE.output("You have spoken.")
    }
}

let say = function(arr) { 
    METGE.output("You said " + arr.join(" "))
    METGE.game.state.hasSpoken = true // where the magic happens!
}

module.exports = {
    commands: { 
        say: say
    },
    stateChange: {
        hasSpoken: hasSpoken
    }
}
```

And that's it! Any time a user invoked the say command, as long as the user has not spoken before, it will say what the user said, along with "You have spoken". If the user has spoken before, it will just say what the user said.

That's it for now, check back when new features are added!

Ciao!

-Flarp



