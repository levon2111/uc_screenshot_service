#!/usr/bin/env node
const puppeteer = require('puppeteer');

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const {PendingXHR} = require('pending-xhr-puppeteer');


let width = 1920;
let height = 1200;
let fullPage = false;
let filepath = 'screenshot.png';

if (!argv.page_url) {
    throw "Please provide teh page url!  example: --page_url=http://yoursite.com";
}

if (argv.filepath && argv.filepath != 'undefined') {
    filepath = argv.filepath;
}


if (argv.width && argv.width != 'undefined') {
    width = argv.width
}

if (argv.height && argv.height != 'undefined') {
    height = argv.height
}
if (argv.full_page && argv.full_page != 'undefined') {
    fullPage = argv.full_page
}


async function run() {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    const pendingXHR = new PendingXHR(page);

    await page.goto(argv.page_url, {
        waitUntil: 'networkidle2',
    });

    await page.setViewport({width: width, height: height});


    await page.evaluate(async () => {
        const selectors = Array.from(document.querySelectorAll("img"));
        await Promise.all(selectors.map(img => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', reject);
            });
        }));
    })
    await pendingXHR.waitForAllXhrFinished();

    await page.screenshot({path: filepath, fullPage: fullPage});
    browser.close();
}

run();