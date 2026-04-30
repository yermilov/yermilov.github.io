---
title: "Guiding team processes with ChatOps: On-call (Part 1)"
canonicalSlug: "guiding-team-processes-with-chatops"
language: "en"
publishedAt: 2023-12-01
summary: "As your team grows, you need to scale its culture. There is no doubt that things like a high hiring bar are critical, but still, there is a limit to what can be achieved by only smart people talking in the office kitchen"
tags: []
translations:
  en: "guiding-team-processes-with-chatops"
coverImage: "/blog/guiding-team-processes-with-chatops/01.png"
---
![](/blog/guiding-team-processes-with-chatops/01.png)

As your team grows, you need to scale its culture. There is no doubt that things like a high hiring bar are critical, but still, there is a limit to what can be achieved by only smart people talking in the office kitchen and agreeing to do something. At a certain point, you need to transform culture into processes. Culture is something natural that sustains itself, but processes are man-made and often unfitting to the natural pace of things. One of the ways to guide processes in the right direction is by automating them using ChatOps. I want to share some lessons I’ve learned while doing it to establish good on-call processes on my team.

But before the lessons learned, I want to take a second and ask you to subscribe to this blog. Of course, if you want to read more from me. That's exactly how I interpret this number - 28 people already want to read what I write regularly, and that's a great motivation to continue. You are more than welcome to join our little group - the subscription means that you will receive an email every time I publish a new story, which usually happens every other week (sometimes every week). If you are already subscribed - my gratitude and ChatOps on-call ideas are for you! 🤗

Subscribe

![](/blog/guiding-team-processes-with-chatops/02.png)

### 💭 Slack on-call topic

This one seems quite obvious: in the channel where people ask your team questions, keep the topic as “`Oncall engineer: @igor.sikorsky`”, so people know who is the contact person. Quite often, I see it is done manually, either by a person who leaves on-call (I don’t want to receive questions anymore), a person who enters on-call (please write your question to me), or a team manager (I’m maintaining processes for my team). Note that for the second and third options, you will not notice anything going wrong if you forget to do your part, but for the first one - you will keep receiving questions you don’t want to receive. **This is a crucial principle of building manual processes: always create an instructional feedback loop that signals wrong behavior and guides it to correction.**

I could say that in this case, I recommend the first option, except for the fact that there is one more principle above the previous one: **The only way to make the manual process better than self-correcting is to make it automatic in the first place.** All you need is a service that has access to your Slack and your PagerDuty:

```
List<Person> oncallEngineers = getOncallEngineers(now);
setSlackTopic(channel, "Oncall engineers: " + oncallEngineers.stream().map(Person::name).collect(joining(", "));
```

![](/blog/guiding-team-processes-with-chatops/03.png)

Easy enough, right? Well, putting real-life processes into code unveils all of the ambiguous parts that we as humans process instinctively, but machines need direct instructions on how to handle them. As an example, from time to time, engineers take on-call temporarily, let’s say, for one hour, to monitor the rollout of their changes more carefully. We don’t want to change the Slack topic for that because it may be spammy, and also, this temporal on-call engineer is not supposed to answer incoming questions. To do so, let’s find stable on-call engineers - people who are on-call for at least two hours straight:

```
List<Person> oncallEngineers = getStableOncallEngineers(now);
setSlackTopic(channel, "Oncall engineers: " + oncallEngineers.stream().map(Person::name).collect(joining(", "));

List<Person> getStableOncallEngineers(ZonedDateTime start) {
  List<Person> stableOncallPersons = List.of();
  ZonedDateTime when = start;

  while (stableOncallPersons.isEmpty() && Duration.between(start, when).compareTo(Duration.ofDays(7)) < 0) {
    List<Person> oncallPersonsAtMoment = getOncallEngineers(when);
    List<Person> oncallPersonsInTwoHours = getOncallEngineers(when.plusHours(2));

    stableOncallPersons = oncallPersonsAtMoment.stream()
          .filter(oncallPerson -> oncallPersonsInTwoHours.stream().anyMatch(oncallPerson::equals))
          .toList();

    when = when.plusHours(1);
  }

  return stableOncallPersons;
}
```

### 🎸 Slack on-call group

Sometimes people need to summon the on-call engineer to another channel. Because it is kinda hard in such a situation (it may be real deal urgent and stressful) to remember your team home channel name, go to it, and check the on-call engineer name, people tend to tag the tech lead, manager, or even random team members they know best. There is a quite simple way to guide this behavior to a better way - maintain `@on-call` Slack group that always contains only on-call engineers.

I’ve rarely seen this process implemented manually; probably, it crosses the line of how easy it is to maintain this procedure. However, it is quite easy to automate it following the same approach as the on-call topic:

