import { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle,
} from "lucide-react";

/**
 * FlashcardModal Component
 *
 * Provides an offline active-recall flashcard study interface.
 * Allows students to cycle through deck cards, tap to flip between
 * question (front) and answer (back), and track study progress.
 *
 * @param {Array} flashcards - Array of objects with { front, back } properties
 * @param {Function} onClose - Callback function to close the modal overlay
 */
export default function FlashcardModal({ flashcards = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());

  const totalCards = flashcards.length;
  const isLastCard = currentIndex === totalCards - 1;
  const isFirstCard = currentIndex === 0;

  const markCurrentAsStudied = useCallback(() => {
    setStudiedCards((prev) => new Set(prev).add(currentIndex));
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    markCurrentAsStudied();
  }, [markCurrentAsStudied]);

  const handleNext = useCallback(() => {
    if (!isLastCard) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [isLastCard]);

  const handlePrev = useCallback(() => {
    if (!isFirstCard) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [isFirstCard]);

  const handleResetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      }
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleFlip, onClose]);

  // Now it's safe to bail out — every hook above has already run
  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];
  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-slate-100">
                Offline Active Recall Drill
              </h3>
              <p className="text-[11px] text-slate-400">
                Zero data required • Native device memory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
            title="Close Flashcards (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-header Progress Tracker */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              Card <strong>{currentIndex + 1}</strong> of{" "}
              <strong>{totalCards}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Reviewed: {studiedCards.size}/{totalCards}
            </span>
            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body: The Flip Card */}
        <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <div
            onClick={handleFlip}
            className={`w-full h-56 rounded-2xl p-6 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl border transform ${
              isFlipped
                ? "bg-indigo-950 border-indigo-700 text-indigo-50 rotate-y-180"
                : "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white"
            }`}
          >
            {/* Top Indicator Badge */}
            <div className="w-full flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest">
              <span
                className={`px-2.5 py-1 rounded-md border ${
                  isFlipped
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                }`}
              >
                {isFlipped ? "Answer Key" : "Concept Question"}
              </span>

              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <RotateCw className="h-3 w-3" />
                Click to flip
              </span>
            </div>

            {/* Main Card Content Text */}
            <div className="my-auto max-w-sm px-2">
              <p
                className={`font-bold transition-all ${
                  isFlipped
                    ? "text-lg text-emerald-200"
                    : "text-base text-slate-100"
                }`}
              >
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            {/* Bottom Cue */}
            <span className="text-[10px] text-slate-400 italic">
              {isFlipped
                ? "Tap card again to see question"
                : "Tap card to reveal answer"}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            💡 Tip: Use{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">
              Space
            </kbd>{" "}
            to flip, and{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">
              ←
            </kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">
              →
            </kbd>{" "}
            keys to navigate.
          </p>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={isFirstCard}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleResetDeck}
            className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-200/50"
            title="Restart from first card"
          >
            <RotateCw className="h-3 w-3" />
            <span>Restart</span>
          </button>

          {isLastCard ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Done Practice</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
            >
              <span>Next Card</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
