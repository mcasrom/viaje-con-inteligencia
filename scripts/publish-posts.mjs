// Publish latest blog posts to Telegram and Mastodon
// Usage: MASTODON_ACCESS_TOKEN=xxx node scripts/publish-posts.mjs
// Tokens are loaded from .env.local or environment variables

import { createRequire } from "module";
import fs from "fs";
import path from "path";

// Load .env.local if exists
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    });
}

const BLOG_URL = "https://www.viajeinteligencia.com/blog";

/* ========================
   POSTS TO PUBLISH
   Add new posts here, or run with --latest flag to auto-pick
======================== */
const posts = [
  {
    slug: "Que-es-viaje-inteligencia",
    title: "Qué es Viaje Inteligencia: viajar mejor usando datos, IA y estrategia",
    excerpt: "Viajar ya no es solo elegir destino y comprar un vuelo. Quien viaja mejor toma mejores decisiones: datos, IA y estrategia al servicio de tus viajes.",
    tags: ["viajes", "inteligencia", "IA", "planificación", "ahorro"],
  },
  {
    slug: "Como-encontrar-vuelos-baratos",
    title: "Cómo encontrar vuelos baratos en 2026: guía completa con estrategia real",
    excerpt: "Encontrar vuelos baratos no es cuestión de suerte, es cuestión de método. Aprende las estrategias que realmente funcionan para pagar menos.",
    tags: ["vuelos baratos", "ahorro", "viajes", "trucos vuelos"],
  },
];

/* ========================
   TELEGRAM
======================== */
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

function escapeMD(text) {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

async function publishToTelegram(post) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.error("❌ Telegram: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID");
    return false;
  }

  const hashtags = post.tags.map((t) => escapeMD("#" + t.replace(/\s+/g, ""))).join(" ");
  const message =
    `📝 *${escapeMD(post.title)}*\n\n` +
    `${escapeMD(post.excerpt)}\n\n` +
    `${escapeMD("🔗 ")}${escapeMD(BLOG_URL)}/${escapeMD(post.slug)}\n\n` +
    hashtags;

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: false,
      }),
    }
  );

  const data = await res.json();
  if (data.ok) {
    console.log(`✅ Telegram: "${post.title}"`);
    return true;
  } else {
    console.error(`❌ Telegram FAILED: "${post.title}"`, data);
    return false;
  }
}

/* ========================
   MASTODON
======================== */
const MASTODON_ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;

async function publishToMastodon(post) {
  if (!MASTODON_ACCESS_TOKEN) {
    console.warn(`⏭️ Mastodon skipped (no token): "${post.title}"`);
    return false;
  }

  const hashtags = post.tags.map((t) => "#" + t.replace(/\s+/g, "")).join(" ");
  const status =
    `📝 ${post.title}\n\n` +
    `${post.excerpt}\n\n` +
    `🔗 ${BLOG_URL}/${post.slug}\n\n` +
    hashtags;

  const res = await fetch("https://mastodon.social/api/v1/statuses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MASTODON_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      visibility: "public",
    }),
  });

  const data = await res.json();
  if (data.url) {
    console.log(`✅ Mastodon: "${post.title}" → ${data.url}`);
    return true;
  } else {
    console.error(`❌ Mastodon FAILED: "${post.title}"`, data);
    return false;
  }
}

/* ========================
   MAIN
======================== */
async function main() {
  console.log("📢 Publishing blog posts...\n");

  for (const post of posts) {
    console.log(`--- ${post.title} ---`);
    await publishToTelegram(post);
    await publishToMastodon(post);
    console.log("");
  }

  console.log("Done!");
}

main().catch(console.error);
