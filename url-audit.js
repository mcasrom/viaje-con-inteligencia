#!/usr/bin/env node

const axios = require("axios");
const cheerio = require("cheerio");
const chalk = require("chalk");

const BASE = process.argv[2];

if (!BASE) {
  console.log("Usage: node url-audit.js https://example.com");
  process.exit(1);
}

const visited = new Set();

async function checkUrl(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
    });

    const status = res.status;
    const html = res.data || "";

    let title = "";
    let length = 0;

    if (typeof html === "string") {
      const $ = cheerio.load(html);
      title = $("title").text();
      length = html.length;
    }

    const isSoft404 =
      status === 200 &&
      (length < 5000 ||
        html.toLowerCase().includes("not found") ||
        title.toLowerCase().includes("not found"));

    if (status >= 400) {
      console.log(chalk.red(`[${status}] ${url}`));
    } else if (isSoft404) {
      console.log(chalk.yellow(`[SOFT 404] ${url}`));
    } else {
      console.log(chalk.green(`[${status}] ${url}`));
    }

    return { url, status, isSoft404, length };
  } catch (e) {
    console.log(chalk.red(`[ERROR] ${url}`));
    return { url, status: "ERR", error: true };
  }
}

async function crawl(url, depth = 2) {
  if (visited.has(url) || depth === 0) return;
  visited.add(url);

  const res = await axios.get(url, {
    timeout: 10000,
    validateStatus: () => true,
  });

  const html = res.data;

  if (typeof html !== "string") return;

  const $ = cheerio.load(html);

  const links = $("a")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter(Boolean)
    .map((l) => new URL(l, BASE).href)
    .filter((l) => l.startsWith(BASE));

  for (const link of links) {
    await checkUrl(link);
    await crawl(link, depth - 1);
  }
}

(async () => {
  console.log("Starting audit:", BASE);
  await crawl(BASE, 2);
})();
