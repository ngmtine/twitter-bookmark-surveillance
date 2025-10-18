import Database from "better-sqlite3";

import type { ITweetRepository, TweetData } from "../interfaces/ITweetRepository";

/**
 * ITweetRepository の SQLite 実装を生成するファクトリ
 * @param dbPath - データベースファイルのパス
 * @returns ITweetRepository のインスタンス
 */
export const createSqliteTweetRepositoryImpl = (dbPath: string): ITweetRepository => {
    const db = new Database(dbPath);

    // DB初期化
    db.exec(`
CREATE TABLE IF NOT EXISTS processed_tweets (
    id TEXT PRIMARY KEY,
    processed_at TEXT NOT NULL,
    tweet_text TEXT,
    image_filename_1 TEXT,
    image_filename_2 TEXT,
    image_filename_3 TEXT,
    image_filename_4 TEXT,
    video_filename TEXT
);
    `);

    /**
     * better-sqlite3が同期APIであるため、インターフェースに合わせるための非同期ラッパー
     */
    const runAsync = async <T>(fn: () => T): Promise<T> => {
        return Promise.resolve(fn());
    };

    const isProcessed = (tweetId: string): Promise<boolean> => {
        return runAsync(() => {
            const stmt = db.prepare("SELECT id FROM processed_tweets WHERE id = ?");
            return !!stmt.get(tweetId);
        });
    };

    const markAsProcessed = (tweetId: string, data: TweetData): Promise<void> => {
        return runAsync(() => {
            const stmt = db.prepare(`
INSERT OR IGNORE INTO processed_tweets (
    id,
    processed_at,
    tweet_text,
    image_filename_1,
    image_filename_2,
    image_filename_3,
    image_filename_4,
    video_filename
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const images = data.imageFilenames || [];

            stmt.run(
                tweetId, //
                new Date().toISOString(),
                data.tweetText ?? null,
                images[0] ?? null,
                images[1] ?? null,
                images[2] ?? null,
                images[3] ?? null,
                data.videoFilename ?? null,
            );
        });
    };

    const close = (): void => {
        db.close();
    };

    return {
        isProcessed,
        markAsProcessed,
        close,
    };
};
