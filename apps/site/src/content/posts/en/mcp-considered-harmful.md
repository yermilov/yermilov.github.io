---
title: "MCP Considered Harmful"
canonicalSlug: "mcp-considered-harmful"
language: "en"
publishedAt: 2025-09-01
summary: "MCP tool definitions get preloaded into the context window — they take valuable space, distract the model, and cost you money. Here is when they help and when they hurt."
tags:
  - ai-coding
  - claude-code
translations:
  en: "mcp-considered-harmful"
---
The new version of Claude Code includes a `/context` command that provides a nice visualization of (the context window state) your MCP obsession.

MCP tool definitions are always preloaded to the context window along with system prompt and memory. It means they:

- take valuable space
- distract model from the right solution
- cost you money for every request (although these tokens are typically cached)

MCPs hype is real, and it is essential to remember that this is just an adapter to bridge LLMs with some API and this adapter comes with its own limitations (for example limited response size).

Claude Code thrives in the terminal, so there is no need to put MCP middleman between it and CLI tools. Some of them (like `gh`) are so popular, their knowledge is already embedded into Anthropic models (while GitLab MCP takes 37000 tokens from you!). The others typically are convenient to explore with `--help`. CLIs can be composed, piped, their output can be redirected.

MCPs that just wrap HTTP-based APIs are also waste. Use `curl` or `httpie` and it's familiar CLI environment again with tool knowledge embedded into model and `--help` replaced with a link to swagger spec.

So how to make MCP helpful? Instead of designing from API available, design from the task that LLM need to accomplish. Describe the task in the tool description to guide the right usage. Request parameters should be a variable part of the task. Tool call can hide multiple API/CLI calls and deterministic pre- and post-processing. Response shouldn't be large and should be convenient for LLM processing. Don't user error codes - return error descriptions and instructions on how to recover.
