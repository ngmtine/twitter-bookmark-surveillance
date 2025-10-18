import fs from "node:fs/promises";
import path from "node:path";

import type { SaveContext } from "./type";

/**
 * ツイートに含まれる画像を保存する
 */
export const saveImages = async (
    saveContext: SaveContext, //
    baseFilename: string,
): Promise<string[]> => {
    const { page, saveDir, article } = saveContext;

    const imageFilenames: string[] = [];
    const images = await article.locator('[data-testid="tweetPhoto"] img').all();

    for (let i = 0; i < images.length; i++) {
        const imgUrl = await images[i].getAttribute("src");
        if (!imgUrl) continue;

        const cleanUrl = new URL(imgUrl);
        cleanUrl.searchParams.set("name", "large");

        let ext = path.extname(cleanUrl.pathname);
        if (!ext) {
            ext = `.${cleanUrl.searchParams.get("format") || "jpg"}`;
        }

        const imageFilename = `${baseFilename}_${i + 1}${ext}`;
        const imagePath = path.join(saveDir, imageFilename);

        const imgResponse = await page.request.get(cleanUrl.href);
        if (imgResponse.ok()) {
            await fs.writeFile(imagePath, await imgResponse.body());
            imageFilenames.push(imageFilename);
        }
    }
    return imageFilenames;
};
