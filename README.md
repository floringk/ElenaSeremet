# ElenaSeremet
Redesign of Elene Seremet Website

## Vercel deployment

The project is set up for static deployment on [Vercel](https://vercel.com).

1. Push the repo to GitHub/GitLab/Bitbucket or import it in Vercel.
2. In Vercel, import the project; use the **root** of the repo (no subfolder). No build command or output directory is required.
3. After deploy:
   - **/** → mockups homepage (model list)
   - **/model-1** … **/model-6** → each mockup
   - **/content/** and **/Assets/** serve images and assets.

**Local preview with same URLs:** run `npx vercel dev` in the project root, then open `http://localhost:3000`.
