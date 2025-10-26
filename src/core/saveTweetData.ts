import { formatDateTimeForFilename } from "../lib/formatDateTimeForFilename.js";
import { printPostInfo } from "./printPostInfo.js";
import { saveImages } from "./saveImages.js";
import { saveText } from "./saveText.js";
import { saveVideo } from "./saveVideo.js";

import type { ITweetRepository } from "../interfaces/ITweetRepository.js";
import type { SaveContext } from "./type.js";

export type SaveTweetDataArgs = SaveContext & {
    tweetRepository: ITweetRepository;
};

/**
 * 個別のツイートの処理
 */
export const saveTweetData = async (args: SaveTweetDataArgs): Promise<boolean> => {
    const { article, tweetRepository, tweetDetail } = args;

    let tweetId = "";
    try {
        const linkElement = article.locator('a[href*="/status/"]').first();
        const href = await linkElement.getAttribute("href");
        tweetId = href ? href.split("/status/")[1].split("/")[0] : "";

        if (!tweetId) return false;
        if (await tweetRepository.isProcessed(tweetId)) {
            console.log(`ツイート (${tweetId}) は処理済みです`);
            return false;
        }

        console.log(`新規ブックマークを処理中: ${tweetId}`);
        await printPostInfo({ tweetDetail, article });

        const tweetTime = tweetDetail?.legacy?.created_at
            ? new Date(tweetDetail.legacy.created_at)
            : await (async () => {
                  const timeElement = article.locator("time").first();
                  const dateTime = await timeElement.getAttribute("datetime");
                  return dateTime ? new Date(dateTime) : new Date();
              })();
        const baseFilename = `${tweetId}_${formatDateTimeForFilename(tweetTime)}`;

        const saveContext: SaveContext = { ...args, article };

        const textContent = await saveText(saveContext, baseFilename);
        const imageFilenames = await saveImages(saveContext, baseFilename);
        const videoFilename = await saveVideo(saveContext, baseFilename, tweetId);

        await tweetRepository.markAsProcessed(tweetId, {
            tweetText: textContent ?? undefined,
            imageFilenames,
            videoFilename,
        });

        return true;
    } catch (error) {
        console.error(`ツイート (${tweetId}) の処理中にエラー:`, error);
        return false;
    } finally {
        console.log("\n");
    }
};
