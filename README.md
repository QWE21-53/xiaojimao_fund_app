# 基金实时估值系统

一个极简风格的基金实时估值网站，基于东方财富网数据。

## 功能特性

- ✅ 用户注册/登录系统
- ✅ 添加/删除自选基金
- ✅ 实时估算基金涨幅（基于天天基金网 API）
- ✅ 自动刷新（每30秒）
- ✅ 极简 UI 设计
- ✅ 响应式布局

## 技术栈

- **前端**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **数据获取**: SWR (自动缓存和刷新)
- **数据源**: 天天基金网 API (fundgz.1234567.com.cn)
- **数据存储**: JSON 文件 (简化版，可升级到数据库)
- **认证**: Cookie-based (简化版)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

或使用启动脚本：

```bash
./scripts/start.sh
```

### 3. 访问应用

打开浏览器访问: http://localhost:3000

## 使用说明

1. **注册账号**: 首次使用需要注册账号
2. **登录**: 使用邮箱和密码登录
3. **添加基金**: 点击"添加基金"按钮，输入6位基金代码（如：000001）
4. **查看估值**: 系统会自动显示基金的实时估值和涨幅
5. **删除基金**: 点击基金卡片右上角的 × 按钮

## 基金代码示例

- 000001 - 华夏成长
- 110022 - 易方达消费行业
- 161725 - 招商中证白酒
- 320007 - 诺安成长混合

## 项目结构

```
fund-estimator-web/
├── src/
│   ├── app/
│   │   ├── api/          # API 路由
│   │   ├── login/        # 登录页面
│   │   ├── dashboard/    # 主仪表板
│   │   └── layout.tsx    # 布局
│   └── lib/
│       ├── eastmoney.ts  # 东方财富网数据抓取
│       └── db.ts         # JSON 文件数据库
├── data/                 # 用户数据存储
├── scripts/              # 启动脚本
└── package.json
```

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出

### 基金管理
- `GET /api/funds` - 获取用户的自选基金列表
- `POST /api/funds` - 添加自选基金
- `DELETE /api/funds?code={fundCode}` - 删除自选基金

### 估值查询
- `GET /api/estimate?code={fundCode}` - 查询单个基金估值

## 数据来源

- **天天基金网**: https://fundgz.1234567.com.cn/js/{fundCode}.js
- **东方财富网**: https://fundf10.eastmoney.com/

## 数据持久化配置

### 方案 1: MongoDB Atlas（推荐）

1. **注册 MongoDB Atlas**
   - 访问 https://www.mongodb.com/cloud/atlas
   - 注册免费账号（512 MB 存储）

2. **创建集群**
   - 选择 Free Tier（M0）
   - 选择离你最近的区域

3. **获取连接字符串**
   - 点击 "Connect" → "Connect your application"
   - 复制连接字符串

4. **配置环境变量**
   ```bash
   # 复制示例文件
   cp .env.example .env.local
   
   # 编辑 .env.local，填入你的 MongoDB URI
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=fund-estimator
   ```

5. **重启服务器**
   ```bash
   npm run dev
   ```

### 方案 2: 内存存储（默认）

如果不配置 `MONGODB_URI`，系统会自动使用内存存储：
- ✅ 无需配置，开箱即用
- ⚠️ 数据重启后丢失
- 适合演示和测试

## 部署配置

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `MONGODB_URI`: 你的 MongoDB 连接字符串
   - `MONGODB_DB`: 数据库名称（如 `fund-estimator`）

2. 重新部署项目

### Zeabur 部署（国内可访问）

1. 访问 https://zeabur.com
2. 导入 GitHub 仓库
3. 添加环境变量（同上）
4. 部署完成

## 注意事项

1. ⚠️ **当前使用内存存储数据，重启后数据会丢失**（仅用于演示）
2. 生产环境建议使用数据库：
   - Vercel Postgres（推荐，免费额度）
   - MongoDB Atlas（免费额度）
   - Supabase（免费额度）
3. 密码使用 SHA-256 哈希，生产环境建议使用 bcrypt
4. 认证使用简单的 Cookie，生产环境建议使用 JWT 或 NextAuth.js
5. 数据抓取依赖第三方 API，可能存在限流风险
6. Vercel 部署在国外，国内访问可能较慢或无法访问

## 后续优化

- [ ] 升级到 PostgreSQL/MySQL 数据库
- [ ] 使用 NextAuth.js 完善认证系统
- [ ] 添加基金搜索功能
- [ ] 添加历史净值走势图
- [ ] 添加基金对比功能
- [ ] 移动端 App (React Native)

## License

MIT

## 作者

Created by OpenClaw AI Assistant
