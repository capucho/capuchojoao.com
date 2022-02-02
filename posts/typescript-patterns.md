---
title: 'TypeScript (patterns?)'
date: '2020-06-24'
---

> Throughout my journey with TypeScript, I've been impressed by its features. The v2 [documentation](https://www.typescriptlang.org/docs/home.html) is a really good improvement to the learning resources. However, some patterns are not so easy to find documented in the common ground of TS materials. Therefore, I wrote this quick article with 3 interesting things in TS, that from my perspective, can make life a bit easier :).

We shall begin!

![Do it](https://media.giphy.com/media/iFxXouCf76ZencqIRP/giphy.gif)

## Companion Object

I've found this one when I read [Programming TypeScript](https://www.amazon.com/Programming-TypeScript-Making-JavaScript-Applications/dp/1492037656). It provides a simple and easy way to enable your module customers to import the type and a factory for that type in a single import. Hence, the name "Companion Object".

It amazed me by how simple and useful this can be. This is how the module is presented:

```ts
// Currency.ts

// Here we will create a type and a variable
// with the same name
type Currency = {
  unit: 'EUR' | 'GBP' | 'JPY' | 'USD';
  value: number;
};

let Currency = {
  DEFAULT: 'USD',
  from(value: number, unit = Currency.DEFAULT): Currency {
    return { unit, value };
  },
};

export { Currency };
```

And this is how the module is consumed:

```typescript
// index.ts

import { Currency } from './Currency';

// Use case 1: Used as type
let amountDue: Currency = {
  unit: 'JPY',
  value: 83733.1,
};

// use case 2: Used as factory object
let otherAmountDue = Currency.from(330, 'EUR');

console.log({ amountDue, otherAmountDue });
```

If we look at the `index.ts` file, a single import of `Currency` is declared. Yet, as you can see, it has two use cases. The first one as a type and the later as a factory object. By looking at the `Currency.ts` file, it's possible to see that we also have a single export, which is valid for both variable and type.

Consequently, **with a single export and a single import, you gain a type and an object factory.**. This enables you to work with both smoothly. However, things can't be so easy. Since we usually opt-in for the `strict` option in TS, this code throws an error:

`7022: 'Currency' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its initializer.`

_(If you want to understand a bit more on the compiler options, [this link](https://www.typescriptlang.org/docs/handbook/compiler-options.html) provides an explanation to every option TypeScript contains.)_

![no](https://media.giphy.com/media/d2ZaChASUxF6xqWk/giphy.gif)

However, whenever we developers like an idea, we ~~smash the code until it works~~ find a proper path to make it reasonable. In this particular case, it is possible to use this with the strict option, by doing a small tweak. Our module will look like the following:

```typescript
type ValidCurrencies = 'EUR' | 'GBP' | 'JPY' | 'USD';

// "Small tweak": Type that will be used on
// the variable that is used as constructor
type NotExposedCurrency = {
  from: (value: number, unit: ValidCurrencies) => Currency;
  DEFAULT: ValidCurrencies;
};

// Here we have the things we would like to export

type Currency = {
  unit: ValidCurrencies;
  value: number;
};

// Type Constructor
// Here is where we use the tweak
let Currency: NotExposedCurrency = {
  DEFAULT: 'USD',
  from(value: number, unit = Currency.DEFAULT): Currency {
    return { unit, value };
  },
};

export { Currency };
```

By typing the factory with a private type, the variable won't have an `implicit any` type. This won't impact our usage since we have no interest in the Factory type. Our interest is at the factory function return type.

Applying this change, the `index.ts` export was still the same and it enabled the feature usage even when the compiler is set to a strict mode.

![happy](https://media.giphy.com/media/XbxZ41fWLeRECPsGIJ/giphy.gif)

## Exceptions: Java, Go, and TypeScript?

In my career, I've worked mostly as a Java Developer. In Java, you can add the Exceptions that might be thrown to your methods signatures, thus, enforcing the client to properly handle those cases.

Such a simple thing, which I've never imagined how much I would miss. For those who might have never used Java or a language with this feature, here's a piece of code with an example:

```java
public class ThisOneThrows {

    // ThisOneThrows.java:4: error:
    // unreported exception Exception;
    // must be caught or declared to be thrown
    // ThisOneThrows.hereWeThrow();
    public static void main(String[] args) {
        ThisOneThrows.hereWeThrow();
    }

    public static void hereWeThrow() throws Exception {
        if(true) {
            throw new Exception();
        }
    }
}

```

Java compiler will enforce you to declare that the `main` function throws as well or that you need to wrap the call `ThisOneThrows.hereWeThrow()` in a `try...catch` block.

```java
public class ThisOneThrows {

// public static void main(String[] args) throws Exception {
    // ThisOneThrows.hereWeThrow();
// }

// OR

 public static void main(String[] args) {
     try {
         ThisOneThrows.hereWeThrow();
     } catch (Exception e) {
         e.printStackTrace();
     }
 }


 public static void hereWeThrow() throws Exception {
     if(true) {
         throw new Exception();
     }
 }
}

```

Knowing this behavior upfront is always resourceful when dealing with error handling, and I've always missed that in TS. It's a really impressive type system, especially considering the environment it runs at, but not being able to know the possible errors I could expect bugged me for a while.

However, the Go community has been dealing with this for a while. In Go, you don't have a _throws_ declaration, the solution? **Return an actual error object to the function consumer**.

So, why not doing that in TS as well? _(This is a controversial pattern for many, but from my perspective, as long as it increases the chances of catching an issue before the client does, it brings value to the table)_.

Here's one example of how you can do that in TS, again, from the book [Programming TypeScript](https://www.amazon.com/Programming-TypeScript-Making-JavaScript-Applications/dp/1492037656). I think I've done some really small tweaks to it, so I could make use of function return types as `Type Guards`.

One example of how we could define the errors and `Type Guards`:

```typescript
// helpers.ts

// First Part: define the errors
class InvalidDateFormatError extends Error {}
class DateIsInTheFutureError extends Error {}

// Type guard for the errors
function isError(input: unknown): input is Error {
  return input instanceof Error;
}

// a helper functions for dates.
function isValid(date: Date) {
  return Object.prototype.toString.call(date) === '[object Date]' && !Number.isNaN(date.getTime());
}
```

This is how we could define our logic to handle the errors:

```typescript
// birthday.ts
import { InvalidDateFormatError, DateIsInTheFutureError, isError, isValid } from './helpers';

function parse(birthday: string): Date | InvalidDateFormatError | DateIsInTheFutureError {
  let date = new Date(birthday);

  if (!isValid(date)) {
    return new InvalidDateFormatError('Enter a date in the form YYYY/MM/DD');
  }

  if (date.getTime() > Date.now()) {
    return new DateIsInTheFutureError('A what?');
  }

  return date;
}

function getYear(birthday: string = new Date().toISOString()): number {
  const possibleDate = parse(birthday); // step 1

  if (isError(possibleDate)) {
    // step 2
    console.log(possibleDate.message);
    return;
  }

  A;
  // step 3
  return possibleDate.getFullYear();
}
```

Let's start with the `step 1` part, inside the `getYear` function. Here we call the `parse` function. This function, as the signature states, tries to parse a string into a Date. The signature also shows that besides the Date we want, 2 errors could be returned from the validation conditions.

By doing so, at the moment parse is executed and returns the value to the `possibleDate` variable, TypeScript is exactly like this:

![Travolta](https://media.giphy.com/media/X2iqesUkZULQs/giphy.gif)

Is `possibleDate` a Date or an Error? Since TypeScript can't figure it out at compile-time, it won't allow us to safely access any value. We will have to check the variable using a `Type Guard`. Only after that, you will be able to access the value you want.

In step two, we have our `Type Guard`. If the call to `isError` returns true, which has a return defined as `input is Error`, TS knows that inside that if condition, we're dealing with an Error. Consequently, the compiler will allow access to the message attribute.

_(To see more on this Type Guards, take a look at [this link](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates))_

Moreover, by figuring that out on step 2, TypeScript also knows that the only possible type left for the `possibleDate`, after executing the if condition, is the Date type. This is because both options are a subtype of Error.

Now you're allowed to access the Date functions and attributes. :)

> Some Functional Programming concepts can improve this error handling in a quite nice manner, I will write a post regarding that in the next few weeks. If you're curious about it already, I can recommend reading this [book](https://mostly-adequate.gitbooks.io/mostly-adequate-guide/).

> Mostly Adequate Guide to Functional Programming is pleasant to read, with exercises so you can practice the concepts. I'm quite sure it will be a nice addition to your library.

## Mapped Objects

This one I don't recall where I've encountered for the first time, but it's a simple use of generics to improve a lot our safety.

For instance, imagine you have an interface with the event types for a button, containing those events like: `click`, `mouseover`, etc.. Furthermore, imagine that you expose a client to that module, where users can subscribe to your events. Have you ever seen something like `.on('click', callbackFunction)`?

Maybe you also want to tell them the types they might expect in their callback functions. It would be way better if we had a type system that could provide this information, right?

This pattern can help your module users a lot on those questions mentioned above. I can't stop thinking of a younger version of me while learning the JS basics. The countless number of times I had to look up on MDN which events were available on a given type of element.

With this pattern, you can derive types that will improve your IntelliSense and autocomplete features by simply using [Generics](https://www.typescriptlang.org/docs/handbook/generics.html).

```typescript
// redis.d.ts

type Events = {
  ready: void;
  error: Error;
  reconnecting: { attempt: number; delay: number };
};

type RedisClient = {
  // subscriber function
  on<E extends keyof Events>(event: E, f: (arg: Events[E]) => void): void;
};
```

And this is how this would be used:

```typescript
// redis.ts
import Redis from 'redis';

// Create a new instance of a Redis client
let client: RedisClient = redis.createClient();

// Listen for a few events emitted by the client
client.on('ready', () => console.info('Client is ready'));
```

If we take a look at our subscriber function in`redis.d.ts`, TypeScript will realize that the event can only be one of the types `'read' | 'error' | 'reconnecting'`, since the values are keys from the Event type. It will also add types and dynamically validate the function arguments since it will be based on the event type you select.

This is also resourceful whenever you add a new key into that type, all your clients will be able to see the new addition, and if we didn't break anything, use that new event :)

## Time to say goodbye :)

Hopefully, this article can bring some ideas to your future coding, even if it's to avoid using these concepts.

Feel free to comment and bring your ideas to this article.

![Bye](https://media.giphy.com/media/9eM1SWnqjrc40/giphy.gif)

## References and Resources

- [TypeScript Docs](https://www.typescriptlang.org/docs/handbook/generics.html)
- [Programming TypeScript](https://www.amazon.com/Programming-TypeScript-Making-JavaScript-Applications/dp/1492037656)
- [FrontendMasters - TypeScript](https://frontendmasters.com/courses/typescript-v2/); Some material related to this one is presented for free in [here](https://github.com/mike-works/typescript-fundamentals)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Udemy - Understanding TypeScript](https://www.udemy.com/course/understanding-typescript/)

## Appreciation

- Martin Fieber, that helped me a lot with my TypeScript learnings and had a lot (I mean, a LOT) of patience with me.
