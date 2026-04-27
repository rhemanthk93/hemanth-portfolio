# /data/ — Knowledge base for askHemanth chat agent

These markdown files are the entire knowledge base for the chat agent. They get concatenated at build time into a single system prompt block (cached via Anthropic prompt caching) and sent with every chat request.

## Structure

```
data/
  bio.md                  # Long-form bio + career arc — third person
  education.md            # SMU degree + ongoing certifications
  contact.md              # Email, socials, agent privacy rules — fill in placeholders
  now.md                  # Current focus — update weekly
  skills.md               # Tech stack
  qa.md                   # 30 first-person Q&A pairs — edit for accuracy + voice
  linkedin-posts.md       # Empty template — append posts as you publish
  projects/
    decision-ledger.md
    raxtor.md
    alpaca-bot.md
    snpdrug3d.md
    ngee-ann-poly-databricks.md
    natural-capital-monetisation.md
    sph-slack-gemini.md
    jpm-liquidity.md
    gic-portfolio-risk.md
```

## What you need to fill in before going live

1. **`contact.md`** — replace all `[REPLACE_WITH_*]` placeholders with real values
2. **`qa.md`** — read every Q&A pair and edit for accuracy + voice. This is the most important file for getting the agent to sound like you. The drafts are starting points, not final.
3. **Project files** — verify dates, stack lists, and add `links.github` / `links.writeup` URLs where relevant. Skim each one for accuracy.
4. **`bio.md`** — review and tighten anywhere that doesn't sound right
5. **`now.md`** — keep this fresh; update weekly

## Voice convention

- `bio.md`, project files, and most descriptive content: **third person** ("Hemanth has worked on...")
- `qa.md`: **first person** ("I moved from banking to data engineering because..."). The agent translates first-person Q&A into third-person responses when speaking to visitors.

This split is intentional: third-person feels right when describing facts about you to a stranger; first-person Q&A is more natural for you to author and edit, and gives the agent your voice and opinions to draw from.

## Updating content later

Just edit any file and `git push`. Vercel rebuilds in 30-60 seconds, the prompt cache invalidates naturally on the next request, and the agent picks up the new content. No CMS, no admin UI, no upload form — git is the interface.

For Phase 2: extend Raxtor with a `portfolio_editor` sub-agent that can edit these files via Telegram. The directory structure is already consistent enough to make pattern-matching reliable.
