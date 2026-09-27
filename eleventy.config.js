// Eleventy config for GM Garden Landscapes.
// All editable homepage wording, photos and contact details live in /content.json,
// which Gary edits through Decap CMS at /admin.
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://gmgardenlandscapes.netlify.app";
const CONTENT = path.join(__dirname, "content.json");

const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const withPhone = (text, gm) =>
  String(text == null ? "" : text).split("{phone}").join(gm.contact.phone);

function homeSchema(gm) {
  const c = gm.contact;
  const co = gm.advanced.company;
  const seo = gm.advanced.seo;
  const business = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": SITE_URL + "/#business",
    name: co.name,
    image: SITE_URL + seo.shareImage,
    logo: SITE_URL + "/assets/img/logo-icon.png",
    description: co.description,
    telephone: c.phoneLink,
    email: c.email,
    url: SITE_URL + "/",
    foundingDate: String(co.foundingYear),
    priceRange: co.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: String(c.location).split(",")[0].trim(),
      addressRegion: co.region,
      addressCountry: co.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: Number(co.latitude), longitude: Number(co.longitude) },
    areaServed: (gm.areas || []).map((a) => ({ "@type": "City", name: a.name })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Landscaping services",
      itemListElement: (gm.services || []).map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name },
      })),
    },
    sameAs: c.facebook ? [c.facebook] : [],
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: c.openingDays || [], opens: c.opens, closes: c.closes },
    ],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_URL + "/#website",
    name: co.name,
    url: SITE_URL + "/",
    publisher: { "@id": SITE_URL + "/#business" },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (gm.faqs || []).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: withPhone(f.answer, gm) },
    })),
  };
  const tag = (o) =>
    '<script type="application/ld+json">\n' + JSON.stringify(o, null, 2).replace(/</g, "\\u003c") + "\n</script>";
  return [business, website, faq].map(tag).join("\n");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("gm", () => JSON.parse(fs.readFileSync(CONTENT, "utf8")));
  eleventyConfig.addGlobalData("site", { url: SITE_URL });
  eleventyConfig.addWatchTarget(CONTENT);

  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: false });

  eleventyConfig.addFilter("h", esc);
  eleventyConfig.addFilter("js", (v) => JSON.stringify(v == null ? "" : v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("paras", (t) =>
    String(t == null ? "" : t).replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  );
  eleventyConfig.addFilter("num", (n) => Number(n).toLocaleString("en-GB"));
  eleventyConfig.addFilter("navlink", (link, prefix) =>
    String(link || "").startsWith("#") ? (prefix || "") + link : link
  );
  eleventyConfig.addFilter("imageList", (list) => (list || []).map((i) => (typeof i === "string" ? i : i.image)));
  eleventyConfig.addFilter("withPhone", withPhone);
  eleventyConfig.addFilter("homeSchema", homeSchema);

  // Files copied as-is
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/*.html"); // privacy, terms, cookies, 404
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  return {
    templateFormats: ["njk"],
    dir: { input: "src", includes: "_includes", output: "_site" },
  };
};
