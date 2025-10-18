import { chromium } from "playwright";

(async () => {
    console.log("Windows側のChrome (localhost:9222) に接続します...");

    try {
        // connectOverCDP を使用して既存のChromeに接続
        const browser = await chromium.connectOverCDP("http://localhost:9222");

        // 既存のコンテキスト（タブが開いている状態）を取得
        const context = browser.contexts()[0];

        console.log("接続に成功しました。");
        console.log("ブラウザ（Windows側）でTwitter (X) にログインしてください。");
        console.log("ログインが完了したら、このWSLターミナルでEnterキーを押してください...");

        // ユーザーが手動でログインするのを待つ
        await new Promise((resolve) => process.stdin.once("data", resolve));

        // ログイン後のストレージ状態（Cookieなど）を保存
        await context.storageState({ path: "auth.json" });

        console.log("auth.json を保存しました。");

        // 接続を切断（ブラウザは閉じない）
        await browser.close();
    } catch (e) {
        console.error("接続に失敗しました。");
        console.error("Windows側でChromeが --remote-debugging-port=9222 で起動しているか、");
        console.error("WSLの networkingMode が mirrored になっているか確認してください。");
        console.error(e);
    }
})();
