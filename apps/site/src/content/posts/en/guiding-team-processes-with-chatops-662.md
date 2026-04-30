---
title: "Guiding team processes with ChatOps: On-call (Part 2)"
canonicalSlug: "guiding-team-processes-with-chatops-662"
language: "en"
publishedAt: 2023-12-08
summary: "Last week, we talked about shaping team processes with ChatOps using a Slack on-call topic, Slack on-call group, and On-call schedule reminder as examples."
tags: []
translations:
  en: "guiding-team-processes-with-chatops-662"
coverImage: "/blog/guiding-team-processes-with-chatops-662/01.png"
---
![](/blog/guiding-team-processes-with-chatops-662/01.png)

Last week, we talked about shaping team processes with ChatOps using a *Slack on-call topic*, *Slack on-call group*, and *On-call schedule reminder as examples*.

[

## Guiding team processes with ChatOps: On-call (Part 1)

](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops)

[Yarik Yermilov](https://substack.com/profile/136944163-yarik-yermilov)

·

December 1, 2023

[![Guiding team processes with ChatOps: On-call (Part 1) ](/blog/guiding-team-processes-with-chatops-662/02.png)](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops)

As your team grows, you need to scale its culture. There is no doubt that things like a high hiring bar are critical, but still, there is a limit to what can be achieved by only smart people talking in the office kitchen and agreeing to do something. At a certain point, you need to transform culture into processes. Culture is something natural that sust…

[

Read full story

](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops)

Now let’s add two more ChatOps ideas accompanied by lessons learned from them: *On-call handoff* and *On-call engineer is out*.

But before the new ideas, I want to take a second and ask you to subscribe to this blog. Of course, if you want to read more from me. That's exactly how I interpret this number - 30 people already want to read what I write regularly, and that's a great motivation to continue. You are more than welcome to join our little group - the subscription means that you will receive an email every time I publish a new story, which usually happens every other week. If you are already subscribed - my gratitude and ChatOps on-call ideas are for you! 🤗

Subscribe

![](/blog/guiding-team-processes-with-chatops-662/03.png)

### 🏃‍♀️ On-call handoff

We have tried to establish the process of on-call handoff for months. Here is the list of things that didn’t work out:

-   agree on the team meeting that we need to do on-call handoff every week
    
-   create a dedicated weekly on-call handoff meeting
    
-   practice what you preach from handoff supporters
    
-   reminders from the manager to do oncall handoff
    

All of them followed the same scenario: for several weeks, we do on-call handoff, then skip once for some totally valid reason, skip the second time after a few more weeks, and then abandon practice completely.

What happened? As we already discussed, there was no instructional feedback in case the handoff process was skipped. Basically, if handoff is not done, nothing happens. But what is tricky in this situation is that it is hard to automate such a feedback loop. How can the Slack bot know if the handoff happened or not?

The solution is that **in case you can’t create an instructional feedback loop, create at least an automated positive nudge toward a better process.** For the on-call handoff, the most impactful process change was to make the Slack bot post a reminder in case it detects that the on-call engineer will change in the next six hours.

```
ZonedDateTime zonedNow = Instant.now().atZone(projectZoneId);

List<Person> allOncallPersonsBefore = getStableOncallEngineers(zonedNow);

ZonedDateTime zonedAfter = zonedNow.plusHours(6);
while (!DateTimeService.isBusinessDay(zonedAfter)) {
  zonedAfter = zonedAfter.plusHours(1);
}
List<Person> allOncallPersonsAfter = getStableOncallEngineers(zonedAfter);
 
List<Person> finishingOncall = allOncallPersonsBefore.stream()
    .filter(oncallNow -> !personService.isPersonInList(oncallNow, allOncallPersonsAfter))
    .toList();

List<Person> startingOncall = allOncallPersonsAfter.stream()
    .filter(oncallInSixHours -> !personService.isPersonInList(oncallInSixHours, allOncallPersonsBefore))
    .toList();

if (!finishingOncall.isEmpty() && !startingOncall.isEmpty()) {
  String oncallHandoffMessage = "*ONCALL HANDOFF THREAD* :thread:\n\n" +
      toSlackMentions(finishingOncall) +
      " please use this thread to share oncall context with " +
      toSlackMentions(startingOncall) +
      "\n\nThank you! :handshake:";
}
```

What is interesting about this code? Of course, don’t forget to use stable on-call engineers here to avoid asking to do handoffs for a one-hour on-call override. Also, when you are checking if the on-call is changing soon - skip the weekend and holidays. In rotation happens on Saturday, it is better to post a handoff reminder on Friday, while it is still business hours.

### 🤒 On-call engineer is out

What happens if an on-call engineer is out for some reason? They may get sick, have an urgent errand, or even forget to reschedule the rotation that overlaps with a holiday or vacation. Well, if your team is lucky enough, the rotation will be smooth and no one will even notice it. If you are not so lucky, non-urgent on-call matters will start to pile up, and in case of something urgent like a production outage, you will need to find someone to cover FAST. Of course, systems like PagerDuty have a concept of escalation so in case on-call is not responding, someone else will be notified. But it will happen only if there is already an incident - wouldn't be better to fix it proactively?

The initial Slackbot idea here is quite obvious: if an on-call engineer is out, then post a message to the team Slack channel.

```
List<Person> allOncallPersonsNow = getStableOncallPersonsForAllSchedules(project);
boolean isAllOncallOutOfOfficeNow = allOncallPersonsNow.stream().allMatch(oncallPerson -> personService.isOutOfOffice(oncallPerson));
```

To reduce spam, it also makes sense to check if the person will also be out in 2 hours - maybe it is short AFK:

```
List<Person> allOncallPersonsInTwoHours = getStableOncallPersonsForAllSchedules(project, inTwoHours);
boolean isAllOncallOutOfOfficeInTwoHours = allOncallPersonsInTwoHours.stream().allMatch(oncallPerson -> personService.isOutOfOffice(oncallPerson, inTwoHours.toInstant()));
```

How to identify that person is out? Simpler is better in this case: without looking for anything more sophisticated, you can check a person's Slack status. In 80% of cases, it is enough, which is Pareto-acceptable for us.

![](/blog/guiding-team-processes-with-chatops-662/04.png)

![](/blog/guiding-team-processes-with-chatops-662/05.png)

So far, we didn't get a lot, as this person probably already posted something like “Hey folks, I'm out, please cover for me 🙏”. Can we do more? What's the main problem here? The original on-call engineer posted message and went offline, they quite probably don't have time to control that someone volunteered to cover. So the best improvement we can make is to repeat the reminder until there is a volunteer.

```
if (isAllOncallOutOfOfficeNow && isAllOncallOutOfOfficeInTwoHours) {
  if (previousOncallOutOfOfficeMessage == null || Duration.between(getTimeOfMessage(previousOncallOutOfOfficeMessage), Instant.now()).toHours() >= 2) {
    String oncallOutOfOfficeMessage = ":mild-panic-intensifies: <!subteam^S012DETECEA|@capi-all>, {{oncall}} (who is on-call now) {{is/are}} out of office. Could someone please take over the on-call?"
      .replace("{{oncall}}", toSlackMentions(allOncallPersonsNow))
      .replace("{{is/are}}", isAre(allOncallPersonsNow));
  }
}
```

It also aligns very well with the instructional feedback loop principle: until on-call is covered, the bot will nudge people to correct the wrong situation. However, there is another problem here that leads us to questions of psychology. You asked a group of people to take action and there is a high risk that every one of them will think the same thing: “That shouldn't be me because X (I was on-call last week, I will be on-call next week, I'm behind on my tasks, I already covered last time, etc.). We are a large team and someone else for sure will help with it.” There is no sure strategy against it, but here are some tricks that you can employ:

