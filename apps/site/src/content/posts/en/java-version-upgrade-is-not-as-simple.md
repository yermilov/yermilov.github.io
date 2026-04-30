---
title: "Java version upgrade is not as simple as \"stay on LTS\". Instead, you should... (Part 1)"
canonicalSlug: "java-version-upgrade-is-not-as-simple"
language: "en"
publishedAt: 2023-10-06
summary: "The format that I like to read most and try to follow as I write is “I had this problem and here is how I fixed it - short, fun, and incomplete story”, contrary to the pretty common “Now I'm going to explain you everythi"
tags: []
translations:
  en: "java-version-upgrade-is-not-as-simple"
coverImage: "/blog/java-version-upgrade-is-not-as-simple/01.png"
---
![](/blog/java-version-upgrade-is-not-as-simple/01.png)

The format that I like to read most and try to follow as I write is “I had this problem and here is how I fixed it - short, fun, and incomplete story”, contrary to the pretty common “Now I'm going to explain you everything” format that sometimes is not that lightweight and enjoyable. Unfortunately when I started a *short and fun story* about how my team upgrades to a new Java version it quickly turned out that to explain the reasoning behind it I needed *to explain you everything*. I'm sorry 🥲 To compensate, I've split the result into parts. *Part 1 deconstructs what the “Java version” is. [Part 2 covers the reasoning behind the upgrade / don’t upgrade decision in depth.](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple-af8) [Part 3 summarizes Parts 1 and 2 into a concise decision framework, and shows examples of how my team uses it in practice.](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)*

Subscribe to get an update when my new post comes out every other Friday (and Part 2 next Friday)

Subscribe

