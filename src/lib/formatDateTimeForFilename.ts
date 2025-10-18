/**
 * 日付をファイル名に適した形式 (yyyy-mm-dd_HH-MM-SS) にフォーマットする
 * @param date - フォーマットするDateオブジェクト
 * @returns フォーマット済み文字列
 */
export const formatDateTimeForFilename = (date: Date): string => {
    const isoString = date.toISOString();
    return `${isoString.slice(0, 10)}_${isoString.slice(11, 19).replace(/:/g, "-")}`;
};
