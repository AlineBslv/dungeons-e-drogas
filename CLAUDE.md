# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dungeons e Drogas** is an interactive narrative RPG system where Masters and Players interact through an AI narrator called **Mestre Drogon**, creating dynamic, immersive, and cooperative stories within a modern, dark medieval grimoire-inspired interface.

### Product Vision
Create a complete interactive RPG narration system with AI-powered storytelling (via Gemini API), multiplayer Master/Player interactions, and a dark medieval aesthetic—reducing D&D complexity while enhancing immersion.

### Target Audience
- Beginner players who find D&D too complex
- Intermediate masters seeking simplified campaign management
- Experienced groups looking for automation and narrative support tools

### Brand Identity
- **Name:** "Dungeons e Drogas" (playful, irreverent)
- **Tone:** Humorous, casual, "descontraída e irreverente"
- **Visual Theme:** Dark medieval grimoire aesthetic
- **Language:** Brazilian Portuguese (primary), with future multilingual support

## Strategic Pillars

1. **⚙️ AI Intelligence (Mestre Drogon)**: AI narrator and rule arbiter with contextual RPG understanding
2. **🎲 Interactive Player**: Shared session participation with actions, dice rolls, and character roleplay
3. **📜 Narrative & Visual Environment**: Dark medieval responsive UI (grimoire aesthetic)
4. **🧠 Cognitive Base**: AI grounded in official D&D rules and lore
5. **🕹️ Lightweight Multiplayer**: Master ↔ Players connection within campaigns
6. **👤 User & Campaign Management**: Users, character sheets, contexts, history, and persistence

## System Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- Shadcn UI + Tailwind CSS + Framer Motion
- Firebase Authentication
- Dual panel modes: Master (narrative config) + Player (action-focused)

**Backend:**
- Node.js + Express + Firebase Cloud Functions
- Firestore: `users`, `campaigns`, `messages`, `contexts`, `manual_texts`
- Firebase Storage: PDFs and text corpus
- Gemini API for AI narration and embeddings
- VectorDB (Pinecone or Firestore Vector Fields) for semantic search
- WebSockets for multiplayer real-time sync

**Infrastructure:**
- CI/CD: GitHub Actions → Firebase Hosting + Functions / Vercel
- Security: Firebase Auth + Firestore rules (role-based read/write)
- Monitoring: Cloud Logging + Vercel Analytics
- Alerts: Discord/Slack notifications for AI errors and 500s

### Core Modules

| Module | Description | Dependencies |
|--------|-------------|--------------|
| **💬 Chat Narrativo Drogon** | Master ↔ AI dialogue interface using Gemini API + context | MVP IA |
| **⚔️ Jogador (Player Portal)** | Player interface with character sheets, quick actions, inventory, dice rolling | Sessions & Auth |
| **🧙 Painel Mestre/Admin** | Campaign control, narrative parameters, AI context, session summaries | Contexts, Firestore |
| **🧠 Base Cognitiva (RPG Core)** | D&D books extraction and embeddings | Storage |
| **🕹️ Sessões Multiplayer** | Real-time sync (Master ↔ Players) | Auth, Campaigns |
| **🧾 User Auth & Profiles** | Registration, roles (Master/Player), login | Firestore |
| **⚙️ Sistema & Logs Panel** | Monitor AI, requests, context, campaign usage | Firebase |
| **🎨 Design System & Theme** | Shadcn UI, Dark Medieval palette, runic icons | Global |

### Data Models

**Users:**
```javascript
/users/{uid}
  tier: "mestre" | "jogador"
  active_campaigns: [...]
  name: string
  preferred_tone: "epic" | "casual" | "horror"
```

**Campaigns:**
```javascript
/campaigns/{campaignId}
  master_uid: string
  players: [uid1, uid2, ...]
  context: { tone, detail_level, language, style }
  created_at: timestamp
  last_session: timestamp
```

**Messages:**
```javascript
/messages/{campaignId}/{messageId}
  sender: "mestre" | "jogador" | "drogon"
  content: string
  timestamp: timestamp
  roll_data?: { dice: "d20", modifier: number, result: number }
```

### Firestore Security Rules
- Masters can create and edit campaigns
- Players can only write messages and roll dice within permitted campaigns
- Drogon (AI) never edits history—only writes new messages

## User Personas & Features

### 🧙 Master (Game Master)
- Chat with Drogon for narration and rule questions
- Define campaign tone, language, and detail level
- Create/edit sessions and story parameters
- Add/remove players (generate shareable join links)
- Save and export session logs (PDF)
- Query D&D rules via AI semantic search

### 🛡️ Player
- Interact with Master and Drogon in synchronized group chat
- Simplified D&D character sheet with automatic calculations
- Virtual dice rolling (commands like `/roll 1d20+5`)
- Quick action buttons (attack, dodge, speak) with AI-guided prompts
- View campaign journey history
- Multilingual interface support (future)

