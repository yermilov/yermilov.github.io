---
title: "Reverse-engineering Claude Code's tip system"
canonicalSlug: "claude-code-tip-system"
language: "en"
publishedAt: 2025-08-25
summary: "How Claude Code targets users with tips at the best possible moment — during model thinking — using cooldown windows, contextual relevance, and graduated learning."
tags:
  - ai-coding
  - claude-code
translations:
  en: "claude-code-tip-system"
---
I love how in the era of attention bankruptcy, Claude Code targets users with their tips at the best possible moment: during the model thinking. User is already engaged, but also kind of bored and would automatically grasp pieces of content to avoid context switching to something else. Moreover they combine user experience tracking, cooldown management, and contextual relevance to determine when tips should appear. How do I know? I've asked Claude Code to reverse engineer its own code 🤭

So, in Claude Code words:

> Each tip has a `cooldownSessions` period (typically 10+ sessions) and an `isRelevant()` function that checks conditions like user maturity (`numStartups > 50` for experienced users), concurrent session limits (`ie() <= 1` to ensure single-session focus), and other behavioral patterns. The system maintains a `tipsHistory` object to track when each tip was last shown, uses priority weighting to favor tips that haven't been displayed recently, and only shows tips during appropriate usage contexts - creating a graduated learning experience that prevents overwhelming new users while providing relevant guidance to experienced users during focused work sessions.
