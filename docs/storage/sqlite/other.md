下面是一条“够用、不过深”的 SQLite 学习路线，目标是：你能在 RN 或 Flutter App 里把 SQLite 当成本地数据层来用，能做表设计、CRUD、分页/搜索、简单事务与迁移，并能在真实业务（缓存/离线/收藏/草稿）里稳定落地。

---

## 总体目标与边界

你需要掌握到这几个能力即可（不追求数据库专家级）：

1. **能设计表**：知道主键、外键（可选）、索引、时间字段、软删除等基本模式
2. **能写常用查询**：CRUD + WHERE + ORDER BY + LIMIT/OFFSET + JOIN（少量）
3. **能在 App 中封装数据访问层**：统一 `db.ts/db.dart` + repository/service 层
4. **能处理迁移**：版本号、ALTER/重建表、数据迁移脚本
5. **能保障稳定性**：事务、并发串行化、错误处理、性能（索引、批量写入）

---

## 阶段 0：准备与工具（0.5 天）

### 你需要准备

* **SQLite 基本概念**：数据库文件、表、行、索引、事务
* **CLI 工具**（用于练习和排查）：macOS 终端 `sqlite3`

### 练习任务

1. 创建数据库 `app.db`
2. 建表 `users / posts / comments`（简单即可）
3. 用 CLI 完成一次 CRUD 与分页查询
   （你已经问过 iTerm2 使用，这部分可以直接复用）

---

## 阶段 1：SQLite 必备 SQL（2–3 天）

### 1. 表设计与约束（必学）

* 数据类型：`INTEGER / TEXT / REAL / BLOB / NULL`
* 主键：`INTEGER PRIMARY KEY`（Rowid 主键常用）
* 常见约束：`NOT NULL / UNIQUE / DEFAULT`
* 时间字段：`created_at / updated_at`（TEXT 存 ISO8601 最省心）
* 逻辑删除：`deleted_at` 或 `is_deleted`

**练习**：为 `posts` 增加 `updated_at`，更新时写入当前时间。

### 2. CRUD 与查询组合（必学）

* `SELECT ... WHERE ... ORDER BY ... LIMIT ... OFFSET ...`
* `LIKE` 模糊搜索
* 聚合：`COUNT/SUM/MAX`
* `IN (...)` 过滤
* 参数化查询（安全与性能关键）

**练习**：实现“帖子列表分页 + 按关键词搜索 + 按时间倒序”。

### 3. 索引（够用即可）

* 什么时候加索引：**where / order by 常用字段**
* 索引代价：写入变慢、空间增加

**练习**：为 `posts(created_at)`、`posts(user_id)` 建索引，对比查询速度（用 `EXPLAIN QUERY PLAN` 看有没有走索引）。

### 4. 事务（必学）

* `BEGIN; ... COMMIT;` / `ROLLBACK;`
* 批量插入必须用事务，不然性能很差

**练习**：一次插入 1000 条数据，用事务包裹。

---

## 阶段 2：把 SQLite 用在 App 的正确姿势（RN / Flutter）（3–5 天）

这一阶段不学更多 SQL，而是学“工程化落地”。

### A. 你会用 SQLite 的典型场景（必须明确）

* **离线缓存**：接口数据落库，支持离线展示
* **收藏/历史/草稿**：本地业务数据
* **搜索索引**：简单 LIKE 或轻量 FTS（可选）

### B. 数据层架构（必学）

推荐最小分层：

* `db`：负责打开数据库、初始化、迁移、提供执行 SQL 的方法
* `dao/repository`：每张表一个 DAO（CRUD、分页、查询）
* `service`：组合业务逻辑（例如“拉取帖子→落库→更新 UI”）

**练习**：写一个 `PostRepository`，提供：

* `list(page, pageSize)`
* `search(keyword, page, pageSize)`
* `upsertMany(posts[])`
* `deleteById(id)`

### C. 并发与连接管理（必学）

移动端常见问题：