```
List<Person> oncallEngineers = getOncallEngineers(now);
updateUsergroupList(oncallGroupId, oncallEngineers);
```

![](/blog/guiding-team-processes-with-chatops/04.png)

Note that in this case, it does not make sense to use `getStableOncallEngineers` - if someone takes on-call for an hour, they would probably want to be notified if someone is looking for the attention of an on-call engineer at the same time. Once the temporal on-call shift is over, this person is removed from the `@on-call` and from further on-call conversations.

The lesson here is that **people always follow the most convenient path through the process - make sure that the one you want everyone to follow is really the most convenient one.**

### 🗓️ On-call schedule reminder

Paradox: without these tools mentioned above, people need to check their on-call schedule regularly to see whether it is time for them to put themselves into Slack topic and Slack group or not. But with these tools in place, you don't need to double-check the schedule - once your rotation comes, everything will be updated automatically. What I saw in practice is it resulted in people being caught by surprise by the fact that they entered on-call today.

To mitigate it, I've extended the bot to post the oncall schedule for the next month every week. Given that API allows us to check who is on-call at a specific instant, we need to check with the 3-hour step who is on-call at that moment and detect changes in the rotation to compose the message.

```
ZonedDateTime zonedNow = Instant.now().atZone(projectZoneId).withMinute(0);
ZonedDateTime scheduleEnd = zonedNow.plusMonths(1);

DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d");
StringBuilder scheduleMessage = new StringBuilder();

List<Person> previousOncallPersons = null;
ZonedDateTime oncallStart = zonedNow;

ZonedDateTime currentDateTime = zonedNow;
while (currentDateTime.isBefore(scheduleEnd)) {
  List<Person> currentOncallPersons = getOncallEngineers(currentDateTime);

  if (!currentOncallPersons.equals(previousOncallPersons)) {
    // exclude current on-call
    if (!oncallStart.toLocalDate().equals(zonedNow.toLocalDate())) {
      scheduleMessage
        .append(toSlackMentions(previousOncallPersons))
        .append(" ")
        .append(oncallStart.format(formatter))
        .append(" - ")
        .append(currentDateTime.format(formatter))
        .append("\n");
    }

    previousOncallPersons = currentOncallPersons;
    oncallStart = currentDateTime;
  }

  currentDateTime = currentDateTime.plusHours(3);
}

if (previousOncallPersons != null) {
  ZonedDateTime endOfLastOncall = currentDateTime;
  while (getOncallEngineers(endOfLastOncall).equals(previousOncallPersons)) {
    endOfLastOncall = endOfLastOncall.plusHours(3);
  }

  scheduleMessage
    .append(toSlackMentions(previousOncallPersons))
    .append(" ")
    .append(oncallStart.format(formatter))
    .append(" - ")
    .append(endOfLastOncall.format(formatter))
    .append("\n");
}

String oncallScheduleMessage = ":calendar-fire-fine: *JFYI ONCALL SCHEDULE* :party-calendar:\n\n" + scheduleMessage + "\nYou can use this thread to ask for re-schedule :thread:";
```

The nice thing is that this message creates a natural place to discuss swaps and reschedules in case someone needs them. And the lesson to learn is that **you need to monitor secondary effects from your changes in processes and react to them. Then monitor secondary effects after your reaction and repeat it until it stabilizes around the state you are happy with.**

*Next week, I continue with two more ChatOps ideas accompanied by lessons learned from them: On-call handoff and On-call engineer is out.*

[

## Guiding team processes with ChatOps: On-call (Part 2)

](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops-662)

[Yarik Yermilov](https://substack.com/profile/136944163-yarik-yermilov)

·

December 8, 2023

[![Guiding team processes with ChatOps: On-call (Part 2)](/blog/guiding-team-processes-with-chatops/05.png)](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops-662)

Last week, we talked about shaping team processes with ChatOps using a Slack on-call topic, Slack on-call group, and On-call schedule reminder as examples. Now let’s add two more ChatOps ideas accompanied by lessons learned from them: On-call handoff

[

Read full story

](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops-662)

---

Thank you for reading! If you find my writing useful or entertaining, here are a couple of ways to express it:

-   subscribe to receive an email every time I publish a new story:
    

Subscribe

-   donate $1 to the [🇺🇦 The Come Back Alive Fund](https://savelife.in.ua/en/donate-en/#donate-army-card-monthly) and post a comment about it here:
    

[Leave a comment](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops/comments)

-   share the post with your friends or colleagues:
    

[Share](https://greenflamingo.substack.com/p/guiding-team-processes-with-chatops?utm_source=substack&utm_medium=email&utm_content=share&action=share)

-   press the like button 🤍 below