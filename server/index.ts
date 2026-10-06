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

// Disciplined CORS configuration
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors({
  origin: allowedOrigin ? allowedOrigin.split(',').map(o => o.trim()) : true,
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Reasonable payload size limit to prevent memory abuse
app.use(express.json({ limit: '10mb' }));

// Basic security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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

    const sanitizedTime = Math.min(Math.max(Number(timeMinutes) || 10, 5), 120);
    const sanitizedGroup = groupType === 'friends' ? 'friends' : 'solo';
    const sanitizedVibe = typeof vibe === 'string' ? vibe.slice(0, 80) : undefined;
    const sanitizedLocation = typeof locationContext === 'string' ? locationContext.slice(0, 100) : undefined;
    const sanitizedWeather = typeof weatherContext === 'string' ? weatherContext.slice(0, 100) : undefined;

    let result;
    try {
      result = await gemmaProvider.generateTenMinuteAdventure({
        timeMinutes: sanitizedTime,
        groupType: sanitizedGroup,
        locationContext: sanitizedLocation,
        weatherContext: sanitizedWeather,
        vibe: sanitizedVibe,
      });
    } catch (aiErr) {
      console.warn('[Server] Primary Gemma provider failed for 10-minute adventure, falling back to mock:', (aiErr as Error).message);
      result = await fallbackMockProvider.generateTenMinuteAdventure({
        timeMinutes: sanitizedTime,
        groupType: sanitizedGroup,
        locationContext: sanitizedLocation,
        weatherContext: sanitizedWeather,
        vibe: sanitizedVibe,
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

    const sanitizedTime = Math.min(Math.max(Number(timeMinutes) || 30, 15), 240);
    const sanitizedGroup = groupType === 'friends' ? 'friends' : 'solo';

    let nearbyPlaces = [];
    const validLat = typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
    const validLon = typeof lon === 'number' && !isNaN(lon) && lon >= -180 && lon <= 180;

    if (validLat && validLon) {
      nearbyPlaces = await OsmService.findNearbyOutdoorSpots(lat, lon);
    } else {
      nearbyPlaces = OsmService.getDefaultOutdoorSpots();
    }

    let result;
    try {
      result = await gemmaProvider.generateExploreAdventure(
        sanitizedTime,
        sanitizedGroup,
        nearbyPlaces
      );
    } catch (aiErr) {
      console.warn('[Server] Primary Gemma provider failed for explore adventure, falling back to mock:', (aiErr as Error).message);
      result = await fallbackMockProvider.generateExploreAdventure(
        sanitizedTime,
        sanitizedGroup,
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
    if (!destinationName || typeof destinationName !== 'string') {
      return res.status(400).json({ error: 'destinationName is required' });
    }

    const cleanName = destinationName.slice(0, 100);
    const cleanType = typeof destinationType === 'string' ? destinationType.slice(0, 50) : 'nature';

    let clue: string;
    try {
      clue = await gemmaProvider.generateQuestClue(cleanName, cleanType);
    } catch (aiErr) {
      clue = await fallbackMockProvider.generateQuestClue(cleanName, cleanType);
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

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 string is required' });
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    const cleanMime = validMimes.includes(mimeType) ? mimeType : 'image/jpeg';

    // Validate payload size (max ~8MB decoded payload)
    if (imageBase64.length > 12 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image exceeds maximum allowed size (8MB).' });
    }

    let result;
    try {
      result = await gemmaProvider.analyzeDiscoveryImage(imageBase64, cleanMime);
    } catch (aiErr) {
      console.warn('[Server] Vision provider failed or model unsupported, using fallback identification:', (aiErr as Error).message);
      result = await fallbackMockProvider.analyzeDiscoveryImage(imageBase64, cleanMime);
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

// Serve frontend in production (dist directory)
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
