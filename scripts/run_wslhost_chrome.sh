#!/bin/bash

CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"

"$CHROME_PATH" \
  --remote-debugging-port=9222 \
  --no-first-run \
  --no-default-browser-check \
  --disable-gpu \
  --user-data-dir=C:\\temp\\chrome-debug > /dev/null 2>&1 &

sleep 3

curl http://localhost:9222/json/version 2>/dev/null

# wsl側からホストのchromeを起動するシェルスクリプト
# 起動済みのchromeは全て終了させておく

# 要 $USERHOME/.wslconfig に以下
# [wsl2]
# networkingMode=mirrored

# https://zenn.dev/pepabo/articles/e1e5bcb477d36c