* 同时多个请求写库导致冲突或卡顿
* 建议：**单实例 db + 写入串行队列**（RN/Flutter 都适用）

**练习**：把写操作统一走一个队列（或用库提供的事务/串行执行能力）。

### D. 迁移（必学）

至少掌握“版本化迁移”：

* 维护 `schema_version`
* `onCreate`：新库建表
* `onUpgrade`：版本升级迁移（增加列、重建表、搬运数据）

**练习**：从 v1 → v2：

* 给 `users` 增加 `avatar_url`
* 处理旧数据默认值

---

## 阶段 3：常见业务能力补齐（2–4 天）

### 1) Upsert（很常用）

* SQLite 3.24+ 支持 `INSERT ... ON CONFLICT DO UPDATE`
* 用于同步接口数据非常方便

**练习**：按 `remote_id` 做唯一键，实现“有则更新，无则插入”。

### 2) 批量写入性能

* 事务 + 批量 insert
* 避免每条都 await（Flutter/RN 都一样）

### 3) 数据一致性

* 外键（可选）：需要时开 `PRAGMA foreign_keys=ON`
* 级联删除（谨慎用，简单业务可用逻辑删除代替）

### 4) 调试能力

* 会导出 CSV/SQL
* 能用 CLI 打开 App 的 db 文件查看数据（开发阶段很有用）

---

## 阶段 4（可选）：只学一点点的高级特性（按需）

这些不是“入门必须”，但在 App 中很常用：

1. **FTS5 全文搜索**：比 LIKE 强（做搜索功能时再学）
2. **WAL 模式**：并发读写更友好（性能优化时再学）
3. **加密数据库**：涉及隐私/合规时再学（例如 SQLCipher）

---

## RN 与 Flutter 的“学习落地路径”建议

你现在的目标是“能做 App”，建议选一条主线先做通，再迁移到另一端：

### 如果你偏 RN

1. 先用一个成熟 SQLite 库完成 CRUD + 迁移
2. 再把数据层抽象成 repository，给 React Query / Zustand 等使用
3. 最后补：批量写入、事务、索引

### 如果你偏 Flutter

1. 用常见数据库封装（一般基于 sqlite）
2. 重点练：DAO / repository、迁移、批量写入
3. 最后补：搜索与离线同步策略

（你不需要先纠结库选型；路线先学通用能力，库只是实现载体。）

---

## 最小项目练习（强烈推荐，贯穿路线）

做一个“离线可用的帖子 App（简化版）”，表结构：

* `users(id, username, avatar_url, created_at)`
* `posts(id, remote_id, user_id, content, created_at, updated_at)`
* `post_cache_meta(key, value)`（存 lastSyncTime 等）

功能清单：

1. 列表分页（limit/offset）
2. 详情页（按 id）
3. 搜索（LIKE）
4. 下拉刷新：模拟接口返回→upsertMany→刷新 UI
5. 迁移：v1→v2 增加字段
6. 性能：批量写入必须用事务

你做完这个，就已经达到“RN/Flutter 配合 SQLite 不深入但够用”的水平。

---

## 你可以按这个节奏学（一个可执行的 10 天计划）

* Day 1：CLI + 建表 + CRUD
* Day 2：WHERE/ORDER/LIMIT/OFFSET + 分页
* Day 3：索引 + EXPLAIN + LIKE 搜索
* Day 4：事务 + 批量写入
* Day 5：App 接入 SQLite（建库/建表）
* Day 6：封装 Repository + 列表页读取
* Day 7：写入与 upsert + 离线缓存
* Day 8：迁移（onUpgrade）
* Day 9：性能与稳定性（串行写、错误处理）
* Day 10：完整小项目复盘与整理模板


如果你告诉我你现在主要做 **React Native 还是 Flutter**（二选一即可），我可以把上面路线进一步“落到具体代码模板”：

* RN：`db.ts`、`migrations/`、`PostRepository.ts`、分页/搜索示例
* Flutter：`db.dart`、`migration.dart`、`post_dao.dart`、分页/搜索示例
