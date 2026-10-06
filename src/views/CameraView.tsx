import React, { useState, useRef } from 'react';
import type { DiscoveryItem } from '../types';
import { ClayCard } from '../components/clay/ClayCard';
import { ClayButton } from '../components/clay/ClayButton';
import { ClayCharacter } from '../components/clay/ClayCharacter';
import { ClayButterfly } from '../components/clay/ClayIcons';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { motion } from 'framer-motion';

interface CameraViewProps {
  onBack: () => void;
  onSavedDiscovery?: (discovery: DiscoveryItem) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onBack, onSavedDiscovery }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiscoveryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);

      const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) {
        setError('Invalid image format.');
        return;
      }

      const mimeType = match[1];
      const base64Data = match[2];

      setAnalyzing(true);
      try {
        const analysis = await ApiService.analyzeDiscovery(base64Data, mimeType);
        const discoveryItem: DiscoveryItem = {
          id: `disc-${Date.now()}`,
          identification: analysis.identification,
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          funFact: analysis.funFact,
          nextQuest: analysis.nextQuest,
          imageUrl: dataUrl,
          timestamp: new Date().toISOString(),
        };
        setResult(discoveryItem);
      } catch {
        setError('🔎 I couldn’t figure that one out. Nature wins this round.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveToBackpack = () => {
    if (!result) return;
    StorageService.addDiscovery(result);
    setSavedSuccess(true);
    if (onSavedDiscovery) onSavedDiscovery(result);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setSavedSuccess(false);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in px-1">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#557860] hover:text-[#163321] flex items-center gap-1 py-1"
        >
          ← Back
        </button>
        <span className="clay-badge text-[11px] font-extrabold px-3 py-0.5 text-[#A87B22]">
          🌿 Nature Vision
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-black text-[#163321] tracking-tight">
          WHAT DID I JUST SEE?
        </h2>
        <p className="text-xs text-[#53705C] max-w-xs mx-auto mt-1 font-medium">
          Show me what you found outdoors.
        </p>
      </div>

      {/* Main interaction state */}
      {!selectedImage ? (
        <div className="space-y-4">
          <ClayCard variant="white" className="p-7 text-center space-y-4 border border-[#DFEBE1]">
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="w-24 h-24 rounded-3xl bg-[#FFF6DE] border-2 border-dashed border-[#F3DB9F] mx-auto flex flex-col items-center justify-center cursor-pointer hover:bg-[#FEF1D0] transition-colors group select-none"
              role="button"
              tabIndex={0}
              aria-label="Take or choose a photo"
            >
              <ClayButterfly size={40} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-extrabold text-[#966E1D] mt-1">Tap camera</span>
            </div>

            <div>
              <h3 className="text-base font-black text-[#163321]">
                Show me.
              </h3>
              <p className="text-xs text-[#627E6A] font-medium max-w-xs mx-auto mt-1">
                Point your lens at any leaf, bug, moss, or mushroom.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <ClayButton
                variant="forest"
                size="lg"
                fullWidth
                onClick={() => cameraInputRef.current?.click()}
                className="py-3.5 text-sm"
              >
                📷 TAKE A PHOTO
              </ClayButton>

              <ClayButton
                variant="cream"
                size="md"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
                className="py-3 text-xs"
              >
                🖼️ CHOOSE A PHOTO
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      ) : analyzing ? (
        /* Analyzing State */
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <ClayCharacter mood="curious" size="lg" />
          <h3 className="text-xl font-extrabold text-[#163321]">
            Examining your outdoor finding...
          </h3>
          <p className="text-xs text-[#52745C] max-w-xs font-medium">
            Gemma is observing shapes and textures with care.
          </p>
          <div className="w-16 h-1.5 bg-[#D7E5D9] rounded-full overflow-hidden mt-1">
            <div className="w-full h-full bg-[#3D6B49] rounded-full animate-pulse" />
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <ClayCard variant="white" className="p-6 text-center space-y-4 border border-[#F3D7D2]">
          <div className="w-12 h-12 rounded-full bg-[#FEEBE8] mx-auto flex items-center justify-center text-xl">
            🔎
          </div>
          <h3 className="text-base font-black text-[#163321]">
            Nature Wins This Round
          </h3>
          <p className="text-xs text-[#587360] font-medium leading-relaxed">
            {error}
          </p>
          <div className="pt-2">
            <ClayButton variant="forest" size="md" fullWidth onClick={handleReset}>
              Try Another Photo
            </ClayButton>
          </div>
        </ClayCard>
      ) : result ? (
        /* Result State */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Photo Preview Thumbnail */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm max-h-52 w-full bg-[#EAF2EC] flex items-center justify-center">
            <img
              src={result.imageUrl}
              alt="Outdoor Discovery"
              className="w-full h-full object-cover max-h-52"
            />
            <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
              Captured Outdoors
            </div>
          </div>

          {/* AI Result Card */}
          <ClayCard variant="white" className="p-5 border border-[#DCEADE] space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#477051] block mb-0.5">
                AI Discovery
              </span>
              <h3 className="text-xl font-black text-[#163321] tracking-tight">
                {result.identification}
              </h3>
              <p className="text-xs text-[#597862] font-semibold mt-1 italic">
                “{result.confidence}”
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#274731] font-medium leading-relaxed">
              {result.explanation}
            </p>

            {/* Fun Fact Callout */}
            <div className="p-3 rounded-2xl bg-[#FFF9E8] border border-[#F6E3B4]">
              <span className="text-[10px] font-extrabold uppercase text-[#966E1D] block mb-0.5">
                💡 Fun Fact
              </span>
              <p className="text-xs font-semibold text-[#5B471F] leading-relaxed">
                {result.funFact}
              </p>
            </div>

            {/* Next Mini-Quest */}
            <div className="p-3 rounded-2xl bg-[#EFF7F1] border border-[#CFE7D4]">
              <span className="text-[10px] font-extrabold uppercase text-[#2F5938] block mb-0.5">
                🌱 Your Next Mini-Quest
              </span>
              <p className="text-xs font-semibold text-[#1F4528] leading-relaxed">
                {result.nextQuest}
              </p>
            </div>

            <p className="text-[10px] text-[#7A9682] text-center italic">
              “Not completely sure? That's okay — nature is full of surprises.”
            </p>

            <div className="pt-1 space-y-2">
              <ClayButton
                variant={savedSuccess ? 'sage' : 'forest'}
                size="md"
                fullWidth
                onClick={handleSaveToBackpack}
                disabled={savedSuccess}
              >
                {savedSuccess ? '✓ Saved to Backpack' : '🎒 Save to My Discoveries'}
              </ClayButton>

              <button
                onClick={handleReset}
                className="w-full text-xs font-bold text-[#557860] hover:text-[#163321] py-1.5"
              >
                Snap another wonder
              </button>
            </div>
          </ClayCard>
        </motion.div>
      ) : null}
    </div>
  );
};