[Java 21 is now available!](https://openjdk.org/projects/jdk/21) Usually, it is a time for long internet discussions about whether to upgrade or not. Various evangelists and advocates try to convince everyone to upgrade to get newly released JEPs (JDK Enhancement Proposals). A small group follows, but most people either refuse to upgrade to non-LTS versions (21 is an LTS version that follows 17, 11, and 8, so you won't hear this argument this time) or even upgrade at all. Without context, none of these three strategies (never upgrade, always upgrade, upgrade to LTS only) is the right solution. Let's try to come up with a decision framework for them in this series. *Part 1 deconstructs what the “Java version” is.*

### 🧩 What is the Java version?

What people usually mean by “Java version” is the version of the Java language that restricts what language features can be used. For example, to use records you need this version to be at least 16. It is controlled by `-source` parameter of javac or practically by Gradle config:

```
java {
    sourceCompatibility = JavaVersion.VERSION_16
    targetCompatibility = JavaVersion.VERSION_16
}
```

Yes, there is another companion version controlled by the javac parameter `-target`! It restricts the virtual machine features used during the compilation of sources to bytecode. We can start counting versions; there are two of them now.

Technically, `-target` is the minimal JVM version required to run your code. It suggests that the actual runtime JVM version is a third version.

And by the way, javac comes from JDK (Java Development Kit) which has its own version. Four!

**These four numbers (source version, target version, build-time JDK version, and runtime JVM version) are usually enough representation of what “Java version” really is. The most important takeaway from this section is that you can upgrade them separately (but not entirely independently).** And still, there could be even more, less important versions. From the top of my head - the JDK version that your developers use locally and the JVM version used to run tests. Anything else important I'm missing?

[Leave a comment](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple/comments)

### 🎶 Major, minor, LTS, previews

Now let's talk about the releases. Periodically, new versions of the reference implementation of JDK are released (each includes javac, JVM, standard library, and everything). How? Every six months, the [openjdk/jdk main repository](https://github.com/openjdk/jdk) is forked into a [new openjdk/jdk${ver}u repository](https://github.com/openjdk/jdk21u). It becomes a basis for a feature release - the one that gets all attention, a new major number, and all of the implemented new features (some of them may be hidden behind the `--enable-preview` flag though).

![](/blog/java-version-upgrade-is-not-as-simple/02.png)

After the first feature release, new minor releases come from the forked repo every two months. These releases do not contain new features - only fixes and minor improvements. It means that minor releases do not produce new source and target versions, only new build-time JDK and runtime JVM versions. In case of a critical bug or security incident, there may be an additional release out of schedule. For example, OpenJDK 17.0.4.1 [fixed a regression in the C2 JIT compiler which caused the Java Runtime to crash unpredictably](https://bugs.openjdk.org/browse/JDK-8292504).

![](/blog/java-version-upgrade-is-not-as-simple/03.png)

But for most of the forks, minor releases stop after a new feature release is done (so there are only two of them) and the [repository is archived](https://github.com/openjdk/jdk20u).

![](/blog/java-version-upgrade-is-not-as-simple/04.png)

Every fourth feature release is declared an LTS (long-term support) release. It means that new minor releases for it will come at least until the next LTS release is done, which is two years.

![](/blog/java-version-upgrade-is-not-as-simple/05.png)

For some reason, this is the second big source of confusion about Java version upgrades so again in bold and caps:

**LTS VERSIONS ARE NOT DIFFERENT (MORE STABLE, HAVE MORE IMPORTANT NEW FEATURES, OR ANYTHING ELSE) FROM OTHER FEATURE VERSIONS. YOU WILL JUST GET MINOR RELEASES FOR THEM FOR AT LEAST TWO YEARS INSTEAD OF NO MORE THAN SIX MONTHS.**

And once more, [from Brian Goetz himself](https://twitter.com/BrianGoetz/status/1573001261619843073):

![](/blog/java-version-upgrade-is-not-as-simple/06.png)

### ™️ Vendors

The important thing about the previous section is that it is about reference implementation releases only. openjdk/jdk is open source, so anyone can take it and start releasing JDK distribution with their own rules and cadence. Oracle does it with OracleJDK in addition to OpenJDK itself, as well as Amazon with Corretto, Eclipse Foundation with Temurin, Microsoft, [and others](https://sdkman.io/jdks).

![](/blog/java-version-upgrade-is-not-as-simple/07.png)

In practice, to care about Java developers’ mental health, most vendors follow the same rules regarding feature and LTS versions, but provide support and minor releases for LTS versions for a longer period of time - for example, there are still fresh releases of [Temurin 8](https://adoptium.net/temurin/releases/?version=8) and [Temurin 11](https://adoptium.net/temurin/releases/?version=11).

![](/blog/java-version-upgrade-is-not-as-simple/08.png)

Some JDK distributions are more than just OpenJDK builds. Some prominent examples of JDKs with unique components are Zing by Azul, J9 by IBM, and Graal by Oracle. Their release schedule can be completely different from OpenJDK's. I will not dig deep into this topic as I don't have experience with it but TL;DR is use them only when you understand why you need to.

![](/blog/java-version-upgrade-is-not-as-simple/09.png)

Thanks for reading! If you find my writing useful or entertaining, please help to share it further or even thank me by “buying me a coffee” [via donation to 🇺🇦 The Come Back Alive Fund](https://savelife.in.ua/en/donate-en/#donate-army-card-monthly)!

[Share](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple?utm_source=substack&utm_medium=email&utm_content=share&action=share)

[

## Java version upgrade is not as simple as "do it every six months". Instead, you should... (Part 2)

](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple-af8)

[Yarik Yermilov](https://substack.com/profile/136944163-yarik-yermilov)

·

October 13, 2023

[![Java version upgrade is not as simple as "do it every six months". Instead, you should... (Part 2)](/blog/java-version-upgrade-is-not-as-simple/10.png)](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple-af8)

Java 21 is now available! Usually, it is a time for long internet discussions about whether to upgrade or not. Various evangelists and advocates try to convince everyone to upgrade to get newly released JEPs (JDK Enhancement Proposals). A small group follows, but most people either refuse to upgrade to non-LTS versions (21 is an LTS version that follows…

[

Read full story

](https://greenflamingo.substack.com/p/java-version-upgrade-is-not-as-simple-af8)

[

## Java version upgrade is quite simple. All you need to do is... (Part 3)

](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)

[Yarik Yermilov](https://substack.com/profile/136944163-yarik-yermilov)

·

October 20, 2023

[![Java version upgrade is quite simple. All you need to do is... (Part 3)](/blog/java-version-upgrade-is-not-as-simple/11.png)](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)

After Part 1 deconstructed what the “Java version” is and Part 2 covered the reasoning behind the upgrade / don’t upgrade decision in depth, I feel I’ve finally explained you everything - the blog format that I find not very lightweight and enjoyable. Time for the “I had this problem, and here is how I solved it - short, fun, and incomplete story” forma…

[

Read full story

](https://greenflamingo.substack.com/p/java-version-upgrade-is-quite-simple)