### 🤖 Mestre Drogon (AI)
- **Narrator:** Describe scenes, react to actions, create scenarios
- **Rules Master:** Interpret D&D 5e mechanics
- **Emotional Interpreter:** Adjust tone and vocabulary based on context
- **Chronicler:** Generate chapter summaries and session recaps

## Real-time Session Flow

```
Master initiates session
         ↓
Creates room "cmp_kobolds" in Firestore
         ↓
Generates invite link "/join/cmp_kobolds"
         ↓
Players join (Auth required)
         ↓
Synchronized chat (Firestore Stream / WebSocket)
         ↓
Drogon interacts based on tone and language context
         ↓
Saves incremental history and context
```

## Development Roadmap (12 Months)

### Phase 1: MVP Narrativo (0–2 months)
- ✅ AI chat functionality
- ✅ Dark theme & layout
- 🧠 Gemini API connection

### Phase 2: Cognitive Base (2–3 months)
- ✅ OCR extraction from D&D PDFs
- ✅ Corpus cleaning and structuring
- ✅ Firestore registration

### Phase 3: Drogon Personalization (3–4 months)
- ✅ Detail level controls
- ✅ Tone adjustment
- ✅ Language selection
- ⚙️ Live context updates

### Phase 4: Player & Sessions (4–6 months)
- 🛡️ Player panel
- 🧙 Master session control
- 🔁 WebSocket synchronization

### Phase 5: Narrative Campaigns (6–8 months)
- 🗃️ Session history
- 🕰️ Automatic continuation
- 💾 AI session state saving

### Phase 6: Embeddings & Queries (8–9 months)
- 🧠 Semantic search in D&D corpus
- 🎯 Official D&D rule references

### Phase 7: Sensory Experience (9–11 months)
- 🎧 Thematic audio
- 🎲 Sound effects for dice rolls
- ✨ Magical UI effects

### Phase 8: Complete Player MVP (11–12 months)
- 🎮 Real connected players
- 🎭 Synchronous AI narration

## Sprint Planning (14 Sprints × 2 weeks)

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| S1–S2 | Chat AI MVP | Send/receive, base UX, active Drogon |
| S3–S4 | Backend + OCR Rules | OCR + text base in Storage |
| S5–S6 | AI Context + Variables | Tone/detail/language panel, new typing |
| S7–S8 | Player Panel | Simple character sheet, cooperative chat |
| S9–S10 | Synchronized Sessions | WebSocket + multi-user logic |
| S11–S12 | AI Embeddings & Search | Vectorized D&D knowledge base |
| S13–S14 | Complete MVP Finalization | QA + accessibility + public deploy |

## Development Methodology

- **Approach:** Scrum + Kanban hybrid (bi-weekly sprints)
- **Tools:** Linear / Notion / GitHub Projects
- **Documentation:**
  - Technical docs in `docs/`
  - UX specs in Figma + design docs
  - AI Wiki: prompts, rules, Drogon examples

## Success Metrics

| Metric | Target |
|--------|--------|
| User engagement (multi-session return rate) | ≥ 70% |
| AI response time | < 2.8s |
| Narrative coherence (AI accuracy) | ≥ 85% |
| UI aesthetic satisfaction | ≥ 90% positive feedback |
| Active multiplayer users per session | ≥ 3 users sustained 1h+ |
| Campaign reopening retention (week 1) | ≥ 60% |

## Future Tech Stack Additions

| Technology | Purpose | Status |
|------------|---------|--------|
| OpenAI Whisper | Speech → Text transcription | Post-MVP evaluation |
| TTS (Text-to-Speech) | Narrate Drogon responses | Planned |
| Redis Cache | Optimize AI history | Future |
| AudioKit | Dynamic theme music | Post-MVP |
| Expo/React Native | Mobile companion app | Long-term |

## Commands (When Project Initialized)

Development commands will be added once the project structure is initialized:
- Build: TBD (likely `npm run build`)
- Dev server: TBD (likely `npm run dev`)
- Tests: TBD (likely `npm test`)
- Lint: TBD (likely `npm run lint`)
- Deploy: TBD (Firebase/Vercel deployment scripts)

## Important Development Notes

- **Language:** All UI text, AI interactions, and user-facing content in Brazilian Portuguese
- **Tone:** Maintain playful, irreverent brand voice throughout
- **Accessibility:** Focus on reducing complexity for D&D beginners
- **Copyright:** Respect D&D official content usage rights
- **AI Context:** Always provide campaign context to Gemini API for coherent narration
- **Real-time:** Prioritize low-latency synchronization for multiplayer experience
- **Dark Theme:** All UI components must support dark medieval aesthetic
