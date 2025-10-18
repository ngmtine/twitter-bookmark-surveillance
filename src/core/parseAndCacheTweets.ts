/**
 * Bookmarks APIのレスポンスを解析し、ツイート情報をキャッシュに保存する
 * @param json - APIレスポンスのJSON
 * @param cache - ツイート情報を保存するMap
 */
export const parseAndCacheTweets = (
    json: any, //
    cache: Map<string, any>,
): void => {
    const instructions = json.data?.bookmark_timeline_v2?.timeline?.instructions;
    if (!instructions) return;

    for (const instruction of instructions) {
        if (instruction.type !== "TimelineAddEntries") continue;

        const entries = instruction.entries;
        if (!entries) continue;

        for (const entry of entries) {
            if (!entry.entryId.startsWith("tweet-")) continue;

            const tweetId = entry.entryId.replace("tweet-", "");
            const tweetResult = entry.content?.itemContent?.tweet_results?.result;

            if (tweetId && tweetResult) {
                cache.set(tweetId, tweetResult);
            }
        }
    }
};
