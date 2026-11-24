# Tunely

A responsive songbook prototype for finding a song, following lyrics and chords together, and playing along with guitar or piano chord visuals.

## Run it

Open `index.html` in a browser, or publish the repository with GitHub Pages. No build step or dependencies are required. The Google Fonts import is optional; the page falls back to system sans-serif fonts if offline.

## Included in this prototype

- Search and load three original sample songs.
- Lyrics with chord names aligned above the words.
- Guitar chord diagrams and piano-key chord visuals.
- Adjustable automatic scrolling, with pause/resume and reading progress.
- Transpose controls and a save-song button.
- Responsive desktop and mobile layouts.

The song catalog and chord data currently live in the page's JavaScript. Connecting a licensed lyrics/catalog service and an audio chord-recognition backend would be the next step for finding chords from arbitrary recordings.

## Caméra Prompteur (`camera/`)

A simple video camera with an on-screen prompter: write or paste text over the camera preview, then record. The text is only drawn on the screen, so it never appears in the saved video.

- Front and back camera, sound recording, timer.
- Tap "Aa + Texte" to add text; tap a text to edit it (copy/paste works), drag to move it, pinch or use A− / A+ / slider to resize, toggle a background, delete.
- Eye button hides the text to check framing. Text is kept between visits.
- After recording: replay, then "Enregistrer" (share sheet on phone → save to Photos, download on computer).

Open `camera/index.html` over **https** (e.g. GitHub Pages) on your phone; browsers only allow camera access on secure pages. On iPhone, "Add to Home Screen" makes it open full screen like an app.
