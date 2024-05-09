import puppeteer from 'puppeteer';
import {writeFileSync} from 'fs'

async function takeScreenshot() {
    const CLIP_DIR = 'foreca-clips'
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala');
    await shootElementOnPage("#mgwrap", "tasmasaa")
    await shootElementOnPage(".daywrap .day:first-child .dayparts", "tasmasaa-day-parts")
    await copyTextToFile(".daywrap .day:first-child .txt", "tasmasaa-summary-text")

    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala?1h');
    await shootElementOnPage("#mgwrap", "24hsaa")

    async function shootElementOnPage(element: string, filename: string) {
        // Wait for the element to be rendered
        // @ts-ignore
        await page.waitForSelector(element);

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

    async function copyTextToFile(selector: string, filename: string) {
        const textContent = await page.$eval(selector, element => element.textContent);
        const cleanedText = textContent.trim().replace(/\s+/g, ' ');
        writeFileSync(`${CLIP_DIR}/${filename}-${(new Date).getTime()}.txt`, cleanedText)
    }


    // Close the browser
    await browser.close();
}

// Call the function
takeScreenshot().catch(error => console.error(error));
