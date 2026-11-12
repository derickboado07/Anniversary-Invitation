# Our First Chapter: Maki & Yen

A small, romantic digital love letter for your first anniversary. Built with React, Vite, TypeScript, Tailwind CSS, Motion, and Lucide. The website is static and needs no custom backend. Optional automatic itinerary emails use a connected EmailJS sender and its public browser API.

## Run it locally

From the parent **Anniversary Invitation** folder, you can run `npm run dev` directly. The root startup command forwards here and preserves the app's environment settings and assets. On a fresh copy, run `npm install` in the parent folder once first. Running locally does not require GitHub.

Use Node.js **22.12+** (or 24 LTS). In a terminal:

```powershell
cd "C:\Users\deric\OneDrive\Documents\Anniversary Invitation\our-first-chapter"
npm install
npm run dev
```

Open the local URL printed by Vite. Before deployment:

```sh
npm run typecheck
npm run build
npm run preview
```

The production site is generated in `dist/`. `npm run preview` lets you check that build locally.

## Personalize the invitation

Start with **`src/data/anniversary.ts`**. It holds the names, anniversary dates, opening letter, hero, invitation messages, monthly memories, itinerary, gift note, full love letter, footer, and optional music settings.

- **Names:** edit `names` and any personalized text in `opening`, `hero`, `invitation`, `letter`, and `footer`. The wording is intentionally editable, so search this file for “Maki” and “Yen” when changing the couple.
- **Dates:** edit `anniversaryDate`, `relationshipStart`, `celebrationDate`, and the human-readable date labels. Update `countdownTarget` as well. Its explicit `+08:00` offset means midnight in the Philippines, regardless of the visitor's timezone. The default is `2026-11-22T00:00:00+08:00`.
- **Love letter:** edit `letter.greeting`, `letter.paragraphs`, `letter.signoff`, and `letter.signature`. Each item in `paragraphs` becomes a complete paragraph.
- **Colors and typography:** begin with the shared styles in `src/styles/`. Fonts are bundled locally; the page does not need a Google Fonts request.

This checkout uses the locally available **Newsreader** and **IBM Plex Sans** font families, with a system handwritten accent. Package downloads are restricted in this environment, so these bundled editorial alternatives keep the complete site usable offline. To use Cormorant Garamond, DM Sans, and Caveat instead, install their `@fontsource` packages, add their font imports in `src/main.tsx`, and replace the corresponding font-face and font-family declarations in `src/styles/global.css` and the section styles.

## Add your 12 photos

The supplied photos from `Monthly Image/` are now connected to all 12 gallery cards. Copies use the filenames below. The featured hero uses the supplied `main picture.png` photo-booth strip, copied to `public/images/main-picture.png`, with `main picture 2.png` copied to `public/images/main-picture-2.png` in the overlapping frame behind it. Edit `hero.photo` and `hero.backPhoto` in the central data file to replace either print. Your original files are preserved. The supplied `Augsut 2025.jpeg` file is mapped to the August 2026 card; replace `public/images/memories/aug-2026.jpg` if you intended a different photo there.

Copy your photos into **`public/images/memories/`** with these exact filenames:

| Month | Filename |
| --- | --- |
| November 2025 | `nov-2025.jpg` |
| December 2025 | `dec-2025.jpg` |
| January 2026 | `jan-2026.jpg` |
| February 2026 | `feb-2026.jpg` |
| March 2026 | `mar-2026.jpg` |
| April 2026 | `apr-2026.jpg` |
| May 2026 | `may-2026.jpg` |
| June 2026 | `jun-2026.jpg` |
| July 2026 | `jul-2026.jpg` |
| August 2026 | `aug-2026.jpg` |
| September 2026 | `sep-2026.jpg` |
| October 2026 | `oct-2026.jpg` |

Use **`public/images/main-picture.png`** for the featured hero photo. Its `hero.photo.format: 'photostrip'` setting in the central data file keeps the full vertical strip visible; remove that setting to restore the standard photo frame. If a photo is missing or cannot load, an original illustrated placeholder appears. Photos are never replaced with random stock images. **Restart the dev server after adding or renaming image files**, and rebuild before deployment: available images are discovered when Vite starts/builds so missing placeholders do not cause broken network requests.

Resize your photos before uploading: roughly 1200–1600 pixels on the longest side is usually plenty. Aim for a few hundred KB each. Export real JPG files rather than renaming HEIC files to `.jpg`.

Each memory has its own complete object in **`memories.items`** in the data file. Edit that month's `caption`, `alt`, photo `src`, and crop `position` directly. For example:

```ts
{
  id: 'nov-2025',
  month: 'November', shortMonth: 'NOV', year: '2025',
  src: '/images/memories/nov-2025.jpg',
  alt: 'Describe your actual November photo here',
  caption: 'Your own little memory goes here.',
  position: '50% 35%',
}
```

