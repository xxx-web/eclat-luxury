---
name: eclat-luxury
description: >
  Generates the ÉCLAT luxury ecommerce website (jewelry, perfume, handbags) 
  using React + Vite + TypeScript + Tailwind CSS + Edge Functions.
  This skill should be used when the user wants to create, improve, or redeploy 
  the ÉCLAT luxury brand website for the WorkBuddy × Tencent EdgeOne 
  AI Prompts × Skills Challenge.
  Trigger examples: "generate ÉCLAT website", "improve the luxury site", 
  "deploy ÉCLAT to EdgeOne Pages", "create the jewelry ecommerce site".
metadata:
  author: Moli
  version: "2.0.0"
---

# ÉCLAT Luxury Ecommerce Website Skill

Generate a premium luxury ecommerce website for the ÉCLAT brand using React + Vite + TypeScript + Tailwind CSS + Edge Functions.

## When to use this skill

- Creating the ÉCLAT luxury ecommerce website from scratch
- Improving an existing ÉCLAT website (adding hooks, optimizing components)
- Deploying ÉCLAT to EdgeOne Pages
- Modifying the website based on the challenge prompt

**Do NOT use for:**
- Generic ecommerce templates (Shopify-like)
- SaaS landing pages
- Non-luxury brand websites

## How to use this skill

1. **Read the Prompt file**: Read `eclat-challenge-prompt.md` to get the complete Prompt
2. **Copy the Prompt**: Copy the code block from `eclat-challenge-prompt.md` (from ``` to ```)
3. **Feed to AI tool**: Paste the Prompt into your AI coding tool
4. **Set up the project**:
   ```bash
   npm create vite@latest eclat-luxury -- --template react-ts
   cd eclat-luxury
   npm install
   npm install -D tailwindcss @tailwindcss/vite framer-motion lucide-react tailwindcss-animate
