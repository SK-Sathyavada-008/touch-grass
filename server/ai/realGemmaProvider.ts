import { IGemmaProvider, NearbyPlace } from './types.js';
import { TenMinuteAdventure, ExploreAdventure, ImageAnalysisResult, TenMinuteAdventureParams } from '../types.js';
import { AiOutputValidator } from './validator.js';

export interface GemmaConfig {
  apiKey: string;
  model?: string;
  visionModel?: string;
  baseUrl?: string;
}

export class RealGemmaProvider implements IGemmaProvider {
  readonly name = 'RealGemmaProvider';
  readonly isMock = false;

  private apiKey: string;
  private model: string;
  private visionModel: string;
  private baseUrl: string;

  constructor(config: GemmaConfig) {
    this.apiKey = config.apiKey.trim();
    // Default to the current stable Gemma open-weight instruct model
    this.model = (config.model || process.env.GEMMA_MODEL || 'gemma-2-9b-it').trim();
    // Vision model (PaliGemma or multimodal Gemma endpoint)
    this.visionModel = (config.visionModel || process.env.GEMMA_VISION_MODEL || 'paligemma-3b-mix-448').trim();
    // Configurable base URL
    this.baseUrl = (config.baseUrl || process.env.GEMMA_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/').trim().replace(/\/+$/, '');
  }

  /**
   * Helper to clean and parse JSON strings from LLMs
   */
  private cleanAndParseJson<T>(rawText: string): T {
    let cleaned = rawText.trim();

    // Strip markdown code fences ```json ... ``` or ``` ... ```
    if (cleaned.startsWith('```')) {
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleaned = match[1].trim();
      }
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // Safe normalization: remove trailing commas before closing braces/brackets
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(cleaned) as T;
      } catch (err) {
        throw new Error(`JSON parse error: ${(err as Error).message}. Snippet: ${rawText.slice(0, 100)}`);
      }
    }
  }

  /**
   * Universal completion caller via OpenAI-compatible API
   */
  private async callChatCompletion(messages: Array<{ role: string; content: any }>, modelToUse: string): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        temperature: 0.65,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Gemma provider API returned status ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Gemma API returned an empty response.');
    }
    return content;
  }

  /**
   * Universal completion with 1 retry on malformed JSON
   */
  private async executeWithRetry<T>(systemPrompt: string, userPrompt: string, modelToUse: string): Promise<T> {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const raw = await this.callChatCompletion(messages, modelToUse);
      return this.cleanAndParseJson<T>(raw);
    } catch (firstError) {
      console.warn(`[RealGemmaProvider] Retrying prompt after error: ${(firstError as Error).message}`);
      const retryMessages = [
        ...messages,
        {
          role: 'user',
          content: 'IMPORTANT: Reply ONLY with valid, RFC 8259 JSON format. Do not include markdown ticks, extra commentary, or trailing commas.',
        },
      ];
      const secondRaw = await this.callChatCompletion(retryMessages, modelToUse);
      return this.cleanAndParseJson<T>(secondRaw);
    }
  }

  async generateTenMinuteAdventure(params?: TenMinuteAdventureParams | string): Promise<TenMinuteAdventure> {
    const parsedParams: TenMinuteAdventureParams = typeof params === 'string'
      ? { vibe: params }
      : params || {};

    const duration = parsedParams.timeMinutes || 10;
    const groupType = parsedParams.groupType || 'solo';
    const locationContext = parsedParams.locationContext || 'local neighborhood or park';
    const weatherContext = parsedParams.weatherContext || 'current outdoor conditions';
    const vibe = parsedParams.vibe || 'spontaneous curiosity';

    const systemPrompt = `You are TouchGrass, an outdoor companion powered by Gemma open-weight AI.
Your mission: Get people to PUT THEIR PHONES AWAY and explore the natural world right outside their door.
SAFETY & REALISM MANDATES:
1. Suggestions must be 100% safe, realistic, and free.
2. NO trespassing, no entering private property or closed areas.
3. NO dangerous roads, no walking in vehicular traffic.
4. NO unsafe climbing or hazardous heights.
5. NO touching unknown plants, mushrooms, or wild animals.
6. NO interaction with strangers required.
7. NO driving or motorized navigation.
8. If the time is night or dusk, generate safe, well-lit, open-sky observations (e.g. night breeze, stars, quiet sounds).
9. Output exactly 3 to 5 clear, doable quests.
10. Include one final instruction telling them to put their phone away.

Return ONLY valid JSON matching this schema:
{
  "title": "Short catchy title (e.g. Yellow Hunt, Bark Detective)",
  "vibe": "1-2 words (e.g. Sun-Seeker, Tactile)",
  "description": "1-2 short sentences giving the mission",
  "quests": [
    "Quest item 1",
    "Quest item 2",
    "Quest item 3",
    "Quest item 4"
  ],
  "phoneAwayInstruction": "One encouraging closing sentence telling them to pocket their phone"
}`;

    const userPrompt = `Generate a ${duration}-minute outdoor mission:
- User is: ${groupType === 'friends' ? 'with friends' : 'alone'}
- Location context: ${locationContext}
- Weather / Time: ${weatherContext}
- Vibe requested: ${vibe}`;

    try {
      const raw = await this.executeWithRetry<any>(systemPrompt, userPrompt, this.model);
      return AiOutputValidator.validateTenMinuteAdventure(raw, duration);
    } catch (err) {
      console.warn(`[RealGemmaProvider] Failed to generate 10-minute adventure via Gemma: ${(err as Error).message}`);
      throw err;
    }
  }

  async generateExploreAdventure(
    timeMinutes: number,
    groupType: 'solo' | 'friends',
    nearbyPlaces: NearbyPlace[]
  ): Promise<ExploreAdventure> {
    const placesContext = nearbyPlaces.length > 0
      ? `Nearby verified geographic points from OpenStreetMap: ${nearbyPlaces.map(p => `${p.name} (${p.type}, ${p.distance})`).join('; ')}`
      : 'No verified GPS points provided; generate 3 general natural destination archetypes like a shaded community park, a solitary mature tree, or a quiet green pathway. Do NOT invent fake street addresses.';

    const systemPrompt = `You are TouchGrass, powered by Gemma. Create a calm outdoor exploration plan for ${timeMinutes} minutes (${groupType}).
SAFETY MANDATES:
- Safe, public outdoor paths only. No climbing, no private property, no touching wild creatures.
- Destinations must include:
  1. Name
  2. Reason why this spot is interesting
  3. One simple, relaxing activity to do there
  4. One playful, solvable clue (understandable, sensory, related to the spot, not overly cryptic)
- 3 to 5 outdoor bucket list quests.

Return ONLY valid JSON matching this schema:
{
  "title": "Adventure title",
  "theme": "Theme description",
  "destinations": [
    {
      "name": "Destination Name",
      "type": "park / garden / woods / water / viewpoint",
      "reasonWhyInteresting": "Why this place is curious or relaxing",
      "simpleActivity": "One simple mindful action to do there",
      "clue": "Solvable sensory clue to find it"
    }
  ],
  "quests": [
    "Quest 1",
    "Quest 2",
    "Quest 3",
    "Quest 4"
  ],
  "encouragement": "Warm closing advice"
}`;

    const userPrompt = `Create an adventure for:
- Available time: ${timeMinutes} minutes
- Companions: ${groupType}
- ${placesContext}`;

    try {
      const raw = await this.executeWithRetry<any>(systemPrompt, userPrompt, this.model);
      return AiOutputValidator.validateExploreAdventure(raw, timeMinutes, groupType);
    } catch (err) {
      console.warn(`[RealGemmaProvider] Failed to generate explore adventure via Gemma: ${(err as Error).message}`);
      throw err;
    }
  }

  async generateQuestClue(destinationName: string, destinationType: string): Promise<string> {
    const systemPrompt = `You are TouchGrass. Return a single playful, solvable clue for an outdoor destination in JSON:
{
  "clue": "Understandable, solvable, playful clue related to the destination without being overly cryptic."
}`;
    const userPrompt = `Destination: "${destinationName}" (type: ${destinationType})`;

    try {
      const raw = await this.executeWithRetry<any>(systemPrompt, userPrompt, this.model);
      return AiOutputValidator.validateQuestClue(raw);
    } catch {
      return AiOutputValidator.validateQuestClue(`Head toward where the trees gather and listen for birds.`);
    }
  }

  async analyzeDiscoveryImage(imageBase64: string, mimeType: string): Promise<ImageAnalysisResult> {
    const systemPrompt = `You are TouchGrass Nature Vision powered by Gemma.
Analyze the natural subject (plant, leaf, insect, flower, bird, cloud, tree, stone) in the image.
HONESTY & SAFETY MANDATE:
- Never fabricate certainty. If the photo is blurry, partial, or ambiguous, mark certainty as "uncertain" or "possible".
- Warn never to touch or consume wild plants, berries, or fungi.
- Express genuine natural curiosity.

Return ONLY valid JSON matching this schema:
{
  "identification": "Common name (and scientific name if known)",
  "certainty": "likely" | "possible" | "uncertain",
  "description": "Short 1-2 sentence description of what is seen",
  "interestingFact": "One fascinating, memorable fact about this organism",
  "nextQuest": "One new outdoor mini-quest related to this finding"
}`;

    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What did I just see outdoors? Please analyze this image.' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ];

    try {
      const raw = await this.callChatCompletion(messages, this.visionModel);
      const parsed = this.cleanAndParseJson<any>(raw);
      return AiOutputValidator.validateImageAnalysis(parsed);
    } catch (err) {
      console.warn(`[RealGemmaProvider] Gemma Vision analysis failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
