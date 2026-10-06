import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createGemmaProvider } from './ai/providerFactory.js';
import { OsmService } from './services/osmService.js';
import { MockGemmaProvider } from './ai/mockGemmaProvider.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
// Allow base64 image uploads for nature analysis
app.use(express.json({ limit: '20mb' }));

const gemmaProvider = createGemmaProvider();
const fallbackMockProvider = new MockGemmaProvider();

// Health & System Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    provider: gemmaProvider.name,
    isMock: gemmaProvider.isMock,
    model: process.env.GEMMA_MODEL || 'gemma-2-9b-it',
    visionModel: process.env.GEMMA_VISION_MODEL || 'paligemma-3b-mix-448',
    timestamp: new Date().toISOString(),
  });
});

// Mode 1: 10-Minute Adventure
app.post('/api/adventure/ten-minute', async (req: Request, res: Response) => {
  try {
    const { timeMinutes = 10, groupType = 'solo', locationContext, weatherContext, vibe } = req.body;
    let result;
    try {
      result = await gemmaProvider.generateTenMinuteAdventure({
        timeMinutes: Number(timeMinutes),
        groupType,
        locationContext,
        weatherContext,
        vibe,
      });
    } catch (aiErr) {
      console.warn('[Server] Primary Gemma provider failed for 10-minute adventure, falling back to mock:', (aiErr as Error).message);
      result = await fallbackMockProvider.generateTenMinuteAdventure({
        timeMinutes: Number(timeMinutes),
        groupType,
        locationContext,
        weatherContext,
        vibe,
      });
    }
    res.json(result);
  } catch (error) {
    console.error('Error generating 10-minute adventure:', error);
    res.status(503).json({
      error: '🌱 The adventure generator got distracted. Try again.',
      details: (error as Error).message,
    });
  }
});

// Mode 2: Explore Adventure
app.post('/api/adventure/explore', async (req: Request, res: Response) => {
  try {
    const { timeMinutes = 30, groupType = 'solo', lat, lon } = req.body;

    let nearbyPlaces = [];
    if (typeof lat === 'number' && typeof lon === 'number') {
      nearbyPlaces = await OsmService.findNearbyOutdoorSpots(lat, lon);
    } else {
      nearbyPlaces = OsmService.getDefaultOutdoorSpots();
    }

    let result;
    try {
      result = await gemmaProvider.generateExploreAdventure(
        Number(timeMinutes),
        groupType === 'friends' ? 'friends' : 'solo',
        nearbyPlaces
      );
    } catch (aiErr) {
      console.warn('[Server] Primary Gemma provider failed for explore adventure, falling back to mock:', (aiErr as Error).message);
      result = await fallbackMockProvider.generateExploreAdventure(
        Number(timeMinutes),
        groupType === 'friends' ? 'friends' : 'solo',
        nearbyPlaces
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating explore adventure:', error);
    res.status(503).json({
      error: '🌱 The adventure generator got distracted. Try again.',
      details: (error as Error).message,
    });
  }
});

// Mode 2: Quest Clue Generation
app.post('/api/adventure/clue', async (req: Request, res: Response) => {
  try {
    const { destinationName, destinationType } = req.body;
    if (!destinationName) {
      return res.status(400).json({ error: 'destinationName is required' });
    }

    let clue: string;
    try {
      clue = await gemmaProvider.generateQuestClue(destinationName, destinationType || 'nature');
    } catch (aiErr) {
      clue = await fallbackMockProvider.generateQuestClue(destinationName, destinationType || 'nature');
    }

    res.json({ clue });
  } catch (error) {
    res.status(503).json({
      error: '🌱 The clue generator got distracted. Try again.',
      details: (error as Error).message,
    });
  }
});

// Mode 3: What Did I Just See? (Nature Discovery Vision)
app.post('/api/discovery/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    let result;
    try {
      result = await gemmaProvider.analyzeDiscoveryImage(imageBase64, mimeType);
    } catch (aiErr) {
      console.warn('[Server] Vision provider failed or model unsupported, using fallback identification:', (aiErr as Error).message);
      result = await fallbackMockProvider.analyzeDiscoveryImage(imageBase64, mimeType);
    }

    res.json(result);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({
      error: '🔎 I couldn’t figure that one out. Nature wins this round.',
      details: (error as Error).message,
    });
  }
});

// Serve frontend in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('TouchGrass frontend not built yet. Run `npm run build` or use Vite dev server.');
    }
  });
});

app.listen(port, () => {
  console.log(`🌿 TouchGrass Server running at http://localhost:${port}`);
  console.log(`📡 Provider: ${gemmaProvider.name} (mock: ${gemmaProvider.isMock})`);
});
