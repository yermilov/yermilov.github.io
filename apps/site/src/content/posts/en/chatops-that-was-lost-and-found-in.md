---
title: "Chatops that was lost and found in time"
canonicalSlug: "chatops-that-was-lost-and-found-in"
language: "en"
publishedAt: 2023-09-22
summary: "Automations for development processes unveil hidden complexity in such trivial things you could never imagine there would be any problems. Believe me, today I will talk about a task to print a date and a time."
tags: []
translations:
  en: "chatops-that-was-lost-and-found-in"
coverImage: "/blog/chatops-that-was-lost-and-found-in/01.png"
---
Automations for development processes unveil hidden complexity in such trivial things you could never imagine there would be any problems. Believe me, today I will talk about a task to print a date and a time.

### 🕰️ So when?

Is it some imaginary illustration for the sake of a blog post? No :) This is one of the problems I was working on recently: We have a service with dozens of code contributors from many different teams and a release schedule. We want to implement a Slack bot to post a message to a special channel with the expected time for the next release.

What's so hard about it? - you may ask and write something like:

```
private static final DateTimeFormatter DATE_TIME_FORMATTER = new DateTimeFormatterBuilder()
        .appendValue(HOUR_OF_DAY, 1, 2, SignStyle.NORMAL)
        .appendLiteral(':')
        .appendValue(MINUTE_OF_HOUR, 2)
        .appendLiteral(" on ")
        .appendText(MONTH_OF_YEAR, TextStyle.SHORT_STANDALONE)
        .appendLiteral(' ')
        .appendValue(DAY_OF_MONTH, 2)
        .toFormatter();

private String nextReleaseMessage(Instant nextReleaseInstant, Person oncallEngineer) {
    ZonedDateTime nextReleaseTime = nextReleaseInstant.atZone(ZoneId.of(oncallEngineer.getTimezone()));

    return ":flag-ua: Next capi-server release is planned " +
            DATE_TIME_FORMATTER.format(nextReleaseTime) +
            " by <@" + oncallEngineer.getSlackId() + ">\n\n" +
            "Release guidelines: https://core.gpages.io/common-api/capi-releases\n" +
            "This thread is the place to ask questions about the release, find more details and important announcements :arrow-down:";
}
```

