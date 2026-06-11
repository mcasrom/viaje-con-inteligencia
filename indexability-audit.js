#!/usr/bin/env node

const axios = require("axios");
const cheerio = require("cheerio");
const chalk = require("chalk");

const BASE = process.argv[2];

if (!BASE) {
  console.log("Usage: node indexability-audit.js https://site.com");
  process.exit(1);
}

const visited = new Set();

function scorePage({ status, html }) {
  let score = 100;

  // 1. status code
  if (status >= 400) score -= 100;
  if (status === 301 || status === 302) score -= 20;

  // 2. content length
  if (!html || html.length < 2000) score -= 30;

  // 3. thin content signals
  const $ = cheerio.load(html || "");
  const text = $("body").text().trim();

  if (text.length < 500) score -= 25;

  // 4. signs of soft 404
  const lower = (html || "").toLowerCase();
  if (lower.includes("not found") || lower.includes("404")) score -= 50;

  // 5. missing title
  const title = $("title").text().trim();
  if (!title) score -= 15;

  return Math.max(0, score);
}

async function check(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
    });

    const html = res.data || "";
    const score = scorePage({ status: res.status, html });

    const $ = cheerio.load(html);
    const title = $("title").text().trim();

    let label = "";

    if (score >= 80) label = chalk.green("INDEXABLE");
    else if (score >= 50) label = chalk.yellow("WEAK");
    else label = chalk.red("NOT INDEXABLE");

    console.log(`${label} | score:${score} | ${res.status} | ${url} | ${title}`);

    return { url, score, status: res.status };
  } catch (e) {
    console.log(chalk.red(`ERROR | ${url}`));
    return { url, score: 0, error: true };
  }
}

async function crawl(url, depth = 2) {
  if (visited.has(url) || depth === 0) return;
  visited.add(url);

  try {
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
      await check(link);
      await crawl(link, depth - 1);
    }
  } catch (e) {}
}

(async () => {
  console.log(chalk.blue("Starting INDEXABILITY audit..."));
  await crawl(BASE, 2);
})();
