import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import { fileURLToPath } from "url";
import { validateAndGetCompany } from "./company.js";
import { querySOLR, deleteJobByUrl, upsertJobs, upsertCompany } from "./solr.js";

const COMPANY_CIF = "11358358";
const TIMEOUT = 10000;
const RSS_FEED = "https://www.codespring.ro/category/jobs/feed";

let COMPANY_NAME = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        timeout: TIMEOUT,
        headers: { "User-Agent": "job_seeker_ro_spider" }
      });
      if (res.ok) return res;
      console.log(`Attempt ${i + 1} failed with status ${res.status}, retrying...`);
    } catch (err) {
      console.log(`Attempt ${i + 1} failed: ${err.message}, retrying...`);
    }
    await sleep(2000);
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function fetchRssFeed() {
  console.log(`Fetching RSS feed: ${RSS_FEED}`);
  const res = await fetchWithRetry(RSS_FEED);
  const xml = await res.text();
  return xml;
}

function parseRssJobs(xml) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const jobs = [];

  $("item").each((i, item) => {
    const $item = $(item);
    const title = $item.find("title").text().trim();
    const url = $item.find("link").text().trim();
    const pubDate = $item.find("pubDate").text().trim();
    const description = $item.find("description").text().trim();

    if (!title || !url) return;

    const isFilled = description.toLowerCase().includes("position has been filled") ||
                     description.toLowerCase().includes("position has been closed");

    const location = [];
    const titleLower = title.toLowerCase();
    if (titleLower.includes("cluj")) location.push("Cluj-Napoca");
    if (titleLower.includes("târgu mureș") || titleLower.includes("targu mures")) location.push("Târgu Mureș");
    if (titleLower.includes("odorheiu")) location.push("Odorheiu Secuiesc");
    if (location.length === 0) location.push("Cluj-Napoca");

    let workmode = "hybrid";
    if (description.toLowerCase().includes("remote") || description.toLowerCase().includes("from home")) {
      workmode = "remote";
    } else if (description.toLowerCase().includes("on-site") || description.toLowerCase().includes("on site")) {
      workmode = "on-site";
    }

    jobs.push({
      url,
      title,
      pubDate,
      isFilled,
      location,
      workmode
    });
  });

  return jobs;
}

async function scrapeAllListings() {
  const xml = await fetchRssFeed();
  const allJobs = parseRssJobs(xml);

  const activeJobs = allJobs.filter(j => !j.isFilled);
  console.log(`Total jobs in RSS: ${allJobs.length}`);
  console.log(`Active (not filled) jobs: ${activeJobs.length}`);

  if (activeJobs.length === 0) {
    console.log("No active jobs found. Checking if all jobs are filled...");
    return [];
  }

  return activeJobs;
}

function mapToJobModel(rawJob, cif, companyName = COMPANY_NAME) {
  const now = new Date().toISOString();

  const job = {
    url: rawJob.url,
    title: rawJob.title,
    company: companyName,
    cif: cif,
    location: rawJob.location?.length ? rawJob.location : undefined,
    workmode: rawJob.workmode || undefined,
    date: rawJob.pubDate || now,
    status: "scraped"
  };

  Object.keys(job).forEach((k) => job[k] === undefined && delete job[k]);

  return job;
}

