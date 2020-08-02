---
title: 'Smooth Undefined - Maybe value, maybe not?'
date: '2020-07-29'
---

## Introduction

Functional programming (FP), for the ones used to it, is joyful, lovely, and a slice of heaven on earth. However, for mere mortals like me, it's painful to even try to understand those concepts. Weird symbols, crazy words without any meaning to my knowledge that people frequently talk about. It just feels like we're getting into a labyrinth. With no exit, to fight a minotaur, barehanded.

For a while now, I've been trying to push myself to understand these concepts and applicabilities. However, materials are usually not so beginner-friendly, and from my perspective, you don't need to become a Jedi in FP concepts to get some benefit from it, even if it's with some hacks.

In the end, I hope that you can add some basic concepts into your current codebase without much effort, neither having to change the programming paradigm you're currently using. The goal here is not to make you a functional programmer, but instead, to use a concept from it to improve your daily code.


## Maybe `null` or `undefined`?

If you're a JavaScript developer, I'm quite sure you faced or wrote a piece of code that checked if a variable was `null` or `undefined`, right?

You probably have seen a lot of code that had this exact behavior:

```javascript

function parseNumber(string) {
  const number = parseInt(string, 10)
  if(!Number.isNaN(number)) {
    return number
  }
  // won't make it easy to you. Figure it out
  // if it's undefined
}

```

And somewhere in the code, something like this is happening:

```javascript
// now this returns undefined
let number = parseNumber('a10')

console.log(c.toFixed(2))
// this will simply throw
// Uncaught TypeError: Cannot read property 'toFixed' of undefined.
```

And after someone added this piece of code, alarms start to fire, phones starts to ring. In the end, someone realizes that a simple check was missing. They change the code to the following and life goes back to normal.


```javascript
let number = parseNumber(string)

if(number) {
  console.log(c.toFixed(2))
}
```

## Maybe Container

Now imagine the following scenario, instead of handing over to you the value you want or a possible undefined, you will be handed over a gift box. You won't know what's in that gift box until you open it. Now you have the [Schrödinger's](https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat) value.

Let's give this gift box a name. Let's call it Maybe. This is what a really basic value container would look like:

```javascript
// Maybe.js
'strict mode'

class Maybe {
  constructor(x) {
    this._value = x;
  }

  static of(x) {
    return new Maybe(x);
  }

  static empty() {
    return new Maybe()
  }

  get isNothing() {
    // this._value == undefined is equivalent
    // to this._value === null || this._value === undefined
    return this._value == undefined
  }

  get isPresent() {
    return !this.isNothing;
  }

  get value() {
    return this._value
  }
}


module.exports = Maybe
```

> This code is not following the purist Functional principles since we're exposing the value and not providing some FP operators. I will add at the end of the article some references on how to get deeper into the Functional concepts, so you can explore if you desire to do so.

This simple piece of code can improve a lot your code design. Instead of allowing null and undefined values, now you have a way to enforce your function consumer to handle those weird scenarios.

Let's refactor the code to use it. From now on, your function will return our gift box, a Maybe.

```javascript
// example.js
'strict mode'

function maybeParseNumber(string) {
  const number = parseInt(string, 10)

  if(!Number.isNaN(number)) {
    return Maybe.of(number)
  }

  return Maybe.empty()
}
```

And your code that calls this function will have to open the box before getting the value:

```javascript
let maybeNumber = maybeParseNumber('9')

if(maybeNumber.isPresent){
  console.log(maybeNumber.value.toFixed(1)) // prints 9.0
}

```
`Maybe` is what people call a Monad. However, a monad is something more complex than this, that won't expose the value as we're doing and will provide functions like `map, join, chain...` so you don't need to retrieve the value from it like when we access `maybeNumber.value`. If you want to get some deeper context into these concepts, I highly recommend this [book](https://mostly-adequate.gitbooks.io/mostly-adequate-guide/content/).

Still, from my viewpoint, these concepts can be a bit scary in the beginning and harder to introduce in a codebase that is not focused on the functional programming paradigm. Therefore, these small tweaks are a way to start introducing these nice concepts into your code while you get some familiarity with the ideas.

Hopefully, this simple idea can help you out when making some decisions on what to return when you face a situation where you most likely will return `null` or `undefined` values. Since `null` is considered the [billion-dollar mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/), let's avoid it as much as we can.

I will write a next post on how to provide a nice interface when handling asynchronous operations, stay tuned.

Have a nice week, stay safe. Use a mask!



