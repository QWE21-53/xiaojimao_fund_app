# 部署指南

## 方案 1: Zeabur 部署（国内可访问）⭐

### 步骤 1: 注册 Zeabur

1. 访问 https://zeabur.com
2. 使用 GitHub 账号登录

### 步骤 2: 创建项目

1. 点击 "New Project"
2. 选择 "Import from GitHub"
3. 选择 `xiaojimao_fund_app` 仓库
4. 点击 "Deploy"

### 步骤 3: 配置环境变量（可选）

如果要使用 MongoDB 持久化：

1. 点击项目 → "Variables"
2. 添加环境变量：
   - `MONGODB_URI`: 你的 MongoDB 连接字符串
   - `MONGODB_DB`: `fund-estimator`
3. 点击 "Save"

### 步骤 4: 获取访问地址

部署完成后，Zeabur 会自动生成域名：
- 格式：`https://fund-estimator-web-xxx.zeabur.app`
- 国内可直接访问 ✅

### 步骤 5: 绑定自定义域名（可选）

1. 在 Zeabur 项目设置中添加域名
2. 配置 DNS CNAME 记录
3. 等待生效

---

## 方案 2: Vercel 部署（需科学上网）

### 自动部署

代码已推送到 GitHub，Vercel 会自动部署：
- 地址：https://fund-estimator-web.vercel.app
- 国内访问：需要科学上网 ⚠️

### 配置环境变量

1. 访问 https://vercel.com/gtgtgtggtgs-projects/fund-estimator-web/settings/environment-variables
2. 添加环境变量：
   - `MONGODB_URI`: 你的 MongoDB 连接字符串
   - `MONGODB_DB`: `fund-estimator`
3. 重新部署

---

## 方案 3: Railway 部署（国内访问较好）

### 步骤 1: 注册 Railway

1. 访问 https://railway.app
2. 使用 GitHub 账号登录

### 步骤 2: 创建项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `xiaojimao_fund_app` 仓库

### 步骤 3: 配置环境变量

同 Zeabur 方案

### 步骤 4: 获取访问地址

- 格式：`https://fund-estimator-web.up.railway.app`
- 国内访问：较好 ✅

---

## MongoDB Atlas 配置

### 快速开始

运行配置向导：
```bash
./scripts/setup-mongodb.sh
```

### 手动配置

1. **注册账号**
   - 访问 https://www.mongodb.com/cloud/atlas
   - 使用 Google/GitHub 快速登录

2. **创建集群**
   - 选择 M0 Free（512 MB 免费）
   - 区域选择：Singapore 或 Hong Kong
   - 点击 Create

3. **创建用户**
   - 设置用户名和密码
   - 记住密码！

4. **配置网络**
   - 添加 IP: 0.0.0.0/0（允许所有）
   - 或添加你的服务器 IP

5. **获取连接字符串**
   - 点击 Connect → Connect your application
   - 复制连接字符串
   - 替换 `<password>` 为你的密码

6. **配置环境变量**
   ```bash
   # 本地开发
   cp .env.example .env.local
   # 编辑 .env.local，填入 MONGODB_URI
   
   # 生产环境
   # 在部署平台（Zeabur/Vercel/Railway）添加环境变量
   ```

---

## 测试部署

### 本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:3000
```

### 生产测试

1. 访问部署的域名
2. 注册一个测试账号
3. 添加基金代码（如：000001）
4. 查看是否正常显示
5. 刷新页面，检查数据是否保存

---

## 常见问题

### Q: 数据会丢失吗？

A: 
- 使用 MongoDB：数据永久保存 ✅
- 不配置 MongoDB：重启后丢失 ⚠️

### Q: 国内能访问吗？

A:
- Zeabur：可以 ✅
- Railway：可以 ✅
- Vercel：需要科学上网 ⚠️

### Q: 免费吗？

A: 是的！
- Zeabur：有免费额度
- Railway：$5 免费额度/月
- Vercel：免费
- MongoDB Atlas：512 MB 免费

### Q: 如何更新代码？

A: 推送到 GitHub，自动部署：
```bash
git add .
git commit -m "更新"
git push origin main
```

---

## 推荐配置

**最佳方案**：Zeabur + MongoDB Atlas
- ✅ 国内可访问
- ✅ 数据持久化
- ✅ 完全免费
- ✅ 自动部署

**备用方案**：Vercel + MongoDB Atlas
- ⚠️ 需要科学上网
- ✅ 数据持久化
- ✅ 完全免费
- ✅ 自动部署
