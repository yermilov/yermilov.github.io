---
title: "Halloween special: Two development detective stories with mystery, policeman, and surprise villain"
canonicalSlug: "halloween-special-two-development"
language: "en"
publishedAt: 2023-10-31
summary: "Two debugging detective stories — one suspicious log line, one mysterious slowdown — and the surprise villains they revealed."
tags: []
translations:
  en: "halloween-special-two-development"
coverImage: "/blog/halloween-special-two-development/01.png"
---
### 👮 Crime scene 1

It was a rainy May day. I was debugging the production incident and looking through logs. Suddenly something caught my eye. At first, it was not even clear why one of the lines looked so suspicious. Can you see it too?

```
2023-05-14 14:13:57,584 [QueuedThreadPool-jetty-68] INFO  g.c.s.ClientInfo: [THROTTLED]x92 Client type received: ClientInfo{clientType=EXTENSION_CHROME, clientSubtype=GENERAL, clientVersion=0.0.0.0, clientSupports=[]}
2023-05-14 14:13:58,133 [ScheduledCheck-18] INFO  g.c.h.Sprawl: document check skipped alphabetic_ratio = 0.0 len = 248 fullText.len = 248
2023-05-14 14:13:58,135 [QueuedThreadPool-jetty-44] WARN  g.c.t.h.s.HttpRequestVerifier: CSRF checks failed
request = grammarly.capi.lib.api.sprawl.SprawlRequest@392a091
2023-05-14 14:13:58,296 [QueuedThreadPool-jetty-60] INFO  g.c.b.a.AuthBackend: Authentication denied: NotFoundException: HTTP 404 Not Found
```

Every line starts from a classic log pattern: the timestamp, thread name, log level, and log name. But one of them isn't 👻

```
request = grammarly.capi.lib.api.sprawl.SprawlRequest@392a091
```

It was not relevant to the incident at hand, so I quickly moved on but a few days later this mystery started to get me. I've looked through the code and soon enough found a recent merge request:

![](/blog/halloween-special-two-development/02.png)

“`System.out.println!`” - I exclaimed. Obviously, someone was debugging their changes using our ancestors’ traditional approach and forgot to clean evidence. We have a mandatory code review process, so someone else looked through these changes and pressed the Approve button. All the names and traces were recorded in GitLab, so it looked like the case was closed. Was it me among these people? I can't comment on that, the investigation secret 🫣 Are these people to blame? Of course, not! And not because I was or wasn't among the suspects. Software Engineers, even the best ones, are people after all. They get tired after a long day, they make mistakes, they hurry to fix a bug, and they click Approve without carefully looking through every line of the code when there are a couple of hundreds of them in one merge request. So we removed these `System.out` lines and closed the case.

### 🕵️ Crime scene 2

On another rainy day (such things happen only when it is raining!) I was working on the new feature. I've made some changes in the feature logic, run the tests, and they all finished green. A creeping scare filled my brain. I haven't changed the tests code to match changes in production logic yet 👹

I immediately jumped into the investigation. Why tests are not failing? After starting for a really long time into the code I've got a suspect:

![](/blog/halloween-special-two-development/03.png)

In case you don't see the problem yet, the traces were hidden really well, but upon closer inspection:

![](/blog/halloween-special-two-development/04.png)

“`org.junit.Test!`" - I exclaimed (I always exclaim in `monospace`). Our project migrated to JUnit 5 a long time ago, but someone (🫥) used JUnit 4 annotation that was simply ignored by JUnit 5 runner. How has it gotten there? Further investigation showed a surprising guilty party - for some reason `org.junit.Test` was the first suggestion from IntelliJ IDEA in the JUnit 5 project:

![](/blog/halloween-special-two-development/05.png)

Again, someone wrote this code, someone else reviewed it and approved it (no comments on who it was! why are you asking?). In this situation, it is even harder to blame those people (🫥). The author was clearly framed by IntelliJ IDEA's practical joke. As for the reviewer - who really checks import statements for correctness? Another cold case that had to be closed 😮‍💨

### 🔍 Police work

I was sitting in my office and thinking about recent cases. There was clearly a common pattern: damage done, plenty of evidence, and innocent engineers framed as primary suspects. Are they really that innocent? Of course, they are! If something is important to you in 100% cases, you can't rely on the engineer's action, because it never has 100% accuracy. When people's minds are involved there is always room for mistake, hurry, tiredness, or desire to cut the corner.

But does someone stay behind all these crimes? Can they be prevented? We can try to write a guide for developers that we recommend using `LOG.info` instead of `System.out.println` or we can add a code review checklist point to check for it, but it will still not guarantee 100% accuracy. The only thing that can guarantee it is a *quality gate*. Luckily, around the same time, I stubbed across [Policeman's Forbidden API Checker](https://github.com/policeman-tools/forbidden-apis):

![](/blog/halloween-special-two-development/06.png)

This is a tool that can detect if specific classes or methods are used in your project, so you can use it to check if someone uses a class or method you don’t want to be used. That looked very promising for our cases and I've used one of my team's fun days to set it up. It turned out to be quite easy and straightforward, besides importing the Gradle plugin all you need to do is specify methods or classes that are forbidden to use in your project. It has some useful presets, like forbidding everything related to `System.out` (that’s also `System.err` and `e.printStackTrace`):

```
forbiddenApisMain {
    bundledSignatures = ['jdk-system-out']
    ignoreFailures = false
}
```

Note how it ends with the `Main`, which means that checks apply only for `src/main/java` but not for `src/test/java`. If none of the presets match what you need you can specify your lists of signatures using text files. Here is how the real config looks like in my project:

```
forbiddenApis {
    signaturesFiles = files('../gradle/forbiddenapis.txt')
    ignoreFailures = false
}

forbiddenApisMain {
    bundledSignatures = ['jdk-system-out']
    ignoreFailures = false
}

forbiddenApisTest {
    signaturesFiles = files('../gradle/forbiddenapis-test.txt')
    ignoreFailures = false
}

forbiddenApisIntegrationTest {
    signaturesFiles = files('../gradle/forbiddenapis-test.txt', '../gradle/forbiddenapis-integration-test.txt')
    ignoreFailures = false
}
```

And `forbiddenapis-test.txt` does the job of forbidding JUnit 4 classes usage:

```
org.junit.Assert @ Use org.junit.jupiter.api.Assertions instead
org.junit.Test @ Use org.junit.jupiter.api.Test instead
```

Now `./gradlew forbiddenApis` fails if there are any of the mentioned signatures in your codebase and lists all of them:

![](/blog/halloween-special-two-development/07.png)

Of course, people will not run some Gradle command for every change they make. The last remaining step to ensure none of these crimes repeat again (at least in your main branch) is to add it as a mandatory CI step:

![](/blog/halloween-special-two-development/08.png)

Now the town can sleep well knowing that there is no `System.out.println` or `org.junit.Test` in the main branch code with zero effort required to actively control it!
