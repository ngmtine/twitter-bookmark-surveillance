import type { Locator, Page } from "playwright";
import type { ITweetRepository } from "../interfaces/ITweetRepository";

/**
 * Twitter APIレスポンスの型定義 (必要な部分のみ)
 */
export type TweetDetail = {
    legacy: {
        created_at: string;
        full_text: string;
        extended_entities?: {
            media: {
                type: "video" | "photo" | "animated_gif";
                video_info?: {
                    variants: {
                        bitrate?: number;
                        url: string;
                    }[];
                };
            }[];
        };
    };
};

/**
 * 各保存処理で使うコンテキスト情報をまとめた型
 */
export type SaveContext = {
    article: Locator; //
    page: Page;
    saveDir: string;
    tweetDetail?: TweetDetail; // APIから取得したツイート詳細
};