-   *Reward people for taking the right action*: post a thank you message after someone has taken on-call responsibilities
    

```
if (!isAllOncallOutOfOfficeNow && !isAllOncallOutOfOfficeInTwoHours && previousOncallOutOfOfficeMessage != null) {
  String updatedMessage = ":saluting_face: Thank you " + toSlackMentions(allOncallPersonsNow) + " for taking on-call responsibilities!"
}
```

-   *Re-enforce sense of urgency*: it can be as easy as increasing the number of worried emojis on every consecutive message
    

```
oncallOutOfOfficeMessage = StringUtils.repeat(":mild-panic-intensifies:", previousOncallOutOfOfficeMessagesCount) + oncallOutOfOfficeMessage
```

-   *Personal ask*: even a randomly picked person to ask personally may be better than asking the whole group. Having strict rules, like always asking the next person in the on-call schedule, may be even better.
    

```
oncallOutOfOfficeMessage += " " + toSlackMention(team.get(RandomUtils.nextInt(0, team.size()))) + ", maybe you can do it? :shrek_cat_eyes:";
```

You must be mindful that such an approach may create annoying false positives. Be open with the team and discuss tradeoffs: are you ok with periodic false negatives (on-call is out and no one knows about it) or with periodic false positives (on-call is not out, but notification triggers). **It is impossible to avoid both false positives and false negatives, but it is okay to have one of them as long as your team agrees on which one.**

The lesson here is that **when you try to guide processes, remember that they guide people, so try to think about the psychology aspect a bit.**

### 🧑‍🎓 All lessons together

-   Always create an instructional feedback loop that signals wrong behavior and guides it to correction.
    
-   The only way to make the manual process better than self-correcting is to make it automatic in the first place.
    
-   People always follow the most convenient path through the process - make sure that the one you want everyone to follow is really the most convenient one.
    
-   You need to monitor secondary effects from your changes in processes and react to them. Then monitor secondary effects after your reaction and repeat it until it stabilizes around the state you are happy with.
    
-   In case you can’t create an instructional feedback loop, create at least an automated positive nudge toward a better process.
    
-   It is impossible to avoid both false positives and false negatives, but it is okay to have one of them as long as your team agrees on which one.
    
-   When you try to guide processes, remember that they guide people, so try to think about the psychology aspect a bit.
    

---

Thank you for reading! If you find my writing useful or entertaining, here are a couple of ways to express it:

-   subscribe to receive an email every time I publish a new story:
    

Subscribe

-   donate $1 to the [🇺🇦 The Come Back Alive Fund](https://savelife.in.ua/en/donate-en/#donate-army-card-monthly) and post a comment about it here:
    

[Leave a comment](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops-662/comments)

-   share the post with your friends or colleagues:
    

[Share](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops-662?utm_source=substack&utm_medium=email&utm_content=share&action=share)

-   press the like button 🤍 below