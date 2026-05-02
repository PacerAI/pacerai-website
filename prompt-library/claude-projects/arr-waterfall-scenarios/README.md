# ARR Waterfall Scenario Analysis — Claude Project Setup

## Overview

This Claude Project helps PE-backed SaaS operators build multi-scenario stress tests from their ARR Waterfall model. Users upload their workbook and get step-by-step instructions to create scenario tabs, charts, and valuation impact tables.

## Setup Instructions (Claude Pro / Teams)

### 1. Create the Project

1. Go to [claude.ai](https://claude.ai) → Projects → **New Project**
2. Name it: **ARR Waterfall Scenario Analysis**

### 2. Add System Prompt

1. Open Project Settings → **Instructions**
2. Paste the contents of `system-prompt.md`

### 3. Add Knowledge Files

1. Click **Add content** → **Add text content**
2. Upload `knowledge.md` as a knowledge file
3. Optionally upload the companion Excel template from `../excel-templates/arr-waterfall-model.xlsx` (when available)

### 4. Test

1. Open a new conversation in the project
2. Upload a sample ARR Waterfall workbook
3. Type: "Build a scenario analysis from this workbook"
4. Verify Claude produces correct cell references and formulas

## Sharing with Clients

### Claude Teams (Recommended)
- Add the client to your Claude Teams workspace
- The Project is automatically visible to all workspace members

### Claude Pro
- Export the system prompt and knowledge file
- Send the client setup instructions:
  1. Create a new Project on their Claude Pro account
  2. Paste the system prompt into Instructions
  3. Upload the knowledge file
  4. Start a conversation and upload their workbook

## Updating

When the prompt or knowledge changes:
1. Update the source files in this directory
2. Manually update the Claude Project at claude.ai
3. If clients are on Claude Pro, send them the updated files
