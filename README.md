# 🌿 TouchGrass

> **Tiny AI-powered outdoor adventure companion.**
>
> *Ask AI → get a real-world quest → put your phone away → go outside.*

TouchGrass is a playful, minimal, mobile-first Progressive Web App (PWA) built for the **Hacktoberfest Open-Source AI Challenge: "Touch Grass"**. It is designed with one contrarian purpose: to encourage people to spend **less** time staring at glass screens and more time noticing the living, tactile natural world right outside their door.

---

## 🌟 What is TouchGrass?

Most modern AI apps are endless chatbots designed to maximize screen time and engagement metrics. **TouchGrass is the opposite.**

- **Quick Micro-Missions:** Tap **"I HAVE 10 MINUTES"** to get a 10-minute mindful outdoor mission.
- **Phone-Away First:** The moment your adventure is ready, the app explicitly reminds you to pocket your phone and rely on your eyes, ears, and hands.
- **Curated Exploration:** Combines public OpenStreetMap nature data with Gemma AI to generate playful, sensory clues for nearby parks, gardens, and quiet trees.
- **Nature Vision ("What Did I Just See?"):** Snap a photo of a curious leaf, bug, moss, or cloud and let open-weight vision models explain its role in nature without claiming fake certainty.
- **Gentle Outdoor Backpack:** A calm local record of your outdoor observations. No streaks, no leaderboards, no toxic gamification.

---

## 🤖 Why Gemma is Central

Open-weight AI models like Google's **Gemma** are foundational to TouchGrass:

1. **Locally Deployable & Accessible:** Gemma models (`gemma-2-9b-it`, `gemma-2-27b-it`) are openly available weights that can run on user hardware, sovereign private clouds, or low-cost endpoints without vendor lock-in.
2. **Predictable Structured Generation:** TouchGrass leverages Gemma's instruction-following capabilities to produce validated, RFC-8259 JSON schemas rather than unpredictable conversational chit-chat.
3. **Safety & Grounding:** Gemma's reasoning enables nuanced outdoor constraints (ensuring quests are 100% free, safe, require no trespassing, and adapt safely if the user is outside at dusk or night).
4. **Multimodal Grounding (PaliGemma / Gemma Vision):** Open-weight multimodal models examine nature photos to provide natural-language certainty estimates, fun ecological facts, and subsequent mini-quests.

### How Open Weights Matter
TouchGrass believes outdoor companionship should not require sending personal location and private photos to proprietary closed-source APIs. With open weights, communities can run TouchGrass completely offline or over private Ollama/vLLM servers while hiking in remote national parks or developing countries.

---

## 🛠️ Architecture & How It Works

```
┌────────────────────────────────────────────────────────┐
│               Mobile-First PWA (Vite + React)          │
│        (Tactile Clay UI, Offline App Shell, Storage)   │
└───────────────────────────┬────────────────────────────┘
                            │ /api requests
┌───────────────────────────▼────────────────────────────┐
│               Express Backend Service                  │
│   ┌───────────────────────┴────────────────────────┐   │
│   │ AiOutputValidator (Schema validation & retry)  │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │                            │
│           ┌───────────────┴───────────────┐            │
│           ▼                               ▼            │
│  [RealGemmaProvider]             [MockGemmaProvider]   │
│  - Configurable GEMMA_MODEL      - Offline Dev Mode    │
│  - OpenAI / Google compatible    - Deterministic tests │
│  - OpenStreetMap Overpass        - Realistic templates │
└────────────────────────────────────────────────────────┘
```

### 1. 10-Minute Adventure Generation (`generateTenMinuteAdventure`)
Receives available time (e.g. 10 mins), group context (solo or with friends), and outdoor vibe. Gemma produces:
- A catchy title (e.g., *"Yellow Hunt"*, *"Texture Safari"*)
- A brief sensory description
- 3 to 5 realistic, safe quests (e.g., *"Find something living smaller than your thumb"*)
- A closing phone-away reminder.

### 2. Explore Adventures (`generateExploreAdventure`)
Queries the **OpenStreetMap Overpass API** for verified public parks, gardens, and nature reserves within walking distance. Gemma turns these geographic spots into playful, sensory clues without spoiling exact GPS coordinates immediately.

### 3. Nature Discovery (`analyzeDiscoveryImage`)
Accepts photos taken directly via the mobile camera. Gemma Vision evaluates the subject and returns:
```json
{
  "identification": "Common Mormon Butterfly (Papilio polytes)",
  "certainty": "likely",
  "description": "A classic swallowtail frequently seen fluttering around garden foliage.",
  "interestingFact": "Females often mimic unpalatable rose butterflies to deter predators.",
  "nextQuest": "Find another pollinator nearby with a different wing pattern."
}
```
If an image is ambiguous or blurry, the model honestly marks `certainty` as `possible` or `uncertain`.

---

## 🔒 Safety & Content Ethics

Every prompt sent to Gemma enforces strict outdoor safety mandates:
- **Zero Trespassing:** Only public, accessible outdoor paths.
- **No Hazardous Situations:** No climbing dangerous heights, entering roads, or walking in traffic.
- **Wildlife Protection:** Never touch unknown insects, wild animals, or wild mushrooms/berries.
- **Night Safety:** If used after dark, quests adapt to safe, well-lit stargazing or nocturnal audio observations.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```bash
# Server Port
PORT=3001

# Primary Gemma Model
GEMMA_MODEL=gemma-2-9b-it

# Vision-Capable Model for Nature Identification
GEMMA_VISION_MODEL=paligemma-3b-mix-448

# API Key for Gemma Provider
# (Supports Google AI Studio, Groq, OpenRouter, or local endpoints)
GEMMA_API_KEY=

# Base URL for the Gemma API (defaults to Google AI / standard OpenAI-compatible format)
# Examples:
# Google AI Studio: https://generativelanguage.googleapis.com/v1beta/openai/
# Groq: https://api.groq.com/openai/v1
# OpenRouter: https://openrouter.ai/api/v1
# Local Ollama: http://localhost:11434/v1
GEMMA_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

> **Note on Development Fallback:**
> If `GEMMA_API_KEY` is not provided, TouchGrass automatically switches to `MockGemmaProvider`. This allows developers and contributors to test all application flows, animations, and PWA features without an active API key.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/touchGrass.git
cd touchGrass

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Start in Development Mode
Starts both the frontend Vite dev server (`http://localhost:5173`) and the Express AI backend (`http://localhost:3001`):
```bash
npm run dev
```

### Production Build & Run
```bash
# Build production client and PWA service worker
npm run build

# Start production server
npm start
```
The application will be served at `http://localhost:3001` with full offline service worker caching and PWA installability.

---

## 🎨 Visual Identity: Clay UI

TouchGrass uses a soft, tactile design aesthetic:
- **Warm cream & sage green palette** (`#FAF7F0`, `#1A3826`, `#7DA282`, `#F4D06F`)
- **Pillowy clay cards & buttons** with layered shadows and subtle physical feedback
- **Pebble:** A cute animated clay mascot with a gentle leaf antenna that sways with the breeze
- **Respects `prefers-reduced-motion`** for complete accessibility.

---

## 📄 License
MIT License. Built with ❤️ for Hacktoberfest 2026.
