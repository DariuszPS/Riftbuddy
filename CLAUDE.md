# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

RiftBuddy is a static "coming soon" landing page for a Riftbound TCG companion app, hosted on GitHub Pages at `riftbuddy.app`.

## Architecture

Two standalone HTML files — no build step, no dependencies, no package manager:

- `index.html` — primary landing page (live at riftbuddy.app)
- `riftbuddy-coming-soon.html` — alternate/backup coming soon page
- `CNAME` — GitHub Pages custom domain config (`riftbuddy.app`)

Everything is self-contained in each HTML file: all CSS is in `<style>` blocks, all JS is inline `<script>` tags, and all images (logo, card art) are embedded as base64 data URIs. No external JS libraries are used.

External resources loaded at runtime:
- Nunito font via Google Fonts
- Satoshi font via fontshare API

## Design tokens (CSS variables)

```
--bg: #0A0E1F       dark navy background
--bg2: #0D1128      slightly lighter background
--card: #111830     card/panel background
--border: #1E2845   border color
--yellow: #FFC400   primary accent (buttons, headings)
--yellow2: #FFD033  hover state yellow
--cream: #F0E6D3    body text
--gray: #8A9BB8     secondary text
--dark: #4A5878     muted/placeholder text
```

## Deployment

Pushing to `main` deploys automatically via GitHub Pages. No CI/CD pipeline. Changes go live immediately after the GitHub Pages build (~1 min).

## Key interactive features

- Email signup form (hero) — submits to Formspree or similar; success state shown by toggling `.email-success` visibility
- Feature voting buttons (`.vote-btn`) — toggle `.voted` class and persist vote counts in `localStorage`
- Ideas submission textarea — form submit shows `.ideas-success` confirmation state
