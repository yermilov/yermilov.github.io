---
title: "Java version upgrade is not as simple as \"do it every six months\". Instead, you should... (Part 2)"
canonicalSlug: "java-version-upgrade-is-not-as-simple-af8"
language: "en"
publishedAt: 2023-10-13
summary: "Java 21 is now available!https://openjdk.org/projects/jdk/21 Usually, it is a time for long internet discussions about whether to upgrade or not. Various evangelists and advocates try to convince everyone to upgrade to g"
tags: []
translations:
  en: "java-version-upgrade-is-not-as-simple-af8"
coverImage: "/blog/java-version-upgrade-is-not-as-simple-af8/01.png"
---
![](/blog/java-version-upgrade-is-not-as-simple-af8/01.png)

[Java 21 is now available!](https://openjdk.org/projects/jdk/21) Usually, it is a time for long internet discussions about whether to upgrade or not. Various evangelists and advocates try to convince everyone to upgrade to get newly released JEPs (JDK Enhancement Proposals). A small group follows, but most people either refuse to upgrade to non-LTS versions (21 is an LTS version that follows 17, 11, and 8, so you won't hear this argument this time) or even upgrade at all. Without context, none of these three strategies (never upgrade, always upgrade, upgrade to LTS only) is the right solution. Let's try to come up with a decision framework for them in this series. *[Part 1 deconstructs what the “Java version” is.](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple) Part 2 covers the reasoning behind the upgrade / don’t upgrade decision in depth. [Part 3 summarizes Parts 1 and 2 into a concise decision framework, and shows examples of how my team uses it in practice.](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)*

Subscribe to get an update when my new post comes out every other Friday (and Part 3 next Friday)

Subscribe

### 😊 Reasons to upgrade

Can we just always stay on whatever Java version was at our project’s inception? Well, we can, and it can be a good strategy. **But the risk is that there is a chance that, at some moment, you will need to upgrade.**

Why may you need to upgrade? It can be a security issue, bug, or new functionality you absolutely need. The longer your software exists, the higher the chance that such an event happens - probably not after months, but likely yes after years. And **when it happens, you need the upgrade process to be as smooth as possible**. In case of security issue, the speed of execution may be critical; otherwise, it will be a matter of invested resources. Obviously, a minor version upgrade is much easier than a major version upgrade.

For major releases, Java is pretty strict on compatibility guarantees. Officially, incompatible changes between versions are very small and quite rare. It has even gotten to the point when it became a risk for the development pace of JDK, as every change should have been very carefully considered and then maintained forever. To mitigate this risk `--enable-preview` flag was introduced. It enables JDK changes that do not have strict compatibility guarantees. **If you use it, there is a very high chance that your code will break after upgrading to the next feature release, so I strongly recommend never using** `--enable-preview`**.**

The bigger problem is that a lot of Java libraries use internal JDK APIs like Unsafe class that doesn't have same compatibility guarantees. This makes a major version upgrade harder and harder with the number of skipped major versions growing.

So, in case you always stay on the latest feature version, the upgrade you need will always be either a minor version upgrade (for example, from 20.0.1 to 20.0.2) or a major upgrade to the next feature version (for example, from 19.0.1 to 20).

![](/blog/java-version-upgrade-is-not-as-simple-af8/02.png)

In case you stay on the latest LTS version, the upgrade you need will always be either a minor version upgrade (for example, from 17.0.3 to 17.0.8) or a major upgrade to the next LTS version (for example, from 17.0.6 to 21.0.1).

![](/blog/java-version-upgrade-is-not-as-simple-af8/03.png)

In case you never upgrade, you will likely have to upgrade multiple major versions, more with every six months passed (for example, from 8 to 17.0.9).

![](/blog/java-version-upgrade-is-not-as-simple-af8/04.png)

This should be the first driver for your upgrade strategy decision.

**The second driver should be the famous principle of continuous integration - when you do something more often, you become better at it.** In case you never upgrade, that time when you absolutely need to do it will be your first, so be ready for lots of unexpected problems. Upgrading every two years from LTS to LTS also hardly passes as “often”, so my advice would be if you stay on LTS versions, try to do minor upgrades as often as possible. Upgrading to every minor is ideal, but even doing it every six months would be a great driver to make the upgrade process smooth and polished.

![](/blog/java-version-upgrade-is-not-as-simple-af8/05.png)

The same applies if you upgrade for every feature release - a six-month cadence is not the worst, but doing at least one minor upgrade in between would be beneficial for your processes.

![](/blog/java-version-upgrade-is-not-as-simple-af8/06.png)

Last, and in this case probably least indeed, driver can be summarized as “**new is always better**”. Java development is thriving at this moment, so every later release (according to semver, not date) has more features, fewer bugs, and better performance. It is safe to say that version 18.0.2 is definitely more advanced than 17.0.8, which in turn is more advanced than 17.0.1. But mind that it does not mean the first feature releases are unstable or have higher risks of bugs - there is no need to wait for the first minor release to do a major version upgrade.

![](/blog/java-version-upgrade-is-not-as-simple-af8/07.png)

### 😫 Limiting factors

Now let's explore another extreme and think, can we just always upgrade to the latest Java version?

**The first factor that limits us is the runtime environment.** If you control where your code runs, you can use any version of runtime JVM. In the case of a managed environment like AWS Lambda, MapReduce cluster of any vendor, or your Operation’s team choice, you have limited options from the offered versions.

Selection of the target version is trickier, as it is limited by two factors. First, it can't be higher than the runtime JVM version. In case you are a library maintainer, runtime environment selection is in the hands of your consumers. If you have specific requirements from them, you can put the minimal version of their runtime JVMs as yours. Otherwise, using the latest LTS version is a good default choice as it is a sweet spot between supporting most of potential customers without tying yourself to legacy versions too much.

**The second factor is the libraries you use.** Bytecode manipulation is a very widespread technique in the Java world, but unfortunately, it can't be done in a forward-compatible way. It means that you are limited to using the minimal Java version your bytecode manipulation dependencies were aware of or lower as the target version. Good reminder to upgrade all your dependencies versions continuously! Unfortunately, looking through docs of every dependency you have to get their supported version is not very practical. Instead, you can run tests, deploy to the qa environment, and if you see an error like:

```
java.lang.IllegalArgumentException: Unsupported class file major version
```

downgrade one version back and retry.

The source version can't be higher than the target version. The only reason to set it lower I’m aware is to limit the usage of new language features the first couple weeks after migration to the new target version in case you will have to rollback because of `Unsupported class file major version`. Do you know any others?

[Leave a comment](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple-af8/comments)

The build-time JDK version can't be lower than the target version. For convenience, it makes sense to use the same version as the runtime JVM version or just the latest feature release version. One problem you can get here is that your build tool needs to support this JDK version. If it does not - use one version behind. The developer environment JDK version should be the same as the build-time JDK version.

Test runs JDK version should be exactly the same version as the runtime JVM version to mimic the production environment better. If you are a library maintainer, it makes sense to run your tests on each feature version from your target to the latest available.

**The most important limiting factor is** **your development intensity**. While in maintenance mode - stay on the latest available LTS version. If you know that the code will be in active development for at least a year - it is an excellent opportunity to upgrade to every new feature version.

The last interesting question for today is how to select a JDK vendor. From my experience, there is no need to dwell for a long time on this question, as OpenJDK is an excellent choice in almost any situation. Here are a few reasons why you should consider an alternative:

-   If, for any reason, you need the old JDK version or do not plan to upgrade under any circumstances - use [Eclipse Temurin](https://adoptium.net/).
    
-   If you don’t want to build your own Docker image with JDK - use the one provided by [Eclipse Temurin](https://hub.docker.com/_/eclipse-temurin).
    
-   If you run your code using some cloud provider - learn about JDK distribution from this provider, it *might be* optimized for this cloud provider.
    

Thanks for reading! If you find my writing useful or entertaining, please help to share it further or even thank me by “buying me a coffee” [via donation to 🇺🇦 The Come Back Alive Fund](https://savelife.in.ua/en/donate-en/#donate-army-card-monthly)!

[Share](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple-af8?utm_source=substack&utm_medium=email&utm_content=share&action=share)

[

## Java version upgrade is not as simple as "stay on LTS". Instead, you should... (Part 1)

](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple)

[Yarik Yermilov](https://substack.com/profile/136944163-yarik-yermilov)

·

October 6, 2023

[![Java version upgrade is not as simple as "stay on LTS". Instead, you should... (Part 1)](/blog/java-version-upgrade-is-not-as-simple-af8/08.png)](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple)

The format that I like to read most and try to follow as I write is “I had this problem and here is how I fixed it - short, fun, and incomplete story”, contrary to the pretty common “Now I'm going to explain you everything” format that sometimes is not that lightweight and enjoyable. Unfortunately when I started a

[

Read full story

](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple)

[

## Java version upgrade is quite simple. All you need to do is... (Part 3)

](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)

[Yarik Yermilov](https://substack.com/profile/136944163-yarik-yermilov)

·

October 20, 2023

[![Java version upgrade is quite simple. All you need to do is... (Part 3)](/blog/java-version-upgrade-is-not-as-simple-af8/09.png)](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)

After Part 1 deconstructed what the “Java version” is and Part 2 covered the reasoning behind the upgrade / don’t upgrade decision in depth, I feel I’ve finally explained you everything - the blog format that I find not very lightweight and enjoyable. Time for the “I had this problem, and here is how I solved it - short, fun, and incomplete story” forma…

[

Read full story

](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)