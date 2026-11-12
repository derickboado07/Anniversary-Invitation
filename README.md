# Our First Chapter: Maki & Yen

Run the invitation directly from this folder. Use Node.js 22.12+ or 24 LTS.

```powershell
cd "C:\Users\deric\OneDrive\Documents\Anniversary Invitation"
npm run dev
```

Open the **Local** URL printed by Vite. If port 5173 is already occupied, Vite prints the next available port. Press Ctrl+C in the terminal to stop the website.

Dependencies are already installed in this checkout, so `npm run dev` is enough. On a fresh copy or after deleting `node_modules`, run `npm install` here once. It also installs the app's dependencies inside `our-first-chapter/`.

Local startup uses the files on your computer and does not require a GitHub repository or GitHub sign-in. The root commands forward to the app folder, preserving its images, music, and environment settings. You can also run `npm run dev` from inside `our-first-chapter/`.

For a production build, run `npm run build` here. Output is written to `our-first-chapter/dist/`; `npm run preview` serves that build. `npm run typecheck` checks TypeScript.

The complete invitation project and [customization guide](./our-first-chapter/README.md) are in `our-first-chapter/`. Personalize messages, date plans, and captions in `our-first-chapter/src/data/anniversary.ts`. Add monthly photos to `our-first-chapter/public/images/memories/`.

Photos and background music in `our-first-chapter/public/` have been optimized from 23.31 MB to 6.63 MB. Originals stay in the app's `Monthly Image/` and `Background music/` folders, outside the production output. For Vercel, select **Root Directory: `our-first-chapter`**, **Framework: Vite**, **Build Command: `npm run build`**, and **Output Directory: `dist`**. If uploading only the contents of the app folder to your repository, leave Vercel's Root Directory at the repository root instead. See the app guide for the full deployment instructions.