function transformJobsForSOLR(payload) {
  const romanianCities = [
    'Bucharest', 'București', 'Cluj-Napoca', 'Cluj Napoca',
    'Timișoara', 'Timisoara', 'Iași', 'Iasi', 'Brașov', 'Brasov',
    'Constanța', 'Constanta', 'Craiova', 'Bacău', 'Sibiu',
    'Târgu Mureș', 'Targu Mures', 'Oradea', 'Baia Mare', 'Satu Mare',
    'Ploiești', 'Ploiesti', 'Pitești', 'Pitesti', 'Arad', 'Galați', 'Galati',
    'Odorheiu Secuiesc'
  ];

  const citySet = new Set(romanianCities.map(c => c.toLowerCase()));

  const normalizeWorkmode = (wm) => {
    if (!wm) return undefined;
    const lower = wm.toLowerCase();
    if (lower.includes('remote')) return 'remote';
    if (lower.includes('office') || lower.includes('on-site') || lower.includes('site')) return 'on-site';
    return 'hybrid';
  };

  const transformed = {
    ...payload,
    company: payload.company?.toUpperCase(),
    jobs: payload.jobs.map(job => {
      const validLocations = (job.location || []).filter(loc => {
        const lower = loc.toLowerCase().trim();
        if (lower === 'romania' || lower === 'românia') return true;
        return citySet.has(lower);
      }).map(loc => loc.toLowerCase() === 'romania' ? 'România' : loc);

      return {
        ...job,
        location: validLocations.length > 0 ? validLocations : ['România'],
        workmode: normalizeWorkmode(job.workmode)
      };
    })
  };

  return transformed;
}

async function main() {
  const testOnlyOnePage = process.argv.includes("--test");

  try {
    console.log("=== Step 1: Get existing jobs count ===");
    const existingResult = await querySOLR(COMPANY_CIF);
    const existingCount = existingResult.numFound;
    console.log(`Found ${existingCount} existing jobs in SOLR`);

    console.log("=== Step 2: Validate company via ANAF ===");
    const { company, cif, address } = await validateAndGetCompany();
    COMPANY_NAME = company;
    const localCif = cif;

    try {
      await upsertCompany({
        id: cif,
        company,
        brand: "CODESPRING",
        status: "activ",
        location: address ? [address] : ["Cluj-Napoca"],
        website: ["https://www.codespring.ro", "https://softech.ro"],
        career: ["https://www.codespring.ro/category/jobs"],
        lastScraped: new Date().toISOString().split('T')[0],
        scraperFile: "https://raw.githubusercontent.com/sebiboga/codespring-srl-nodejs-scraper/master/.github/workflows/scrape.yml"
      });
    } catch (err) {
      console.log(`Note: Could not upsert company to SOLR core: ${err.message}`);
    }

    console.log("=== Step 3: Scrape jobs from Codespring website ===");
    const rawJobs = await scrapeAllListings();
    const scrapedCount = rawJobs.length;
    console.log(`📊 Jobs scraped from Codespring website: ${scrapedCount}`);

    if (scrapedCount === 0) {
      console.log("No active jobs found. Skipping SOLR upsert.");
      console.log("\n=== DONE ===");
      console.log("Scraper completed successfully!");
      return;
    }

    const jobs = rawJobs.map(job => mapToJobModel(job, localCif));

    const payload = {
      source: "codespring.ro",
      scrapedAt: new Date().toISOString(),
      company: COMPANY_NAME,
      cif: localCif,
      jobs
    };

    console.log("Transforming jobs for SOLR...");
    const transformedPayload = transformJobsForSOLR(payload);
    const validCount = transformedPayload.jobs.filter(j => j.location).length;
    console.log(`📊 Jobs with valid Romanian locations: ${validCount}`);

    fs.writeFileSync("jobs.json", JSON.stringify(transformedPayload, null, 2), "utf-8");
    console.log("Saved jobs.json");

    console.log("\n=== Step 4: Upsert jobs to SOLR ===");
    await upsertJobs(transformedPayload.jobs);

    const finalResult = await querySOLR(COMPANY_CIF);
    console.log(`\n📊 === SUMMARY ===`);
    console.log(`📊 Jobs existing in SOLR before scrape: ${existingCount}`);
    console.log(`📊 Jobs scraped from Codespring website: ${scrapedCount}`);
    console.log(`📊 Jobs in SOLR after scrape: ${finalResult.numFound}`);
    console.log(`====================`);

    console.log("\n=== DONE ===");
    console.log("Scraper completed successfully!");

  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
