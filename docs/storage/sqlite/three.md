下面给你一份「SQLite 在 macOS 的 iTerm2（终端）里」的基本使用大全，按“能直接上手”的顺序组织。默认你用的是系统自带的 `sqlite3`（或通过 Homebrew 安装的新版），命令在 iTerm2 里完全一样。

---

## 1) 安装与确认版本

### 方式 A：macOS 自带（通常已存在）

```bash
sqlite3 -version
which sqlite3
```

### 方式 B：Homebrew 安装（想用较新版本时）

```bash
brew install sqlite
sqlite3 -version
```

如果系统里有多个 `sqlite3`，用 `which sqlite3` 看当前命令实际指向哪个路径。

---

## 2) 创建/打开数据库

### 创建（文件不存在会自动创建）

```bash
sqlite3 my.db
```

### 打开已有数据库

```bash
sqlite3 path/to/exist.db
```

进入后会看到交互式提示符：

```
sqlite>
```

### 退出

```sql
.quit
```

或在终端按 `Ctrl + D`。

---

## 3) SQLite CLI 的两类命令：SQL vs 点命令

* **SQL**：以 `SELECT/INSERT/UPDATE...` 开头，最后用 `;` 结束
* **点命令**：以 `.` 开头（比如 `.tables`、`.schema`），不需要 `;`

例子：

```sql
.tables
SELECT 1;
```

---

## 4) 常用点命令（强烈建议记住）

### 查看帮助

```sql
.help
```

### 查看所有表

```sql
.tables
```

### 查看某张表的建表语句（结构）

```sql
.schema users
```

### 查看数据库的附加信息

```sql
.databases
```

### 查看当前输出模式/配置

```sql
.show
```

### 执行系统命令（少用，但有时很方便）

```sql
.shell ls
.shell pwd
```

---

## 5) 输出显示“更好看”：列对齐、表头、宽度

### 最常用组合

```sql
.headers on
.mode column
```

### 设定列宽（可选）

```sql
.width 5 20 30
```

### 查看数据更适合用表格/box（看你喜好）

```sql
.mode box
```

### 导出时常用 CSV 模式

```sql
.mode csv
```

---

## 6) 建库建表与增删改查（CRUD）完整例子

下面是一套能直接跑的最小闭环示例。

### 6.1 创建表

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 6.2 插入数据

```sql
INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');
INSERT INTO users (username, email) VALUES ('bob', 'bob@example.com');
```

### 6.3 查询数据

```sql
SELECT * FROM users;
SELECT id, username FROM users WHERE username = 'alice';
```

### 6.4 更新数据

```sql
UPDATE users SET email = 'alice@new.com' WHERE username = 'alice';
```

### 6.5 删除数据

```sql
DELETE FROM users WHERE username = 'bob';
```

---

## 7) 条件、排序、分页、聚合（查询常用套路）

### 排序 + 分页

```sql
SELECT * FROM users ORDER BY id DESC LIMIT 10 OFFSET 0;
```

### 模糊查询

```sql
SELECT * FROM users WHERE username LIKE 'a%';
```

### 聚合统计

```sql
SELECT COUNT(*) AS total FROM users;
```

### 分组

```sql
-- 例：假设有 posts(user_id)
SELECT user_id, COUNT(*) AS cnt
FROM posts
GROUP BY user_id
ORDER BY cnt DESC;
```

---

## 8) 外键与关联查询（SQLite 常见坑：外键默认不强制）

### 8.1 开启外键约束（每次连接都建议开）

```sql
PRAGMA foreign_keys = ON;
```

你也可以先检查：

```sql
PRAGMA foreign_keys;
```

### 8.2 建两张表并关联

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

插入：

```sql
INSERT INTO posts (user_id, content) VALUES (1, 'hello sqlite');
```

关联查询：

```sql
SELECT p.id, u.username, p.content, p.created_at
FROM posts p
JOIN users u ON u.id = p.user_id
ORDER BY p.id DESC;
```

---

## 9) 事务（Transaction）与回滚

当你要批量写入或保证一致性时：

```sql
BEGIN;
INSERT INTO users (username) VALUES ('cathy');
INSERT INTO users (username) VALUES ('david');
COMMIT;
```

如果中途发现不对：

```sql
ROLLBACK;
```

---

## 10) 导入/导出（CSV / SQL）

### 10.1 导出 CSV（非常常用）

```sql
.headers on
.mode csv
.output users.csv
SELECT * FROM users;
.output stdout
```

### 10.2 导出整库 SQL（备份）

在终端（不是 sqlite 提示符内）：

```bash
sqlite3 my.db ".dump" > backup.sql
```

恢复：

```bash
sqlite3 new.db < backup.sql
```

### 10.3 导入 CSV 到表

假设你已经创建好表 `users(username,email)`，CSV 第一行是表头：

```sql
.mode csv
.import --skip 1 users.csv users
```

查看导入结果：

```sql
SELECT COUNT(*) FROM users;
```

---

## 11) 读写 SQL 文件（脚本化）

你可以把 SQL 写进 `init.sql`：

```sql
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS t(id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO t(name) VALUES ('x');
```

执行：

```bash
sqlite3 my.db < init.sql
```

或在 sqlite3 交互里：

```sql
.read init.sql
```

---

## 12) 常见排错与实用技巧

### 12.1 “忘了分号”导致一直在 `...>` 提示符

你会看到：

```
...>
```

补一个 `;` 回车即可，或 `Ctrl + C` 取消当前输入。

### 12.2 看执行计划（性能分析）

```sql
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE username = 'alice';
```

### 12.3 建索引（查询慢时）

```sql
CREATE INDEX idx_users_username ON users(username);
```

### 12.4 查看当前连接的配置

```sql
.show
```

---

## 13) 一套推荐的“开局模板”

每次进库后先敲这几行，体验会好很多：

```sql
.headers on
.mode column
PRAGMA foreign_keys = ON;
```

---

如果你愿意，我可以按你现在的场景再补一份“更贴近项目”的版本：比如你做 RN/Flutter 本地数据缓存时，最常用的表设计、分页、模糊搜索、迁移（schema version）怎么做，以及 CLI 如何配合你调试这些表。你只要告诉我你偏向 RN 还是 Flutter，以及准备存哪类数据（用户信息/帖子/消息/离线缓存等）。
