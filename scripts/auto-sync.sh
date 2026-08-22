#!/bin/bash
# ============================================================
# 光影助手 - GitHub 自动同步脚本
# 用法：
#   ./scripts/auto-sync.sh          # 单次提交并推送所有更改
#   ./scripts/auto-sync.sh --watch  # 监听文件变化，自动提交推送
# ============================================================

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

BRANCH="main"
COMMIT_PREFIX="chore: auto-sync"

# 确保在 git 仓库中
if [ ! -d ".git" ]; then
  echo "[auto-sync] 初始化 git 仓库..."
  git init
  git branch -M "$BRANCH"
fi

# 单次同步
sync_once() {
  local changes
  changes=$(git status --porcelain)
  if [ -z "$changes" ]; then
    echo "[auto-sync] 无更改，跳过 ($(date '+%H:%M:%S'))"
    return 0
  fi

  local changed_count
  changed_count=$(echo "$changes" | wc -l | tr -d ' ')
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  echo "[auto-sync] 检测到 $changed_count 个文件更改，正在提交..."
  git add -A
  git commit -m "${COMMIT_PREFIX} (${timestamp}) - ${changed_count} files" --no-verify

  if git remote get-url origin >/dev/null 2>&1; then
    echo "[auto-sync] 推送到 GitHub..."
    git push origin "$BRANCH" 2>&1 | tail -3
    echo "[auto-sync] 推送完成 ✓"
  else
    echo "[auto-sync] 未配置远程仓库，仅本地提交"
  fi
}

# 监听模式
watch_mode() {
  echo "[auto-sync] 启动文件监听模式 (Ctrl+C 退出)"
  echo "[auto-sync] 监听目录: src/, scripts/, *.json, *.ts, *.js, *.html, *.css"

  # 使用 inotifywait 如果可用，否则使用轮询
  if command -v inotifywait >/dev/null 2>&1; then
    while true; do
      inotifywait -r -e modify,create,delete,move \
        --exclude 'node_modules|\.git|dist|\.cache' \
        src scripts 2>/dev/null || sleep 2
      sleep 1
      sync_once
    done
  else
    echo "[auto-sync] inotifywait 不可用，使用轮询模式（每10秒检查）"
    while true; do
      sync_once
      sleep 10
    done
  fi
}

# 主入口
case "${1:-}" in
  --watch|-w)
    watch_mode
    ;;
  *)
    sync_once
    ;;
esac
