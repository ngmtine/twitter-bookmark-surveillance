import path from "node:path";

import { saveTweetData } from "./saveTweetData";

import type { Page } from "playwright";
import type { ITweetRepository } from "../interfaces/ITweetRepository";

const SAVE_DIR = path.join(process.cwd(), "bookmarks");
const BOOKMARKS_URL = "https://x.com/i/bookmarks";

type RunScrapingLoopArgs = {
    page: Page; //
    tweetRepository: ITweetRepository;
    tweetDetailCache: Map<string, any>;
};

/**
 * メインのスクレイピングループを実行する
 */
export const runScrapingLoop = async (args: RunScrapingLoopArgs): Promise<number> => {
    const { page, tweetRepository, tweetDetailCache } = args;

    let totalNewTweets = 0;
    const processedTweetIds = new Set<string>();

    await page.goto(BOOKMARKS_URL);
    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 15000 });

    console.log("ブックマークのスクロールと処理を開始します");
    let lastTranslateY = -1;

    // 最大200サイクルまでスクロール
    for (let i = 0; i < 200; i++) {
        const articles = await page.locator('//article[@data-testid="tweet" and not(ancestor::article[@data-testid="tweet"])]').all();
        console.log(`スクロールサイクル (${i + 1}回目): ${articles.length}件のツイートを検出`);

        for (const article of articles) {
            try {
                const linkElement = article.locator('a[href*="/status/"]').first();
                const href = await linkElement.getAttribute("href", { timeout: 5000 });
                const tweetId = href ? href.split("/status/")[1].split("/")[0] : "";

                if (!tweetId || processedTweetIds.has(tweetId)) continue;

                let tweetDetail = tweetDetailCache.get(tweetId);

                // キャッシュにない場合、API応答を少し待つ
                if (!tweetDetail) {
                    for (let retry = 0; retry < 5; retry++) {
                        await page.waitForTimeout(1000); // 1秒待機
                        tweetDetail = tweetDetailCache.get(tweetId);
                        if (tweetDetail) break;
                    }
                }

                if (!tweetDetail) {
                    console.warn(`ツイート (${tweetId}) の詳細情報取得がタイムアウトしました`);
                    continue;
                }

                processedTweetIds.add(tweetId);

                // ツイートの保存処理を実行
                const processed = await saveTweetData({
                    article,
                    tweetRepository,
                    page,
                    saveDir: SAVE_DIR,
                    tweetDetail: tweetDetail,
                });

                if (processed) {
                    totalNewTweets++;
                }
            } catch (error: any) {
                if (error.name === "TimeoutError") {
                    console.warn("タイムアウト: 構造が異なるか、読み込みが遅い要素をスキップしました");
                    continue; // タイムアウトエラーは無視して次のツイートへ
                }
                console.error("ツイート処理中の予期せぬエラー:", error);
            }
        }

        await page.keyboard.press("End");
        await page.waitForTimeout(2000);

        const lastCell = page.locator('div[data-testid="cellInnerDiv"]').last();
        if ((await lastCell.count()) === 0) {
            console.log("cellInnerDiv が見つからないため、スクロールを終了します");
            break;
        }
        const style = await lastCell.getAttribute("style");
        const translateY = style ? parseInt(style.match(/translateY\((\d+)px\)/)?.[1] ?? "-1", 10) : -1;

        if (translateY !== -1 && translateY === lastTranslateY) {
            console.log("ページの終端に到達したと判断します");
            break;
        }
        lastTranslateY = translateY;
    }
    return totalNewTweets;
};
