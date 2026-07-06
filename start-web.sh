#!/bin/bash
export PATH="/Users/omeraksac/Desktop/bist-analiz-app/.tools/node-v20.19.5-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")"
exec npx expo start --web --port 8081