Of course, those of you who realize how many [misconceptions about time we have](https://infiniteundo.com/post/25509354022/more-falsehoods-programmers-believe-about-time) will immediately recognize the time zone trap. Grammarly has people working in Ukraine, Poland, Germany, Portugal, the US, and Canada. Those people will likely be confused, not knowing what time zone was used in your message, and assume one of them with a high chance of picking the wrong one.

![](/blog/chatops-that-was-lost-and-found-in/02.png)

It is not that hard to fix it by mentioning the time zone explicitly in the message using a different formatter:

```
private static final DateTimeFormatter DATE_TIME_FORMATTER = new DateTimeFormatterBuilder()
         .appendValue(HOUR_OF_DAY, 1, 2, SignStyle.NORMAL)
         .appendLiteral(':')
         .appendValue(MINUTE_OF_HOUR, 2)
+        .optionalStart()
+        .appendLiteral(" (")
+        .parseCaseSensitive()
+        .appendZoneRegionId()
+        .appendLiteral(" time)")
         .appendLiteral(" on ")
         .appendText(MONTH_OF_YEAR, TextStyle.SHORT_STANDALONE)
         .appendLiteral(' ')
         .appendValue(DAY_OF_MONTH, 2)
         .toFormatter();
```

Done!

![](/blog/chatops-that-was-lost-and-found-in/03.png)

### ⏳ But seriously, when?

But let's ask ourselves: is it a good developer experience? Every time you see this message, you need to do some mental calculations or go to one of the sites like [timeanddate.com](https://www.timeanddate.com/) to figure out how many hours are left before the next release.

Let's try to use that fact: instead of printing the exact time of the next release, let's delegate calculations to the machine and print the number of hours remaining:

```
private String nextReleaseMessage(Instant nextReleaseInstant, Person oncallEngineer) {
    Duration between = Duration.between(Instant.now(), nextReleaseInstant);
    long hours = between.dividedBy(Duration.ofHours(1));

    return ":flag-ua: Next capi-server release is planned in " +
            hours + (hours == 1 ? " hour" : " hours") +
            " by <@" + oncallEngineer.getSlackId() + ">\n\n" +
            "Release guidelines: https://core.gpages.io/common-api/capi-releases\n" +
            "This thread is the place to ask questions about the release, find more details and important announcements :arrow-down:";
}
```

What do you think?

![](/blog/chatops-that-was-lost-and-found-in/04.png)

To me, it is undoubtedly better because a message is now universal for everyone, regardless of time zone. But instead, we have created an invalidation problem: Those who see the message from the bot immediately will get the correct notion, but others who see the same message several hours later will be challenged. Similar to the previous approach, they will either misunderstand the message or have to do the math themselves by adding hours to the message sent time.

Even if you argue that we can update the message regularly to keep the number of hours current, you can't avoid the confusion: Some people will keep adding the number of hours to the message sent time and misunderstand the message. Unfortunately, Slack does not show the last message update time.

### ⏰ Wait, when?

What is remarkable about the message-sending time shown by Slack is that it is shown in the user's local time zone. I bet you never appreciated this fact as much as you do now. If only we could do the same with the time of the next release inside the message!

*Maybe soon, writing assistants like Grammarly will invisibly convert time references to the reader's timezone, but meanwhile, here is a trick on how to do it by yourself.*

How can we access user's local time zone? We certainly can't do it from the Slack message text, but if instead of a Slack bot, we use a web page, we can:

```
let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
```

Posting a message with a link to the web page with this info certainly qualifies as a solution and as cheating at the same time:

```
private String nextReleaseMessage() {
    return ":flag-ua: capi-server release schedule: https://core.gpages.io/common-api/capi-releases/schedule\n" +
            "This thread is the place to ask questions about the release, find more details and important announcements :arrow-down:";
}
```

![](/blog/chatops-that-was-lost-and-found-in/05.png)

Let's try to stick to the original problem setup. The final solution I suggest is quite universal and can be used for any situation where you must marry ChatOps and time references. Let's create a web page that converts the timestamp to the user's local timezone.

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <div id="output"></div>
            
    <script>
      const outputElement = document.getElementById('output');
            
      // Set the timestamp
      const timestamp = '2022-09-19T15:00:00Z';
            
      // Convert the timestamp to the user's local timezone
      const date = new Date(timestamp);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatter = new Intl.DateTimeFormat(undefined, { timeZone, year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      const formattedDate = formatter.format(date);
            
      // Display the formatted timestamp and timezone on the web page
      const message = `The referenced moment is <time>${formattedDate}</time> your local time.<br>We have detected that your timezone is <strong>${timeZone}</strong>.`;
      outputElement.innerHTML = message;
    </script>
  </body>
</html>
```

![](/blog/chatops-that-was-lost-and-found-in/06.png)

You don't even need a web server to serve this page; everything can be encoded into the link using the following trick:

```
String linkUrl = "data:text/html;base64," + Base64.getEncoder().encodeToString(page.getBytes());
```

Now, all you need to do is to keep either time with timezone or number of hours left in your original Slack message, but enrich it with a link that will clarify any confusion and do all the needed math for you:

```
private String nextReleaseMessage(Instant nextReleaseInstant, Person oncallEngineer) {
    Duration between = Duration.between(Instant.now(), nextReleaseInstant);
    long hours = between.dividedBy(Duration.ofHours(1));

    String linkText = "in " + hours + (hours == 1 ? " hour" : " hours");
    String page = PAGE_TEMPLATE.replace("${timestamp}", DateTimeFormatter.ISO_INSTANT.format(nextReleaseInstant));
    String linkUrl = "data:text/html;base64," + Base64.getEncoder().encodeToString(page.getBytes());

    return ":flag-ua: capi-server release is planned <" +
            linkUrl + "|" + linkText +
            "> by <@" + oncallEngineer.getSlackId() + ">\n\n" +
            "Release guidelines: https://core.gpages.io/common-api/capi-releases\n" +
            "This thread is the place to ask questions about the release, find more details and important announcements :arrow-down:";
}
```

The problem with such an approach is that you need to minify the page template as much as you can:

```
private static final String PAGE_TEMPLATE = """
            <html><body><script>d=new Date("${timestamp}"),z=Intl.DateTimeFormat().resolvedOptions().timeZone,f=new Intl.DateTimeFormat(void 0,{timeZone:z,dateStyle:'short',timeStyle:'short'});document.body.innerHTML=`The referenced moment is ${f.format(d)} in your timezone ${z}.`;</script></body></html>
            """;
```

And still, such links will probably be blocked because of obvious security risks. For example, nothing happens if you click it in Slack:

![](/blog/chatops-that-was-lost-and-found-in/07.png)

Substack also does not recognize it, but you can try to copy it in your browser address box manually:

```
data:text/html;base64,PGh0bWw+PGJvZHk+PHNjcmlwdD5kPW5ldyBEYXRlKCIyMDIzLTA5LTE5VDIyOjI2OjAzLjMyNjY1MDEwOFoiKSx6PUludGwuRGF0ZVRpbWVGb3JtYXQoKS5yZXNvbHZlZE9wdGlvbnMoKS50aW1lWm9uZSxmPW5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KHZvaWQgMCx7dGltZVpvbmU6eixkYXRlU3R5bGU6J3Nob3J0Jyx0aW1lU3R5bGU6J3Nob3J0J30pO2RvY3VtZW50LmJvZHkuaW5uZXJIVE1MPWBUaGUgcmVmZXJlbmNlZCBtb21lbnQgaXMgJHtmLmZvcm1hdChkKX0gaW4geW91ciB0aW1lem9uZSAke3p9LmA7PC9zY3JpcHQ+PC9ib2R5PjwvaHRtbD4K
```

So that was a miss! As a more viable alternative, [timeanddate.com](https://www.timeanddate.com/) mentioned above offers you a similar web page you can reference via a link like [timeanddate.com/worldclock/fixedtime.html?iso=20230919T1920](http://timeanddate.com/worldclock/fixedtime.html?iso=20230919T1920):

```
String linkUrl = "https://www.timeanddate.com/worldclock/fixedtime.html?iso=" + DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmm").format(nextReleaseInstant);
```

![](/blog/chatops-that-was-lost-and-found-in/08.png)

![](/blog/chatops-that-was-lost-and-found-in/09.png)

As for the real task I mentioned, I ended up making a custom web page mostly following [timeanddate.com](https://www.timeanddate.com/) ideas but making it a bit more concise and convenient:

```
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Typography, Grid, TextField } from '@material-ui/core';
import moment from 'moment-timezone';

const timeZones = [
    "America/Vancouver",
    "America/Los_Angeles",
    "America/New_York",
    "Europe/Lisbon",
    "Europe/Berlin",
    "Europe/Warsaw",
    "Europe/Kiev",
];

const formatDate = (date, timezone) => {
    const now = moment.tz(timezone);
    const localDate = moment.tz(date, timezone);

    if (now.isSame(localDate, 'day')) {
        return `today ${localDate.format('HH:mm')}`;
    }
    if (now.clone().add(1, 'day').isSame(localDate, 'day')) {
        return `tomorrow ${localDate.format('HH:mm')}`;
    }
    if (now.isSame(localDate, 'year')) {
        return localDate.format('MMM Do HH:mm');
    }
    return localDate.format('MMM Do YYYY HH:mm');
};

const LocalTime = () => {
    const [localTime, setLocalTime] = useState(null);
    const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const timeParam = params.get('time');

        if (!timeParam) {
            setIsLoading(false);
            return;
        }

        const inputTime = new Date(timeParam);
        setLocalTime(formatDate(inputTime, timeZone));
        setIsLoading(false);
    }, [location.search, timeZone]);

    const handleTimeZoneChange = (e) => {
        setTimeZone(e.target.value);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const timeParam = params.get('time');
        const inputTime = new Date(timeParam);
        setLocalTime(formatDate(inputTime, timeZone));
    }, [timeZone, location.search]);

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={12} md={12}>
                    <Typography variant='h4' gutterBottom style={{ fontSize: '2em', marginBottom: '20px' }}>
                        {localTime ?
                            <>
                                The referenced moment is {localTime} your local time.<br />
                                We have detected that your timezone is {timeZone}.<br />
                                You can change it here:
                            </> :
                            'Invalid or missing time parameter'
                        }
                    </Typography>
                    <TextField
                        select
                        label="Timezone"
                        value={timeZone}
                        onChange={handleTimeZoneChange}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        {timeZones.map((zone) => (
                            <option key={zone} value={zone}>
                                {zone}
                            </option>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
        </div>
    );
};

export default LocalTime;
```

So the final results:

![](/blog/chatops-that-was-lost-and-found-in/10.png)

![](/blog/chatops-that-was-lost-and-found-in/11.png)
