// Publish latest blog posts to Telegram and Mastodon
// Usage: node scripts/publish-posts.mjs

const BLOG_URL = "https://www.viajeinteligencia.com/blog";

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
const TELEGRAM_BOT_TOKEN = "8759369996:AAGsrx0g5oZppfhKE4m40W5JVtI5aFfOe0c";
const TELEGRAM_CHANNEL_ID = "-1003910098382";

function escapeMD(text) {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

async function publishToTelegram(post) {
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
const MASTODON_ACCESS_TOKEN = "v4GW2kcbkaXMggW7oV06ORk6QRQo7KIzljDKCUd0ABQ";

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
