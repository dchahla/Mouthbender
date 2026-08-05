import { useState } from 'react';
import { Play, Square, MessageSquare, Ear } from 'lucide-react';

const VISEMES = {
  rest: { w: 27, uH: 2, lH: 2, cornerY: 0, topTeeth: 0, bottomTeeth: 0, tongue: 0 },
  b: { w: 15, uH: 0, lH: 0, cornerY: 2, topTeeth: 0, bottomTeeth: 0, tongue: 0 },
  p: { w: 10, uH: 0, lH: 0, cornerY: 2, topTeeth: 0, bottomTeeth: 0, tongue: 0 },
  m: { w: 40, uH: 0, lH: 0, cornerY: 2, topTeeth: 0, bottomTeeth: 0, tongue: 0 },
  h: { w: 19, uH: 14, lH: 14, cornerY: 0, topTeeth: 0.6, bottomTeeth: 0.8, tongue: 1 },
  a: { w: 25, uH: 22, lH: 22, cornerY: 0, topTeeth: 0.3, bottomTeeth: 1, tongue: 0 },
  e: { w: 28, uH: 12, lH: 8, cornerY: 5, topTeeth: 1, bottomTeeth: 1, tongue: 0 },
  o: { w: 15, uH: 14, lH: 14, cornerY: 0, topTeeth: 0.6, bottomTeeth: 0.8, tongue: 0 },
  u: { w: 10, uH: 8, lH: 6, cornerY: 2, topTeeth: 0, bottomTeeth: 0.8, tongue: 0 },
  f: { w: 28, uH: 10, lH: -4, cornerY: 2, topTeeth: 1, bottomTeeth: 0, tongue: 0 },
  th: { w: 30, uH: 8, lH: 8, cornerY: 0, topTeeth: 1, bottomTeeth: 1, tongue: 1 },
  k: { w: 27, uH: 6, lH: 8, cornerY: 1, topTeeth: 0.9, bottomTeeth: 1.0, tongue: 1 },
  r: { w: 20, uH: 8, lH: 8, cornerY: 0, topTeeth: 0.9, bottomTeeth: 0.5, tongue: 1 },
  s: { w: 30, uH: 8, lH: 8, cornerY: 0, topTeeth: 1, bottomTeeth: 1, tongue: 1 },
  l: { w: 34, uH: 6, lH: 8, cornerY: 1, topTeeth: 0.9, bottomTeeth: 1.0, tongue: 0.95 },
  g: { w: 16, uH: 6, lH: 4, cornerY: 1, topTeeth: 0.9, bottomTeeth: 1.0, tongue: 0.3 },
  grin: { w: 45, uH: 5, lH: 12, cornerY: -15, topTeeth: 1, bottomTeeth: 0, tongue: 0 }
};

const tokenToViseme = (token) => {
  if (token === 'th') return 'th';
  if (token === 'ch' || token === 'sh') return 's';
  if (/[m]/i.test(token)) return 'm';
  if (/[p]/i.test(token)) return 'p';
  if (/[b]/i.test(token)) return 'b';
  if (token === 'u') return 'u';
  if (/[h]/i.test(token)) return 'h';
  if (/[ow]/i.test(token)) return 'o';
  if (/[fv]/i.test(token)) return 'f';
  if (/[szcj]/i.test(token)) return 's';
  if (/[l]/i.test(token)) return 'l';
  if (/[tdn]/i.test(token)) return 'th';
  if (/[gn]/i.test(token)) return 'g';
  if (/[r]/i.test(token)) return 'g';
  if (/[kqdrx]/i.test(token)) return 'k';
  if (/[eiy]/i.test(token)) return 'e';
  if (/[a]/i.test(token)) return 'a';
  
  return 'rest';
};

// Whole-word swaps for words whose spelling doesn't hint at how they sound.
const PRONUNCIATION_WORD_RULES = [
  [/\bis\b/gi, 'eeess'],
  [/\bthe\b/gi, 'theeeth'],
  [/\bi\b/gi, 'a'],
];

// Silent trailing e: dropped when the letter before it isn't a vowel (like ->
// lik), kept when it is (tie, ye, toe stay as-is since a vowel already sits
// before the e). Runs before the sound rules below so it only ever sees e's
// that were actually typed, not ones "ing" -> "e" manufactures later.
const SILENT_E_RULE = [/([bcdfghjklmnpqrstvwxz])e\b/gi, '$1'];

// Sound-level swaps, applied after the word rules above. Order matters:
// "uck" must land before "ing" so "trucking" -> "trooocking" -> "trooocke".
const PRONUNCIATION_SOUND_RULES = [
  [/uck/gi, 'oock'],
  [/u/gi, 'oo'],
  [/ph/gi, 'f'],
  [/z/gi, 'ss'],
  [/ing/gi, 'e'],
];

