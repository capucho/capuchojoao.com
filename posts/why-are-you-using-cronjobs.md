---
title: 'Why are you using cronjobs?'
date: '2020-08-12'
---

> There's an addendum in the end with a "fix" :)

## Context

You work for an e-commerce company. In this company, users will create their accounts. What is the most likely your feature will do when they sign up? That's right. Send an email with a confirmation token so you can be sure that you're creating the account for the right user.

Ok, but what does this have to do with cronjobs? I will explain further down the road.

Most likely, this token will have an expiration. It can be 3 hours, one day, it doesn't matter how long it will take, at some point in time in the future, it needs to be canceled. A common way to handle these scenarios where you need to perform something in the future is using cronjobs.

The easy way? A cronjob that goes through the database table where you store the tokens, check the ones with more than 3 hours (if that's the expiration time for your company) and update or delete the tokens that are not valid anymore.

You might ask me, what is the issue with this approach? Well, the first thing is that this approach is time and resource consuming. By using this approach, every hour or so, you will need to go through the whole table to find the elements you need and do an operation on them. If there's nothing to be canceled, the cronjob will still use the resources.

Let's look through this with another set of lenses: scalability. The server that triggers the cronjob cannot scale up, otherwise, you could end up running the same process concurrently. For instance, if you're processing payments within a cronjob: two instances of the server triggering the same thing at the same time could end up paying a user twice if you're not careful.

**What can we do to improve it? The nature of the process is event-based. Why can't we use that in our favor?**

Instead of taking a time-based approach, let's think about how we can deal with this thinking asynchronously. First, when the user signs up, we process the event triggered by the "Sign up" button. This event, let's call it "CREATE_ACCOUNT". When you do so, another event is also triggered, which is "REVOKE_SIGN_UP_TOKEN". However, this event is to be processed in the future, how can we deal with that?

## Asynchronous queues to the rescue

Imagine you have a queue. Now imagine that in this queue you can say: "Hey, process this thing for me in 3 hours, please?". The queue properly stores the information you sent and later, will execute the code you want for the events stored in it.

One may say: "Ok, this could be awesome. But how is it achievable? I have no idea on how to delay something for 3 hours".

No worries, Redis is here to rescue you from the deep cronjob forest. If you are a happy developer that works with Node.js, I will show an amazing library that can help you on this journey.

[Bull](https://github.com/OptimalBits/bull) is a queue tool for Node.js, based on Redis. By using it, you can implement asynchronous job processing, with delays, retries, priorities on your jobs, and much more. You may also use a [dashboard](https://github.com/vcapretz/bull-board) to visualize in a nice way how your jobs are being handled. Remember, asynchronous processing can fail like any other piece of code. Keep in mind that you need to handle your failures.

The libraries provide good examples of how to use it and what are the features they contain. I will leave to you to find what's the best approach for you using it. Adding examples here, it would only increase the time to read and would be really close to the documentation to keep it simple.

## Conclusion

I hope that this article brought a new perspective on how you can handle time-constrained events (or just events). I hope that the next time you see a cronjob handling an event-based process, you can think if it wouldn't be better to use an asynchronous process to do so.

Stay safe, use a mask!

## Adendum

After posting, a friend brought to my attention that we could use a DB that has a TTL feature. In this case, since we use Redis, it contains an EXPIRE command which you could indeed implement this specific feature more efficiently. Using this command you could tell the DB to remove the key after a given time window. Unfortunately, the example wasn't complex enough, but what I wanted to bring to attention are the scenarios where you have a complex operation that you must execute after a given time an event occurred. Hopefully, that can bring some ideas for you future projects =]

Thanks @hkupty for bringing that to my attention and helping me improving the article :)