`position` controls the crop using CSS `object-position`. `50% 50%` centers the image; `50% 25%` favors the top. Add a complete November 2026 object to the end of the array for an optional bonus memory, then update the section title if desired.

The lightbox works with touch and keyboard: tap a frame, use the arrow controls or Left/Right keys, and press Escape to close.

## Change the itinerary

Edit **`itinerary.entries`** in the same data file. Every entry has:

```ts
{
  id: 'morning',
  period: 'Morning',
  time: 'Time to be announced',
  place: 'Your confirmed destination',
  title: 'Your activity title',
  description: 'A short note about this part of your day.',
  icon: 'sunrise',
  // Optional:
  image: { src: '/images/your-stop.jpg', alt: 'Describe the image' },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Your+Place',
}
```

Icons available: `sunrise`, `utensils`, `compass`, and `moon`. Leave `mapsUrl` absent until you have a real Google Maps link. The Maps button only appears for a valid configured Maps URL. The itinerary contains only the booked **6:00 PM anniversary dinner at The Nest Dining in the Sky, Vivere Hotel, Alabang, on November 22, 2026**, with its Maps search link. Its `dressCode` is the requested attire for the couple's evening: a dress, formal attire, or smart semi-formal attire. The venue photo comes from [Vivere Hotel's official website](https://viverehotel.com.ph/stories/the-nest-rooftop-dining-alabang-manila/), with a credited local copy in `public/images/venues/`. Edit the entry's `image` fields to replace the photo or its credit.

After changing the plan, run `npm run email:preview` to regenerate `email/email-preview.txt`, `email/email-preview.html`, `email/email-preview.png`, and `email/email-preview-mobile.png` from the same itinerary. Preview generation does not send an email.

The dinner section's `gallery` uses the four supplied `The nest 1/2/3/4.webp` photos from `Monthly Image/`, with local copies in `public/images/venues/`. Photos crossfade every five seconds while the gallery is in view; visitors can choose a thumbnail, use the arrows, or pause. Playback also pauses during hover, keyboard focus, and hidden tabs. Reduced-motion visitors start with a still image and can navigate manually. Portrait photos keep their full framing against a soft background.

Edit the dinner entry's `attireOptions` to customize the illustrated Dress, Formal, and Semi-formal examples. The same category names, example outfits, and details appear in the email and TXT download.

## Dudu and Bubu artwork

The two supplied illustrations from `Monthly Image/` are displayed separately: the standing pair overlaps the lower corner of the hero photos in the foreground, and the bucket-hat pair holds hearts on the date invitation. Their website copies are in `public/images/dudu-bubu/`; replace those copies to change the artwork. The opening envelope, accepted invitation, and footer each use a different vector pose in `src/components/DuduBubu.tsx`. The footer pair dances with moving arms, blinking eyes, and tapping feet. Placement and mobile sizing live in `src/styles/bear-placements.css`.

Photo strips enter in sequence, headings reveal word by word as they come into view, and the bear pictures gently float or sway. `src/components/RevealText.tsx` controls the heading reveals. All animations respect the visitor's reduced-motion setting, keeping text and artwork fully visible without motion.

## Gift exchange and music

Edit **`gift`** to change the gift note, paragraphs, P.S., or tiny surprise message. Set `gift.enabled` to `false` to hide the entire section.

Your supplied **Love Is by The Ridleys** is connected at `public/audio/our-song.mp3`; the original in `Background music/` is preserved. A floating play/pause control appears after the letter opens and stays available while scrolling. The song loops, pauses/resumes from the same position, and **starts off on every visit**. No audio downloads or playback are requested until the visitor presses play.

Customize `audio.title`, `audio.src`, and `audio.volume` in the central data file (volume ranges from `0` to `1`; the default is `0.3`). Set `audio.enabled` to `false` to hide the player entirely. To replace the song, replace `public/audio/our-song.mp3` with another MP3 you have permission to use. Music never autoplays, including after a refresh.

## Optimized photos and music

The deployed copies are compressed while the original uploads remain unchanged in `Monthly Image/` and `Background music/`.

| Assets | Original size | Optimized size |
| --- | --- | --- |
| 12 monthly photos and hero photo | 17.58 MB | 3.76 MB |
| Full background song | 5.73 MB | 2.86 MB |
| Total | 23.31 MB | 6.63 MB |

Photos keep their aspect ratios and JPG filenames, with a maximum dimension of 1600 pixels and JPEG quality of 82%. The full song stays MP3, encoded at 96 kbps, 44.1 kHz, stereo. Existing gallery and player paths remain valid. Future replacements should also be resized/compressed before being copied into `public/`.

The original upload folders, local optimization helpers, and caches are outside `public/` and are not included in the production build. Deploy `dist/`, which contains the optimized assets and the built website.

## Deploy to Vercel or Netlify

Push the project to your own Git repository and import it into your hosting account. If your repository contains the parent folder, set the project's root/base directory to `our-first-chapter`.

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output/publish directory | `dist` |

On **Vercel**, import the repository, select those settings, and deploy. On **Netlify**, choose “Import an existing project,” set the base directory when needed, and use the same build/publish settings. The page needs no backend. For automatic itinerary email, add the three public EmailJS environment values described in [EMAIL_SETUP.md](./EMAIL_SETUP.md). This is a single-page site using section anchors, so it does not need route rewrite rules.

After receiving your final domain, set **`siteUrl`** in the central data file and review the title, description, and Open Graph tags in **`index.html`**. Open Graph images should use an absolute public URL such as `https://your-domain.example/social-card.png` for dependable link previews. Rebuild and deploy after changes. The bundled social preview and favicon are original artwork.

The Vite configuration writes your configured title, description, and sharing URLs into the built HTML. Set `siteUrl` to the actual deployed address to generate absolute sharing URLs; while it is empty, the share button uses the current page address. Static Vercel/Netlify deployments follow that host's access settings. Sites registration metadata is present in `.openai/hosting.json`, but registration alone does not mean a site is published.

To edit the illustrated link preview, change `public/social-card.svg`, then run `node scripts/create-social-card.mjs` to regenerate its PNG (uses the same installed Chrome configuration as the browser tests).

## Browser checks

`npm test` runs the Playwright interaction checks against a local Vite server. The configuration uses installed Google Chrome at its standard Windows path. Set the `CHROME_PATH` environment variable to your Chrome executable on another system. A browser is only needed for tests; the website and production build have no browser installation requirement.

`npm run test:email` checks the configured email workflow against its own local server on port 5184 (override with `EMAIL_TEST_PORT`), using dummy public IDs and intercepted API responses. It never reuses an ordinary preview server, whose email settings may differ. It checks full itinerary content, duplicate prevention on refresh, uncertain responses, reset during a request, and downloads. **No test emails are delivered.**

## Replay while customizing

The local development site replays the envelope once for the requested reset. After opening it, use **Restart invitation** to try again. This clears only this invitation's answer, opened state, and email receipt; other browser data stays untouched. The preview-only control is absent from the production website.

An explicit `/?reset=1` URL also resets the invitation once in the browser where you open it. The parameter is removed immediately, so a later refresh preserves a new Yes. Resetting the browser cannot retract an email already submitted to the provider.

## Automatic itinerary email

The email implementation and HTML template are ready; delivery requires connecting your own sender and configuring a fixed recipient in EmailJS. Follow [EMAIL_SETUP.md](./EMAIL_SETUP.md) and copy `.env.example` to an ignored `.env.local`. Do not put email passwords or private keys in the website.

Once configured in production, clicking Yes saves the answer and requests one itinerary email to the template's recipient. The email and the **Save our itinerary** text download use the same central data, including the single dinner booking, dress code, and venue photo reference. The sent HTML email uses the photo's public HTTPS `emailSrc`, while local previews embed the local image so they work offline. Edit `email` and `itinerary.entries` in `src/data/anniversary.ts` before sharing.

Local rehearsals do not send by default, even when public EmailJS IDs are set. A deliberate development send requires `VITE_EMAIL_SEND_IN_PREVIEW=true`. The accepted state accurately distinguishes preview, pending, acknowledged, unavailable, and uncertain delivery. Refreshing an accepted invitation does not automatically request another copy. A lost response asks the visitor to check their inbox before manually retrying.

## Acceptance and privacy

Pressing Yes saves acceptance using **localStorage in that browser only**. When configured, it also requests an itinerary email to Yen's fixed private recipient address in EmailJS. It **does not send an RSVP notification to Maki**. Yen should tell Maki separately. A different browser/device, private browsing, clearing site data, or blocked storage may lose the saved state. The invitation remains usable if browser storage is unavailable. Browser-only email receipt storage reduces duplicates but cannot guarantee one delivery across browsers/devices or cleared storage.

The site does not ask Yen for personal information. If email is enabled, EmailJS and the connected sender provider process the message for delivery; Yen's email address stays in the template dashboard, outside public website code. **Photos included in a deployed static site may be publicly accessible through the site URL or direct asset links**. A romantic private tone and `noindex` metadata are not access control. Use hosting access protection if you need actual privacy, and only deploy photos you both feel comfortable sharing.

Animations respect reduced-motion preferences. The No button is playful for pointer/touch visitors, with a steady keyboard path and a discreet “Maybe later” option.

The No button explores 15 shuffled hideouts in a reserved area, leaving a brief heart trail and changing its cheeky label as it moves. On phones, the area sits below Yes. Edit `invitation.noLabels` and `invitation.playfulMessages` in the central data file to personalize its reactions. Reduced motion removes the trail and animated travel; keyboard users can focus the steady No button and press Enter to defer.
