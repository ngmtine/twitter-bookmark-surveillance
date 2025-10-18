/**
 * 永続化するツイートのデータ
 */
export interface TweetData {
    tweetText?: string;
    imageFilenames?: string[];
    videoFilename?: string;
}

/**
 * ツイートの永続化層を表すインターフェース
 */
export interface ITweetRepository {
    /**
     * 指定されたツイートIDが処理済みかどうかを確認する
     * @param tweetId - 確認するツイートID
     * @returns 処理済みの場合は true, それ以外は false
     */
    isProcessed(tweetId: string): Promise<boolean>;

    /**
     * 指定されたツイートIDを処理済みとしてマークし、関連データを保存する
     * @param tweetId - 処理済みとしてマークするツイートID
     * @param data - 保存するツイートのデータ
     */
    markAsProcessed(tweetId: string, data: TweetData): Promise<void>;

    /**
     * データベース接続を閉じる
     */
    close(): void;
}
