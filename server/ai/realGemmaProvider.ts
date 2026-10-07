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
  private isGoogleNative: boolean;

  constructor(config: GemmaConfig) {
    this.apiKey = config.apiKey.trim();
    // Default to the user's available Gemma 4 model or configured model
    this.model = (config.model || process.env.GEMMA_MODEL || 'gemma-4-31b-it').trim();
    // Vision model (Google multimodal or compatible vision endpoint)
    this.visionModel = (config.visionModel || process.env.GEMMA_VISION_MODEL || 'gemini-2.5-flash').trim();
    // Configurable base URL
    this.baseUrl = (config.baseUrl || process.env.GEMMA_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').trim().replace(/\/+$/, '');
    
    // Detect whether to use native Google AI Studio generateContent API
    this.isGoogleNative = this.baseUrl.includes('googleapis.com') || this.apiKey.startsWith('AIza') || this.apiKey.startsWith('AQ.');
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
   * Universal completion caller: automatically switches between native Google generateContent
   * and standard OpenAI-compatible API based on provider
   */
  private async callGenerate(systemPrompt: string, userPrompt: string, modelToUse: string): Promise<string> {
    if (this.isGoogleNative) {
      const modelName = modelToUse.startsWith('models/') ? modelToUse.replace('models/', '') : modelToUse;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n---\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 1500,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Google Gemma API error (${response.status}): ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      // Filter out thought tokens from Gemma 4 models
      const textParts = parts.filter((p: any) => !p.thought && typeof p.text === 'string').map((p: any) => p.text);
      const combinedText = textParts.length > 0 ? textParts.join('') : (parts[parts.length - 1]?.text || '');

      if (!combinedText) {
        throw new Error('Google Gemma API returned empty text in candidate parts.');
      }
      return combinedText;
    }

    // Fallback to OpenAI-compatible endpoint (Groq, OpenRouter, Ollama)
    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.65,
        max_tokens: 1500,
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
   * Universal completion with 1 automatic retry on malformed JSON
   */
  private async executeWithRetry<T>(systemPrompt: string, userPrompt: string, modelToUse: string): Promise<T> {
    try {
      const raw = await this.callGenerate(systemPrompt, userPrompt, modelToUse);
      return this.cleanAndParseJson<T>(raw);
    } catch (firstError) {
      console.warn(`[RealGemmaProvider] Retrying prompt after error: ${(firstError as Error).message}`);
      const retryUserPrompt = `${userPrompt}\n\nIMPORTANT: Reply ONLY with valid RFC 8259 JSON format. Do not include markdown codeblocks or extra commentary.`;
      const secondRaw = await this.callGenerate(systemPrompt, retryUserPrompt, modelToUse);
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

    if (this.isGoogleNative) {
      const modelName = this.visionModel.startsWith('models/') ? this.visionModel.replace('models/', '') : this.visionModel;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\n---\nWhat did I just see outdoors? Please analyze this image.` },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Google Vision API error (${response.status}): ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textParts = parts.filter((p: any) => !p.thought && typeof p.text === 'string').map((p: any) => p.text);
      const combinedText = textParts.length > 0 ? textParts.join('') : (parts[parts.length - 1]?.text || '');
      const parsed = this.cleanAndParseJson<any>(combinedText);
      return AiOutputValidator.validateImageAnalysis(parsed);
    }

    // OpenAI-compatible multimodal endpoint
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

    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.visionModel,
        messages,
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Gemma Vision provider API returned status ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = this.cleanAndParseJson<any>(content);
    return AiOutputValidator.validateImageAnalysis(parsed);
  }
}
