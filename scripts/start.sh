#!/bin/bash

# 基金估值网站启动脚本

cd "$(dirname "$0")/.."

echo "🚀 启动基金估值网站..."

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 创建数据目录
mkdir -p data

# 启动开发服务器
echo "🌐 启动开发服务器..."
npm run dev
