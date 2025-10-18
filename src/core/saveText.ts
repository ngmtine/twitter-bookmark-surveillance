import fs from "node:fs/promises";
import path from "node:path";

import type { SaveContext } from "./type";

/**
 * ツイート本文を保存する
 */
export const saveText = async (
    saveContext: SaveContext, //
    baseFilename: string,
): Promise<string | null> => {
    const { tweetDetail, article, saveDir } = saveContext;

    const textContent = tweetDetail?.legacy?.full_text
        ? tweetDetail.legacy.full_text
        : await (async () => {
              const textLocator = article.locator('[data-testid="tweetText"]').first();
              return (await textLocator.count()) > 0 //
                  ? await textLocator.textContent()
                  : null;
          })();

    if (!textContent) return null;

    const textFilePath = path.join(saveDir, `${baseFilename}_.txt`);
    await fs.writeFile(textFilePath, textContent, "utf-8");
    return textContent;
};
