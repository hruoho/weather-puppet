import puppeteer from 'puppeteer';

async function takeScreenshot() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala');
    await shootMgwrapOnPage("tasmasaa")

    await page.goto('https://www.foreca.fi/Finland/Kirkkonummi/Kylmala?1h');
    await shootMgwrapOnPage("24hsaa")

    async function shootMgwrapOnPage(fileSuffix: string) {
        // Wait for the element to be rendered
        // @ts-ignore
        await page.waitForSelector('#mgwrap');

        // Get the bounding box of the element
        const elementHandle = await page.$('#mgwrap');
        // @ts-ignore
        const boundingBox = await elementHandle.boundingBox();

        if (!boundingBox) {
            throw new Error('Could not find the bounding box of the element');
        }

        // Take a screenshot of the element
        await page.screenshot({
            path: `foreca-clips/${fileSuffix}-${(new Date).getTime()}.png`,
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height
            }
        });
    }


    // Close the browser
    await browser.close();
}

// Call the function
takeScreenshot().catch(error => console.error(error));
