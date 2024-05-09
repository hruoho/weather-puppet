import puppeteer, {Browser, Page } from 'puppeteer';
import {writeFileSync} from 'fs';


const CLIP_DIR = 'foreca-clips';

main()

async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await captureTäsmäsää(page).catch(error => console.error(error));
    await captureDayparts(page).catch(error => console.error(error));
    await capture24hSää(page).catch(error => console.error(error));
    await captureDetails(page).catch(error => console.error(error));
    await captureHavaintohistoria(page).catch(error => console.error(error));

    browser.close()
}

async function captureTäsmäsää(page: Page) {
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala');
    await shootElementOnPage(page, "#mgwrap", "tasmasaa")
}

async function capture24hSää(page: Page) {
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala?1h');
    await shootElementOnPage(page, "#mgwrap", "24hsaa")
}

async function captureDetails(page: Page) {
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala?details');
    await shootElementOnPage(page, "#hourly", "details")
}

async function captureDayparts (page: Page) {
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala')
    await copyTextToFile(page, ".daywrap .day:first-child .txt", "tasmasaa-summary")
    await shootElementOnPage(page, ".daywrap .day:first-child .dayparts", "tasmasaa-day-parts")
}

async function captureHavaintohistoria (page: Page) {
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala/havaintohistoria')
    await shootElementOnPage(page, "#meteogram-scroll", "havaintohistoria")
}

async function shootElementOnPage(page: Page, element: string, filename: string) {
    // Wait for the element to be rendered
    // @ts-ignore
    await page.waitForSelector(element)

    // Get the bounding box of the element
    const elementHandle = await page.$(element);
    // @ts-ignore
    const boundingBox = await elementHandle.boundingBox();

    if (!boundingBox) {
        throw new Error('Could not find the bounding box of the element');
    }

    // Take a screenshot of the element
    await page.screenshot({
        path: `${CLIP_DIR}/${filename}-${(new Date).toISOString()}.png`.replace(/:/g, '-'),
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });
}

async function copyTextToFile(page: Page, selector: string, filename: string) {
    const textContent = await page.$eval(selector, element => element.textContent);
    const cleanedText = textContent.trim().replace(/\s+/g, ' ');
    writeFileSync(`${CLIP_DIR}/${filename}-${(new Date).getTime()}.txt`, cleanedText)
}



