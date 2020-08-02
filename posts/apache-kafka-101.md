---
title: 'Apache Kafka 101 - Introduction'
date: '2020-04-15'
---

> Disclaimer: the intention behind this post is to do a brain dump of some understandings I have on Kafka and to make that useful by sharing it. I'm not a Kafka expert whatsoever, and if there's anything wrong in here, please, comment so I can fix it. Anything that can help improve this text is welcome. With that being said, let's start the journey :)

## Sync vs Async communication

Before diving into Kafka, let's briefly go through the concepts of synchronous and asynchronous communication for the ones that never heard about it. _If you know the difference you can just skip this part_.

To start off, let's take an example of synchronous communication that is a client app sending an HTTP request towards a REST API service. In this case, the client opens a connection with the server via the HTTP protocol and sends some data that will be received and processed by the server, which in turn will respond to the client with the result. If the client, by any chance, does not receive a response within an expected time, an error will be thrown (the beloved timeout). This architecture is quite simple and usually suits well the majority of the cases where a client needs to communicate with a server.

However, imagine that you work for an e-commerce company and you have to implement the purchase button of the website. Would a regular synchronous request be enough to handle this case?

If the customer clicks purchase you will probably need to check whether the warehouse has stock of the products, the user's credit card is valid, the delivery address exists, etc, but eventually a response will have to be given to the customer telling them that the purchase has been finished successfully. And even though you told the user so, the purchase process won't stop there. The logistics will need to separate all the items of the purchase and assemble the package, a delivery company will fetch them, and some tracking information will be sent to the user as the progress changes. And these things are naturally asynchronous. The user doesn't need to be waiting for all of them to happen before he knows his purchase is done. Otherwise, online shopping would be a huge pain.

Here is where asynchronous communication enters the game. By using it you are able to leave things such as emails, logistic integrations, tracking, that don't need to be immediately taken care of for later, making sure that the user will receive the purchase feedback as soon as possible.

Through messaging systems, we enable senders and receivers to communicate without the restriction that both must be available listening to the message at the same time. As the following image shows, the sender can produce a message and whenever the receiver is available, it will read and handle it.

