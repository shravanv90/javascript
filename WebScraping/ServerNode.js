"use strict";

//declare variables
const express = require("express");
const puppeteer = require("puppeteer");
// const fs = require("fs/promises");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
let obj = {};
//let keywordText = "";
let finalResultList = [];
const jobSites = {
  monsterSite: "https://www.monsterindia.com/srp/results?query=",
  naukriSite: "https://www.naukri.com/", // append "sinequa-jobs" at the end
  indeedSite: "https://in.indeed.com/jobs?q=",
};

///////////////////////////Express Section, Build API ////////////////////////////////////
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.get("/api/job-feed", async function (req, res) {
  // const jobFeed = await fs.readFile("jobfeed/MonsterJobs.txt", "utf8");
  const jobFeed = JSON.stringify(finalResultList);
  return res.status(200).json({ result: JSON.parse(jobFeed) });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("running on port 5000");
});

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/search", async function (request, response) {
  app.set("keywordText", request.body.search);
  console.log(app.settings.keywordText);
  response.sendStatus("200");
  //console.log(keywordText);
  // response.json;
  await (scrapeMonsterJobs(jobSites.monsterSite, app.settings.keywordText),
  scrapeNaukriJobs(jobSites.naukriSite, app.settings.keywordText),
  scrapeIndeedJobs(jobSites.indeedSite, app.settings.keywordText));

  console.log("done scraping");
  //return finalResultList;

  //return response.status(200).json({ search: request.body.search });
});

//scrapeMonsterJobs(jobSites.monsterSite, keywordText);
//scrapeNaukriJobs(jobSites.naukriSite, keywordText);
//scrapeIndeedJobs(jobSites.indeedSite, keywordText);

///////////////////////////Indeed Section////////////////////////////////////
async function scrapeIndeedJobs(url, keyword) {
  const source = "Indeed.com";
  //finalResultList = [];
  console.log("scraping Indeed.com");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
  );

  await page.goto(`${url}${keyword}`);

  const resultText = await page.evaluate(() => {
    let jobTitle = Array.from(
      document.querySelectorAll(
        "div.slider_container > div > div.slider_item > div > table.jobCard_mainContent > tbody > tr > td > div.heading4.color-text-primary.singleLineTitle.tapItem-gutter > h2 > span"
      )
    ).map((x) => x.textContent);

    let companyName = Array.from(document.querySelectorAll(".companyName")).map(
      (x) => x.textContent
    );

    let location = Array.from(
      document.querySelectorAll(
        "div.slider_container > div > div.slider_item > div > table.jobCard_mainContent > tbody > tr > td > div.heading6.company_location.tapItem-gutter.companyInfo > div"
      )
    ).map((x) => x.textContent.replace(" ", ""));

    let posted = Array.from(
      document.querySelectorAll(
        "div.slider_container > div > div.slider_item > div > table.jobCardShelfContainer > tbody > tr.underShelfFooter > td > div.heading6.tapItem-gutter.result-footer > span.date"
      )
    ).map((x) => x.textContent);

    let link = Array.from(
      document.querySelectorAll("#mosaic-provider-jobcards > a")
    ).map((x) => `https://indeed.com${x.getAttribute("href")}`);

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
      loc: resultText.location[i],
      post: resultText.posted[i],
      link: resultText.link[i],
      source: source,
    };
    finalResultList.push(obj);
  }

  await browser.close();
  return finalResultList;
}

///////////////////////////Naukri Section////////////////////////////////////
async function scrapeNaukriJobs(url, keyword) {
  const source = "Naukri.com";
  //finalResultList = [];
  console.log("scraping Naukri.com");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
  );

  await page.goto(`${url}${keyword}-jobs`);
  console.log(`${url}${keyword}-jobs`);
  const resultText = await page.evaluate(() => {
    let jobTitle = Array.from(
      document.querySelectorAll(
        "div.search-result-container > div.content > section.listContainer.fleft > div.list > article > div.jobTupleHeader > div > a"
      )
    ).map((x) => x.textContent);

    let companyName = Array.from(
      document.querySelectorAll(
        "div.search-result-container > div.content > section.listContainer.fleft > div.list > article > div.jobTupleHeader > div > div > a"
      )
    ).map((x) => x.textContent);

    let location = Array.from(
      document.querySelectorAll(
        "div.search-result-container > div.content > section.listContainer.fleft > div.list > article > div.jobTupleHeader > div > ul > li.fleft.grey-text.br2.placeHolderLi.location > span.ellipsis.fleft.fs12.lh16.halfwdt"
      )
    ).map((x) => x.textContent.replace(" ", ""));

    let posted = Array.from(
      document.querySelectorAll(
        "div.search-result-container > div.content > section.listContainer.fleft > div.list > article > div.jobTupleFooter.mt-20 > div.type.br2.fleft.grey > span"
      )
    ).map((x) => x.textContent);

    let link = Array.from(
      document.querySelectorAll(
        "div.search-result-container > div.content > section.listContainer.fleft > div.list > article > div.jobTupleHeader > div > a"
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
      loc: resultText.location[i],
      post: resultText.posted[i],
      link: resultText.link[i],
      source: source,
    };
    finalResultList.push(obj);
  }

  await browser.close();
  return finalResultList;
}

///////////////////////////Monster Section////////////////////////////////////
async function scrapeMonsterJobs(url, keyword) {
  console.log("from the func", keyword);
  finalResultList = [];
  console.log("scraping Monster.com");
  const source = "Monster.com";
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
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
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-footer.apply-footer.no-bdr > div.posted-update > span.posted"
      )
    ).map((x) => x.textContent);

    let link = Array.from(
      document.querySelectorAll(
        "#srp-right-part > div > div.srp-left > div > div > div > div > div > div.card-panel.apply-panel.job-apply-card > div.card-body.card-body-apply.pd10 > div > div > h3 > a"
      )
    ).map((x) => `https:${x.getAttribute("href")}`);

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
  await browser.close();

  return finalResultList;
  // await fs.writeFile(
  //   "jobfeed/MonsterJobs.txt",
  //   JSON.stringify(finalResultList)
  // );
}
