import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import { parseAndCacheTweets } from "./core/parseAndCacheTweets.js";
import { runScrapingLoop } from "./core/runScrapingLoop.js";
import { createSqliteTweetRepositoryImpl } from "./infrastructure/SqliteTweetRepositoryImpl.js";

import type { Browser, BrowserContext } from "playwright";
import type { ITweetRepository } from "./interfaces/ITweetRepository.js";

const AUTH_FILE = "auth.json";
const SAVE_DIR = path.join(process.cwd(), "bookmarks");
const DB_FILE = path.join(SAVE_DIR, "bookmarks.sqlite");

const main = async () => {
    await fs.mkdir(SAVE_DIR, { recursive: true });

    const tweetRepository: ITweetRepository = createSqliteTweetRepositoryImpl(DB_FILE);
    let isShuttingDown = false;

    // クリーンアップ処理
    const handleExitSignal = async (browser: Browser) => {
        if (isShuttingDown) return;
        isShuttingDown = true;
        console.log("\n終了シグナルを検知しました DBとブラウザを閉じます...");
        tweetRepository.close();
        await browser.close();
        console.log("クリーンアップが完了しました");
        process.exit(0);
    };

    const browser = await chromium.launch({ headless: true });
    process.on("SIGINT", () => handleExitSignal(browser));
    process.on("SIGTERM", () => handleExitSignal(browser));

    let context: BrowserContext;
    try {
        context = await browser.newContext({ storageState: AUTH_FILE });
    } catch (error) {
        console.error(`${AUTH_FILE} の読み込みに失敗しました`);
        await browser.close();
        return;
    }

    const page = await context.newPage();
    page.setDefaultTimeout(60000); // 60秒
    const tweetDetailCache = new Map<string, any>();

    // APIレスポンスを監視してツイート詳細をキャッシュ
    page.on("response", async (response) => {
        const url = response.url();
        if (!url.includes("/i/api/graphql/") || !url.includes("Bookmarks")) return;

        try {
            const json = await response.json();
            parseAndCacheTweets(json, tweetDetailCache);
        } catch {
            // JSONパースエラー等
            console.warn(`[API Response Parse Error] URL: ${response.url()}`);
        }
    });

    // スクレイピング＆保存ループを実行
    let totalNewTweets = 0;
    try {
        totalNewTweets = await runScrapingLoop({ page, tweetRepository, tweetDetailCache });
    } catch (error) {
        console.error("スクレイピング処理中にエラーが発生しました:", error);
        await page.screenshot({ path: "error_screenshot.png" });
    } finally {
        if (!isShuttingDown) {
            console.log(`処理が完了しました。合計 ${totalNewTweets} 件の新規ブックマークを処理しました`);
            tweetRepository.close();
            await browser.close();
            process.exit(0);
        }
    }
};

main();
