"use strict";

//declare variables
// const axios = require("axios");
// const cheerio = require("cheerio");
const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cors = require("cors");
const jobSites = {
  monsterSite: "https://www.monsterindia.com/srp/results?query=",
  naukriSite: "https://www.naukri.com/", // append "sinequa-jobs" at the end
  indeedSite: "https://in.indeed.com/jobs?q=",
};
let keywordText = "sinequa";

scrapeMonsterJobs(jobSites.monsterSite, keywordText);
scrapeNaukriJobs(jobSites.naukriSite, keywordText);
scrapeIndeedJobs(jobSites.indeedSite, keywordText);

///////////////////////////Indeed Section////////////////////////////////////
async function scrapeIndeedJobs(url, keyword) {
  const source = "Indeed.com";
  const browser = await puppeteer.launch();
  let obj = {};
  let finalResultList = [];
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
  );

  await page.goto(`${url}${keyword}`);

  const resultText = await page.evaluate(() => {
    let jobTitle = Array.from(
      document.querySelectorAll(
        "div.slider_container > div > div.slider_item > div > table.jobCard_mainContent > tbody > tr > td > div.heading4.color-text-primary.singleLineTitle.tapItem-gutter > h2"
      )
    ).map((x) => x.textContent);

    return jobTitle;
  });
  await fs.writeFile("jobfeed/IndeedJobs.txt", JSON.stringify(resultText));
  await browser.close();
}

///////////////////////////Naukri Section////////////////////////////////////
async function scrapeNaukriJobs(url, keyword) {
  const source = "Naukri.com";
  const browser = await puppeteer.launch();
  let obj = {};
  let finalResultList = [];
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
  );

  await page.goto(`${url}${keyword}-jobs`);

  const resultText = await page.evaluate(() => {
    let jobTitle = Array.from(
      document.querySelectorAll(
        "div.search-result-container > div.content > section.listContainer.fleft > div.list > article > div.jobTupleHeader"
      )
    ).map((x) => x.textContent);

    return jobTitle;
  });
  await fs.writeFile("jobfeed/NaukriJobs.txt", JSON.stringify(resultText));
  await browser.close();
}

///////////////////////////Monster Section////////////////////////////////////
async function scrapeMonsterJobs(url, keyword) {
  const source = "Monster.com";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let obj = {};
  let finalResultList = [];
  await page.goto(`${url}${keyword}`);
  const resultText = await page.evaluate(() => {
    let jobTitle = Array.from(
      document.querySelectorAll(
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-body.card-body-apply.pd10 > div > div > h3 > a"
      )
    ).map((x) => x.textContent);

    let companyName = Array.from(
      document.querySelectorAll(
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-body.card-body-apply.pd10 > div > div > span > a"
      )
    ).map((x) => x.textContent);

    let location = Array.from(
      document.querySelectorAll(
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-body.card-body-apply.pd10 > div > div > div > div.col-xxs-12.col-sm-5.text-ellipsis > span > small"
      )
    ).map((x) => x.textContent.replace(" ", ""));

    let posted = Array.from(
      document.querySelectorAll(
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-footer.apply-footer.no-bdr > div.posted-update.pl5 > span"
      )
    ).map((x) => x.textContent);

    let link = Array.from(
      document.querySelectorAll(
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-body.card-body-apply.pd10 > div > div > h3 > a"
      )
    ).map((x) => x.getAttribute("href"));

    return {
      jobTitle,
      companyName,
      location,
      posted,
      link,
    };
  });

  for (let i = 0; i < resultText.jobTitle.length; i++) {
    obj = {
      job: resultText.jobTitle[i],
      company: resultText.companyName[i],
      loc: resultText.location[i].replace(/^\s+|\s+$/g, ""),
      post: resultText.posted[i].replace(/^\s+|\s+$/g, ""),
      link: resultText.link[i].replace(/^\/+/, ""),
      source: source,
    };
    finalResultList.push(obj);
  }
  await fs.writeFile(
    "jobfeed/MonsterJobs.txt",
    JSON.stringify(finalResultList)
  );
  await browser.close();
}

///////////////////////////Express Section, Build API ////////////////////////////////////
const app = express();

app.get("/api/job-feed", async function (req, res) {
  const jobFeed = await fs.readFile("jobfeed/MonsterJobs.txt", "utf8");

  return res.status(200).json({ result: JSON.parse(jobFeed) });
});
app.use(
  cors({
    origin: "*",
  })
);
app.listen(3000, () => {
  console.log("running on port 3000");
});