const getPronouncedText = (text) => {
  let result = text;
  for (const [pattern, replacement] of PRONUNCIATION_WORD_RULES) {
    result = result.replace(pattern, replacement);
  }
  result = result.replace(SILENT_E_RULE[0], SILENT_E_RULE[1]);
  for (const [pattern, replacement] of PRONUNCIATION_SOUND_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

const App = () => {
  const [currentViseme, setCurrentViseme] = useState('rest');
  const [inputText, setInputText] = useState('hello world');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(false);

  const pronouncedText = getPronouncedText(inputText);

  const activeConfig = VISEMES[currentViseme];
  const transitionClass = 'transition-all duration-150 ease-out';

  const getMetrics = (w, uH, lH) => ({
    kx: w * 0.55228,
    ku: Math.abs(uH) * 0.55228,
    kl: Math.abs(lH) * 0.55228
  });

  const getFullMouthPath = (w, uH, lH, cornerY) => {
    const { kx, ku, kl } = getMetrics(w, uH, lH);
    return `M ${50 - w},${50 + cornerY}
            C ${50 - w},${50 + cornerY - ku} ${50 - kx},${50 - uH} 50,${50 - uH}
            C ${50 + kx},${50 - uH} ${50 + w},${50 + cornerY - ku} ${50 + w},${50 + cornerY}
            C ${50 + w},${50 + cornerY + kl} ${50 + kx},${50 + lH} 50,${50 + lH}
            C ${50 - kx},${50 + lH} ${50 - w},${50 + cornerY + kl} ${50 - w},${50 + cornerY} Z`;
  };

  const getUpperLipPath = (w, uH, lH, cornerY) => {
    const { kx, ku } = getMetrics(w, uH, lH);
    return `M ${50 - w},${50 + cornerY}
            C ${50 - w},${50 + cornerY - ku} ${50 - kx},${50 - uH} 50,${50 - uH}
            C ${50 + kx},${50 - uH} ${50 + w},${50 + cornerY - ku} ${50 + w},${50 + cornerY}`;
  };

  const getLowerLipPath = (w, uH, lH, cornerY) => {
    const { kx, kl } = getMetrics(w, uH, lH);
    return `M ${50 - w},${50 + cornerY}
            C ${50 - w},${50 + cornerY + kl} ${50 - kx},${50 + lH} 50,${50 + lH}
            C ${50 + kx},${50 + lH} ${50 + w},${50 + cornerY + kl} ${50 + w},${50 + cornerY}`;
  };

  // Default relaxed swollen oval (matches the old ellipse cx50 cy58 rx15 ry10),
  // shifted down by `dy`. The offset is baked into the path (not a CSS transform)
  // so the ancestor clipPath actually contains it — a CSS transform on the child
  // escapes the clip in Chromium. Same M+4C structure as the mouth, so it still
  // morphs smoothly via `d` interpolation.
  // The `k` viseme swaps this out for the animated `tongue-k` morph in index.css.
  const getTonguePath = (dy = 0) =>
    `M 35,${58 + dy} C 35,${52.48 + dy} 41.72,${48 + dy} 50,${48 + dy}
     C 58.28,${48 + dy} 65,${52.48 + dy} 65,${58 + dy}
     C 65,${63.52 + dy} 58.28,${68 + dy} 50,${68 + dy}
     C 41.72,${68 + dy} 35,${63.52 + dy} 35,${58 + dy} Z`;

  // Swollen "watermelon slice" lower lip: the fill sits between the normal lip
  // line (dips by lH) and a deeper line (dips by lH + swell). The gap is `swell`
  // at the middle and zero at the corners, so it's fat in the center and points
  // at the mouth corners.
  const getLowerLipShape = (w, uH, lH, cornerY, swell) => {
    const { kx, kl } = getMetrics(w, uH, lH);
    const lH2 = lH + swell;
    const kl2 = Math.abs(lH2) * 0.55228;
    return `M ${50 - w},${50 + cornerY}
            C ${50 - w},${50 + cornerY + kl} ${50 - kx},${50 + lH} 50,${50 + lH}
            C ${50 + kx},${50 + lH} ${50 + w},${50 + cornerY + kl} ${50 + w},${50 + cornerY}
            C ${50 + w},${50 + cornerY + kl2} ${50 + kx},${50 + lH2} 50,${50 + lH2}
            C ${50 - kx},${50 + lH2} ${50 - w},${50 + cornerY + kl2} ${50 - w},${50 + cornerY} Z`;
  };

  const getTopTeethClipPath = (w, uH, lH, cornerY) => {
    const { kx, ku } = getMetrics(w, uH, lH);
    return `M ${50 - w},${50 + cornerY}
            C ${50 - w},${50 + cornerY - ku} ${50 - kx},${50 - uH} 50,${50 - uH}
            C ${50 + kx},${50 - uH} ${50 + w},${50 + cornerY - ku} ${50 + w},${50 + cornerY}
            L 100,100 L 0,100 Z`;
  };

  const playSequence = async () => {
    if (isPlaying || !inputText) return;
    setIsPlaying(true);

    const tokens = pronouncedText.toLowerCase().match(/th|ch|sh|[a-z]| /g) || [];

    for (let token of tokens) {
      if (token === ' ') {
        setCurrentViseme('rest');
        await new Promise(r => setTimeout(r, 100));
        continue;
      }
      const viseme = tokenToViseme(token);
      setCurrentViseme(viseme);

      const duration = viseme === 'th' ? 220 : viseme === 's' ? 100 : 180;
      await new Promise(r => setTimeout(r, duration));
    }

    await new Promise(r => setTimeout(r, 400));
    setCurrentViseme('rest');
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            MOUTHBENDER
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Z-Depth Articulation</p>
        </header>

        <div className="relative aspect-video w-full flex items-center justify-center bg-black/40 rounded-3xl border border-white/5 mb-6 shadow-inner overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-xl">
            <defs>
              <clipPath id="fullMouthClip">
                <path
                  d={getFullMouthPath(activeConfig.w, activeConfig.uH, activeConfig.lH, activeConfig.cornerY)}
                  className={transitionClass}
                />
              </clipPath>
              <clipPath id="topTeethClip">
                <path
                  d={getTopTeethClipPath(activeConfig.w, activeConfig.uH, activeConfig.lH, activeConfig.cornerY)}
                  className={transitionClass}
                />
              </clipPath>
            </defs>

            <path
              d={getFullMouthPath(activeConfig.w, activeConfig.uH, activeConfig.lH, activeConfig.cornerY)}
              fill="#1a0505"
              className={transitionClass}
            />

            <g clipPath="url(#fullMouthClip)">
              <path
                d={getTonguePath((1 - activeConfig.tongue) * 25)}
                fill="#ff6b6b"
                className={`${transitionClass} ${currentViseme === 'k' ? 'tongue-k' : ''}`}
              />

              <rect
                x="32" y="55" width="36" height="20" rx="4"
                fill="#e6e6e6"
                className={transitionClass}
                style={{ transform: `translateY(${(1 - activeConfig.bottomTeeth) * 25}px)` }}
              />
            </g>

            {activeConfig.lipSwell ? (
              <path
                d={getLowerLipShape(activeConfig.w, activeConfig.uH, activeConfig.lH, activeConfig.cornerY, activeConfig.lipSwell)}
                fill="#ff4d4d"
                className={transitionClass}
              />
            ) : (
              <path
                d={getLowerLipPath(activeConfig.w, activeConfig.uH, activeConfig.lH, activeConfig.cornerY)}
                fill="none" stroke="#ff4d4d" strokeWidth="4" strokeLinecap="round"
                className={transitionClass}
              />
            )}

            <g clipPath="url(#topTeethClip)">
              <rect
                x="30" y="30" width="40" height="22" rx="4"
                fill="#ffffff"
                className={transitionClass}
                style={{ transform: `translateY(${(activeConfig.topTeeth - 1) * 25}px)` }}
              />
            </g>

            <path
              d={getUpperLipPath(activeConfig.w, activeConfig.uH, activeConfig.lH, activeConfig.cornerY)}
              fill="none" stroke="#ff4d4d" strokeWidth="4" strokeLinecap="round"
              className={transitionClass}
            />
          </svg>
        </div>

        <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare size={16} className="text-slate-500" />
            <input
              type="text"
              value={showPronunciation ? pronouncedText : inputText}
              onChange={(e) => setInputText(e.target.value)}
              readOnly={showPronunciation}
              placeholder="Type to speak (e.g. papa, fa)"
              className="w-full bg-transparent border-none text-sm font-mono text-cyan-100 placeholder:text-slate-700 focus:outline-none"
              disabled={isPlaying}
            />
            <button
              onClick={() => setShowPronunciation((v) => !v)}
              disabled={isPlaying}
              title={showPronunciation ? 'Show typed text' : 'Show pronunciation'}
              className={`p-2 rounded-xl transition-all ${showPronunciation ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/30 text-slate-500 hover:bg-slate-800'}`}
            >
              <Ear size={16} />
            </button>
            <button
              onClick={playSequence}
              disabled={isPlaying || !inputText}
              className={`p-2 rounded-xl transition-all ${isPlaying ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
            >
              {isPlaying ? <Square size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.keys(VISEMES).map((vKey) => (
            <button
              key={vKey}
              onClick={() => setCurrentViseme(vKey)}
              disabled={isPlaying}
              className={`p-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${currentViseme === vKey
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/30 border-transparent text-slate-500 hover:bg-slate-800'
                }`}
            >
              {vKey}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
