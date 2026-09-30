# GM Garden Landscapes website

Live site: https://gmgardenlandscapes.netlify.app  
Edit the site: https://gmgardenlandscapes.netlify.app/admin/

## How it works

- **Eleventy v3** builds the site from `src/` into `_site/`. Netlify runs `npx @11ty/eleventy` on every push to `main`.
- **`content.json`** holds all the editable homepage wording, photos, reviews, FAQs and contact details.
  Phone, email, menu, services/areas lists and company name also feed the header/footer of every page.
- **Decap CMS** (`src/admin/`) edits `content.json` through Netlify Identity + Git Gateway.
  Gary logs in at `/admin`, presses **Publish**, Decap commits to GitHub, Netlify rebuilds (~2 min).
- Service and town pages (`src/patios.njk`, `src/landscaper-*.njk` …) have fixed wording – edit those files directly.
- Styles: `src/_includes/site.css` is shared by every page; `src/_includes/pages.css` adds the extras for the service and town pages. Both are inlined at build time.
- `privacy.html`, `terms.html`, `cookies.html` and `404.html` are copied as-is.
- Images live in `src/assets/img/` (uploads from the CMS land there too). Old `/img/…` links redirect (see `netlify.toml`).
- The quote form is a Netlify Form (`name="quote"`, honeypot `bot-field`) in `src/index.njk` – don't rename it.

## Local commands

```bash
npm install
npm start        # dev server with live reload
npm run build    # build into _site/
npm run check    # make sure every key in content.json is declared in src/admin/config.yml
```

**Adding a new field?** Add it to `content.json`, use it in a template, then declare it in
`src/admin/config.yml` – Decap deletes any key it doesn't know about when Gary publishes.
`npm run check` catches this.
