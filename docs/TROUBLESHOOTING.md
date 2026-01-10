# Supabase + Prisma 连接问题排查总结

## 问题描述
执行 `npx prisma db push` 时，终端长时间卡住（Hang），无报错信息，最终可能超时或需要手动中断。

## 原因分析

1.  **IPv6 兼容性问题 (主要原因)**
    Supabase 提供的默认 "Direct Connection" URL (`db.[project-id].supabase.co`) 通常是 **IPv6 Only** 的。如果本地网络环境（ISP宽带、路由器或代理配置）不支持 IPv6，TCP 握手包会丢失，导致连接请求一直挂起。

2.  **连接池模式限制**
    Supabase 提供的 Transaction Pooler (端口 6543) 虽然可以通过 IPv4 连接，但它不支持 Prisma 的 Schema 修改命令（如 `db push`, `migrate deploy`），只能用于普通的 SQL 查询 (SELECT, INSERT 等)。

## 解决方案

使用 **Session Pooler** (端口 5432) 替代默认的 Direct Connection。

### 修改配置
在 `.env` 文件中，将 `DATABASE_URL` 和 `DIRECT_URL` 统一指向 Supabase 的 IPv4 兼容 Pooler 域名，并使用端口 **5432**。

**旧配置 (有问题):**
```bash
# 端口 6543 (Transaction Mode) -> 不支持 Schema 变更
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
# 域名 db.xxx (Direct) -> 仅 IPv6，导致卡死
DIRECT_URL="postgresql://...:5432/postgres"
```

**新配置 (已修复):**
```bash
# 统一使用 Pooler 域名的 5432 端口 (Session Mode)
# 既支持 IPv4 网络，又支持 Schema 变更
DATABASE_URL="postgresql://postgres.bdgqnhbtwzxrmpmeebko:vEUZS0lUkmhMDmlC@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.bdgqnhbtwzxrmpmeebko:vEUZS0lUkmhMDmlC@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

### 验证方法
在终端执行：
```bash
# 1. 验证 TCP 连接是否通畅 (看到 succeeded 即成功)
nc -zv aws-1-ap-south-1.pooler.supabase.com 5432

# 2. 再次执行推送
npx prisma db push
```
