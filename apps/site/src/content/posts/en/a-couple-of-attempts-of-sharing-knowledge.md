---
title: "A couple of attempts of sharing knowledge tips"
canonicalSlug: "a-couple-of-attempts-of-sharing-knowledge"
language: "en"
publishedAt: 2023-09-08
summary: "How do you spread small, regular bits of team knowledge that don't deserve a wiki page each? Two experiments — a Slack bot and a Gradle build hook — and what worked."
tags: []
translations:
  en: "a-couple-of-attempts-of-sharing-knowledge"
coverImage: "/blog/a-couple-of-attempts-of-sharing-knowledge/01.png"
---
Consider a problem: there are a number of small bits of knowledge you want to share with your project developers. They are relatively small, so you probably won't create a new Wiki page for each of them. You can put them all into one Wiki page "Tips and tricks", but let's be honest - people may only read it once during onboarding and never get back, while there are probably new tips you come up with regularly. I have yet to find a proven solution for this problem, but here are two attempts I've tried recently.

### 🏺 Prior research

The first pattern that comes to my mind for this problem is "Tip of the Day":

![](/blog/a-couple-of-attempts-of-sharing-knowledge/02.png)

What is nice about it?

-   **It proactively reaches the developer.** You don't need to open the Wiki page every week for fresh tips. Instead, knowledge bits come to you without your active involvement.
    
-   **It does not waste too much of the developer's time.** It is short, concise, and, most importantly, appears at the moment that would be wasted without it anyway (during IntellijIDEA load time).
    
-   **It seeks feedback.** Developers can rate if a specific tip is helpful, and Jetbrains can aggregate this info and react.
    
-   **It provides a way to explore more.** The developer can open the next tip if they have time and inspiration.
    

Another great inspiration is [Google's "Testing on the Toilet"](https://testing.googleblog.com/2007/01/introducing-testing-on-toilet.html). The revolutionary idea from *"Google Testing Grouplet," a small band of volunteers who are passionate about software testing.* was to *write flyers about everything from dependency injection to code coverage and then regularly plaster the bathrooms all over Google with each episode, almost 500 stalls worldwide.* Isn't it genius? It definitely proactively reaches developers, and it definitely does not waste too much of their time. Of course, it is harder to gather feedback or give an opportunity to explore more tips with such an approach, but this is still a great example of out-of-the-box thinking.

![](/blog/a-couple-of-attempts-of-sharing-knowledge/03.png)

*Taken from [https://mike-bland.com/2011/10/25/testing-on-the-toilet.html](https://mike-bland.com/2011/10/25/testing-on-the-toilet.html)*

### 📱 Attempt 1

Where to look for developers? Where do they spend most of their time nowadays? My first thought was Slack. So I've written the first set of tips and wrote a simple Slack bot that would post them to our developers’ channel:

![](/blog/a-couple-of-attempts-of-sharing-knowledge/04.png)

The simple algorithm is to post a random tip every week and allow the same tip to repeat every 90 days. Is it a good approach?

-   Our developers indeed spend time in the developers’ Slack channel, so we seem to reach them in the right place, and at the moment, they can spend a minute reading the tip.
    
-   There is a way to ask for feedback - developers can leave a reaction to a message or post something in the thread.
    
-   And you can always click on the link or use Slack search to explore more:
    

![](/blog/a-couple-of-attempts-of-sharing-knowledge/05.png)

On the other hand, the tips are easily lost in the stream of messages. Practically, what we have seen is that some tips receive a lot of reactions:

![](/blog/a-couple-of-attempts-of-sharing-knowledge/06.png)

But in other cases, people ask the question that was answered by the tip just a day ago.

### 🦥 Attempt 2

Can we do better? What is the problem with the Slack approach? People don't really *spend* time there. They come to read incoming messages or write something and then leave. Where do developers really *waste* their time? I think the answer is obvious - it is during the build time (it is so painfully apparent that even GitHub Copilot knows it):

![](/blog/a-couple-of-attempts-of-sharing-knowledge/07.png)

So, in the second attempt, I've written a Gradle script that outputs a random tip at the end of every build:

```
gradle.addListener(new BuildAdapter() {

  @Override
  void projectsEvaluated(Gradle gradle) {
    super.projectsEvaluated(gradle)
    printTipOfWeek()
  }

  @Override
  void buildFinished(BuildResult result) {
    super.buildFinished(result)
    printTipOfWeek()
  }

  void printTipOfWeek() {
    def directoryPath = new File(project.rootDir, 'tips-of-week').toPath()
    def allFiles = []

    if (Files.exists(directoryPath) && Files.isDirectory(directoryPath)) {
      allFiles = Files.walk(directoryPath)
              .filter(Files.&isRegularFile)
              .toList()
    }

    if (!allFiles.isEmpty()) {
      def randomFile = allFiles.get(new Random().nextInt(allFiles.size()))
      def content = new String(Files.readAllBytes(randomFile))
      def lines = content.readLines()
      def maxLength = Math.min(lines.collect { it.length() }.max(), 120)

      def asteriskLine = '*' * maxLength

      println '\u001B[33m'
      println asteriskLine
      println '********** TIP OF THE DAY ************'.center(maxLength, '*')
      println asteriskLine
      lines.each { line ->
        if (!line.contains('Tip of the week')) {
          println line
        }
      }
      println asteriskLine
      println '\u001B[0m'
    }
  }
})
```

Now developers receive tips when the build is running, and nothing useful can be done anyway:

-   in IDEA:
    
    ![](/blog/a-couple-of-attempts-of-sharing-knowledge/08.png)
    
-   in terminal:
    
    ![](/blog/a-couple-of-attempts-of-sharing-knowledge/09.png)
    
-   in CI:
    
    ![](/blog/a-couple-of-attempts-of-sharing-knowledge/10.png)
    

Compared to the Slack approach, I think the moment to reach developers is much better. However, it is hard to gather feedback or give an opportunity to explore more tips.

### 🫴 Scaling

It is hard to collect hard evidence if people are really being educated with both these approaches, especially with the second one. However, I think it is a good start, and it is worth trying. Now, I encourage teammates to write down helpful knowledge bits to the tips library. With the library growing, we can continue to improve the toolset around tips sharing:

-   find new moments to reach developers
    
-   aggregate feedback from Slack automatically
    
-   contextualize tips based on current action (for example, surface tips about writing tests during test task execution)