![Messaging](https://dev-to-uploads.s3.amazonaws.com/i/z7rbpv62qn76242jtitd.png)

In this mentioned scenario, imagine that instead of doing REST API calls to each system informing that an order was placed, you could just send a message to the queue saying "Hey, someone created an order, here's the information you might be interested in". Or even, "hey, the tracking position of that package has changed, you might want to do something about it".

How beautiful would it be if all of your services that rely on this event could do whatever they need (and maybe even post follow-up messages?) whenever they're available to do it? Your email service would be really happy to be able to read this message calmly and send the update to the user when all its dependencies are available, isn't that so? That's what we want to achieve with asynchronous communication.

So, what about this _Kafka_?

## What's Kafka?

[Apache Kafka](https://kafka.apache.org/intro) is a distributed streaming platform. It's built to be resilient and fault tolerant.

You can achieve many use cases with Kafka, examples of it's usage could be:

- Messaging
- Log gathering
- Stream processing
- [etc.](https://kafka.apache.org/documentation/#uses)

In this article we'll go through an overview of some Kafka core concepts to enable you to have some understanding of its main features with the focus on using it for messaging and distributed systems communication.

- Topics
- Partitions
- Brokers
- Producers
- Consumers
- Consumer Groups

With all these concepts, Kafka's proposition is to deliver a structure that enables horizontal scalability and high performance.

## Core Concepts

### [Topics](https://kafka.apache.org/intro#intro_topics)

A topic is where your messages will be sent to (produced). Whoever wants to read this piece of information will read it (consume) from the topic.
Inside Kafka, you may have as many topics as you want and each topic contains a given number of partitions (defined by you when creating the topic). So, whenever producing a message to a topic it will be written in a given partition of the topic, randomly selected unless a key is provided.

![Topic and Partitions](https://dev-to-uploads.s3.amazonaws.com/i/va82q85g0hqjc5g2ymvv.png)
(image from Kafka [docs](https://kafka.apache.org/intro))

Within the topic, data is kept for some time. The default value is 7 days, but it can be extended. There are cases where these messages are kept on the topic for one year. One important thing here is that after a message is written in a given partition, you will no longer be able to change it. Being able to store the data for such a long period of time, enabling you to reprocess the messages, if necessary, is what makes Kafka reliable. After seeing some use cases for it in production, I can safely assure that this will be life-saving in some cases.

### Partitions

Within each partition the messages will be ordered, receiving an incremental id called offset in Kafka. A consumer is basically pointing to the last offset it was read, whenever a new message is consumed, this pointer moves forward to the next message. This process is an `offset commit`, which is always incremental.

![Partitions and Offsets](https://dev-to-uploads.s3.amazonaws.com/i/9kq3ki1xsdcj1xg8f4lv.png)
(image from Kafka [docs](https://kafka.apache.org/intro))

### Brokers

When using Kafka, the infrastructure you will have is a Kafka Cluster. This cluster is basically a bunch of servers, in our case, the brokers. So, what is this broker for?

Remember when we said that a topic consists of many partitions? To be more resilient and handle server failures, each broker will contain a certain topic partition.

> When connecting to a broker (Bootstrap server), you're connected to the entire cluster. Every Kafka broker is a bootstrap server which knows about all brokers, topics and partitions. When the Kafka Client connects to a Broker, it will receive a list of all brokers and can eventually connect to one of them, if needed. Brokers are identified by an ID.

Let's imagine a cluster with 3 brokers and one topic (called A). To achieve resilience in the delivery of the messages, we need some replica of the information, right? Just in case something goes wrong in one of the servers.

This is called `replication factor` in Kafka and topics should have a replication factor > 1, usually between 2 and 3.

![Brokers](https://dev-to-uploads.s3.amazonaws.com/i/fqfpza7tlljsk2rhwhmr.png)

In this example, we have a replication factor of 2, therefore, each partition is present in 2 brokers. So, in the case a broker becomes unavailable, you're still able to read the partition from another broker. However, if we had a replication factor of 3, we could afford even losing two brokers and we would still have the three partitions in one broker to work with.

#### How replication works?

At any given point in time, one broker (and only one) can be a leader for a given partition. The other partitions are called `In Sync Replicas` (ISR). When writing to a topic, only the leader can provide data for a partition and the brokers will need to sync the data.

#### Compression

You can enable data compression in the Broker configuration to reduce the size of messages, see more in [here](https://kafka.apache.org/23/documentation.html#configuration). Search for `compression.type`.

### [Producers](https://kafka.apache.org/intro#intro_producers)

To enable ourselves to use Kafka we need to be able to read and write messages to our loved topics, isn't that so? Therefore, we need to have an [API](https://kafka.apache.org/documentation/#producerapi) that makes that possible.

The producers are the ones responsible to write data to the topics (remember that this data will actually be written into a partition). If we want to summarise what a producer is, that would be it. However, if we only had this in the API it wouldn't be resilient.

For that, a producer is able to detect a failure in the broker and recover from that producing to another broker. Like it has been said, keys can also be sent within the messages to enable ordering. If no key is present, the data will be sent to a partition on a round robin selection. However, with the key, a hash will be made out of that and the key will always be sent to the partition of that given hash.

This is to enable order in messages. One thing to consider is that the number of partitions can never change otherwise the hashing mechanism will change and the guarantee won't be there for you anymore.

#### Acknowledgment

It's possible to choose to receive acks when producing messages.

| Ack Value | Result                     |
| --------- | -------------------------- |
| 0         | No ack is needed           |
| 1         | Wait for leader to ack     |
| all       | Leader + replicas must ack |

Something worth mentioning is that it is possible to configure retries in Kafka, with backoff configuration and timeout. But remember, with retries, Kafka could send messages out of order if you have that configured, be aware.

Something else is that you can achieve idempotent producers:

> [...] The idempotent producer strengthens Kafka's delivery semantics from at least once to exactly once delivery. In particular producer retries will no longer introduce duplicates. [...]

[Read more on it](https://kafka.apache.org/24/javadoc/index.html?org/apache/kafka/clients/producer/KafkaProducer.html).

### [Consumers](https://kafka.apache.org/intro#intro_consumers)

Now we reached the point where we'll read the messages from a given topic. Consumers know which broker to read from and each consumer will read from a given partition (or multiple partitions as well, more on this later). By not having multiple consumers in the same partitions, Kafka ensures that the message will not be processed by two consumers. Here's the [API](https://kafka.apache.org/24/javadoc/index.html?org/apache/kafka/clients/consumer/KafkaConsumer.html) for reference.

![Consumers](https://dev-to-uploads.s3.amazonaws.com/i/7xdqwom8ui74bq5q0t3b.png)
(image from Kafka [docs](https://kafka.apache.org/intro))

#### Consumer Groups

Consumers are tied to a consumer group. As we can see in the image above, each server contains Partitions (P#, where # is the partition number) and each Consumer belongs to a given Consumer Group. Each consumer from Consumer Group A reads from two topics, but each consumer from Consumer Group B reads from a single partition. When each consumer reads from a single partition and you send messages with keys, you can ensure that consumers will read the message from the partition it reads from in an ordered manner. Important, if you have more consumers than partitions, some consumers will be inactive.

#### Offsets

Consumer offsets are for a given consumer group and they're stored by Kafka when committed. This commit happens when the data received by the consumer is processed.

Consumers choose when to commit these offsets. Three types are available:

| Delivery      | Impact                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| at most once  | **As soon as the message is received**, offset is committed. Process failures means lost messages.                                                                              |
| at least once | Commits the offset when message is **processed**                                                                                                                                |
| Exactly once  | I'll leave a blog post from Confluence [here](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/) since it's a bit more complex. |

One thing to be aware of is that when using `at least once` configuration, you may read the message more than once, so be prepared for that.

## Libraries

So, I've been working for the past year with Node; therefore, the library we use is [KafkaJS](https://kafka.js.org/docs/getting-started). An open-source library, with some really good features and easy to start working with. If you want to get started with the basics, check it out! :)

Also, follow this [doc](https://kafka.js.org/docs/running-kafka-in-development) to enable yourself to run Kafka locally (with Docker) and be happy :)

## References

https://kafka.apache.org/intro
https://kafka.apache.org/documentation/
https://kafka.apache.org/24/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html
https://kafka.apache.org/24/javadoc/index.html?org/apache/kafka/clients/consumer/KafkaConsumer.html

**JS Library**: https://kafka.js.org/docs/getting-started

## Appreciations

- Túlio Ornelas, for having a lot of patience when helping me while I was building some communications using Kafka.
- Gabriel Gomes, for doing such a neat review on this text and helping me improve the readability (also fixing my English mistakes hahaha).

## Original Post

[DevTO](https://dev.to/hcapucho/apache-kafka-101-introduction-567a)
