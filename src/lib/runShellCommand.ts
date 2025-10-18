import { exec } from "node:child_process";

type Return = Promise<{
    stdout: string; //
    stderr: string;
}>;

/**
 * シェルコマンドを非同期で実行するラッパー関数
 * @param command 実行するコマンド
 * @returns コマンドの実行結果（標準出力、標準エラー）
 */
export const runShellCommand = async (command: string): Return => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`コマンドの実行に失敗しました: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.warn(`標準エラー出力: ${stderr}`);
            }
            resolve({ stdout, stderr });
        });
    });
};
