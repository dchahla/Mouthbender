# Mouthbender

A small React + SVG toy that morphs a face through mouth shapes (visemes) as you type. Named after the hellbender — the salamander that breathes through the folds of its own skin — this is about bending geometry, not swapping sprites.

Each character is mapped to a viseme (a mouth pose — lip width, teeth, tongue position), and playback animates smoothly between them so the mouth looks like it's talking. No frame-swapped sprites, no raster assets — every shape is a vector path, and transitions are just path interpolation.


![helloworld mouthbender](https://chahla.net/assets/helloworld_mouthbender.gif)




## Features

- **Text-to-viseme playback** — type a phrase and hit play; each letter (and digraphs like `th`, `ch`, `sh`) resolves to a mouth shape and holds for a duration tuned per sound.
- **Manual viseme picker** — a grid of buttons to jump straight to any mouth shape, useful for tuning the shapes themselves.
- **Pronunciation preview** — a toggle (the ear icon) switches the input between what you typed and a rough phonetic respelling, so you can sanity-check how the engine will read tricky words before playing them. Rules include things like silent trailing `e` (`like` → `lik`, but `tie`/`toe` keep theirs since a vowel precedes the `e`), `z` → `ss`, and `ing` → `e`.

## Getting started

```
npm install
npm run dev
```

Then open the printed local URL in your browser.

## How it works

- `VISEMES` in [`src/App.jsx`](src/App.jsx) defines the geometry (width, lip heights, teeth/tongue amounts) for each mouth pose. The SVG mouth is built from cubic Bézier paths derived from those numbers, so switching visemes is just a `d` attribute interpolation — no sprite sheets or frame-by-frame art.
- `tokenToViseme` maps individual characters/digraphs to one of those poses.
- `getPronouncedText` applies a small set of ordered regex rules to respell the input the way it'll be read aloud, purely for the preview toggle — it doesn't change playback.

## License

MIT — see [LICENSE](LICENSE).
