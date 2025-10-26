import type { Locator } from "playwright";
import type { TweetDetail } from "./type.js";

/**
 * 引数の型
 */
type PrintPostInfoArgs = {
    tweetDetail?: TweetDetail;
    article: Locator;
};

/**
 * 現在のツイートの情報をログ出力
 */
export const printPostInfo = async (args: PrintPostInfoArgs) => {
    const { tweetDetail, article } = args;

    // ツイート本文の取得
    const textForLog = tweetDetail?.legacy?.full_text
        ? tweetDetail.legacy.full_text
        : await (async () => {
              const locator = article.locator('[data-testid="tweetText"]').first();
              return (await locator.count()) > 0 ? ((await locator.textContent()) ?? "") : "";
          })();

    // タイプ決定
    let mediaType = "text";
    const media = tweetDetail?.legacy?.extended_entities?.media;
    if (media && media.length > 0) {
        if (media.some((m) => m.type === "video" || m.type === "animated_gif")) {
            mediaType = "video";
        } else if (media.some((m) => m.type === "photo")) {
            mediaType = "image";
        }
    } else if ((await article.locator('[data-testid="tweetPhoto"] img').count()) > 0) {
        mediaType = "image";
    }

    // 出力
    const cleanedText = textForLog.replace(/\n|\r/g, " ").substring(0, 70);
    console.log(`[${mediaType}] ${cleanedText}...`);
};
