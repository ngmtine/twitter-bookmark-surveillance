import path from "node:path";

import { runShellCommand } from "../lib/runShellCommand.js";

import type { SaveContext } from "./type.js";

/**
 * ツイートに含まれる動画を保存する
 */
export const saveVideo = async (
    saveContext: SaveContext, //
    baseFilename: string,
    tweetId: string,
): Promise<string | undefined> => {
    const { saveDir, tweetDetail } = saveContext;

    const media = tweetDetail?.legacy?.extended_entities?.media;
    if (!media) return undefined;

    const videoMedia = media.find((m) => m.type === "video" || m.type === "animated_gif");
    if (!videoMedia?.video_info) return undefined;

    const variants = videoMedia.video_info.variants.filter((v) => v.bitrate != null);
    if (variants.length === 0) return undefined;

    const bestVariant = variants.reduce((prev, current) =>
        (prev.bitrate ?? 0) > (current.bitrate ?? 0) //
            ? prev
            : current,
    );

    const videoUrl = bestVariant.url;
    const videoFilename = `${baseFilename}_video.mp4`;
    const videoPath = path.join(saveDir, videoFilename);

    try {
        console.log(`ツイート (${tweetId}) の動画をダウンロード中...`);
        const ffmpegCommand = `ffmpeg -i "${videoUrl}" -c copy "${videoPath}"`;
        await runShellCommand(ffmpegCommand);
        console.log(`動画を保存しました: ${videoPath}`);
        return videoFilename;
    } catch (e) {
        console.error(`ffmpegの実行に失敗しました: ${e}`);
        return undefined;
    }
};
