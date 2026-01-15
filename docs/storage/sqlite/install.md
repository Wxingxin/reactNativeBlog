好，这个是**Mac 上非常实用、而且你以后做后端 / 移动端 / 本地工具都会反复用到的基础技能**。我按**“装 → 验证 → 用 → 常见坑”**给你一次讲清楚。

---

## 一、用 Homebrew 安装 SQLite

### 1️⃣ 确认你有 brew

```bash
brew --version
```

如果没有：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### 2️⃣ 安装 sqlite

```bash
brew install sqlite
```

安装完成后，brew 会提示类似：

```
sqlite is keg-only
```

这是 **重点**，下面解释。

---

## 二、确认 sqlite 是否安装成功

### 1️⃣ 查看版本

```bash
sqlite3 --version
```

如果能看到版本号，例如：

```
3.45.1 2024-01-01 ...
```

✅ 安装成功

---

## 三、如果提示 `command not found: sqlite3`

这是 **macOS + brew 的常见坑**，原因是：

> **macOS 自带一个旧 sqlite，brew 装的是新版，但没有自动加入 PATH**

### ✅ 解决方法（推荐）

```bash
brew info sqlite
```

你会看到类似：

```
sqlite is keg-only
To use sqlite:
  echo 'export PATH="/opt/homebrew/opt/sqlite/bin:$PATH"' >> ~/.zshrc
```

执行它 👇

```bash
echo 'export PATH="/opt/homebrew/opt/sqlite/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

再试：

```bash
sqlite3 --version
```

---

## 四、SQLite 基础使用（你一定要会）

### 1️⃣ 进入 sqlite（创建或打开数据库）

```bash
sqlite3 test.db
```

> 📌 如果文件不存在 → 自动创建
> 📌 如果存在 → 打开

看到：

```
SQLite version 3.xx.x
sqlite>
```

说明你已经进入 **SQLite Shell**

推出终端
```bash
.exit
```

---

### 2️⃣ 常用命令（⚠️ 必背）

| 命令                | 作用       |
| ----------------- | -------- |
| `.help`           | 查看所有命令   |
| `.tables`         | 查看表      |
| `.schema 表名`      | 查看建表 SQL |
| `.exit` / `.quit` | 退出       |
| `.headers on`     | 显示列名     |
| `.mode column`    | 列对齐显示    |

推荐你一开始就敲：

```sql
.headers on
.mode column
```

---

## 五、完整使用示例（非常重要）

### 1️⃣ 创建表

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER
);
```

---

### 2️⃣ 插入数据

```sql
INSERT INTO users (name, age) VALUES ('Alice', 20);
INSERT INTO users (name, age) VALUES ('Bob', 25);
```

---

### 3️⃣ 查询数据

```sql
SELECT * FROM users;
```

输出类似：

```
id  name   age
--  -----  ---
1   Alice  20
2   Bob    25
```

---

### 4️⃣ 条件查询

```sql
SELECT * FROM users WHERE age > 20;
```

---

### 5️⃣ 删除 / 更新

```sql
UPDATE users SET age = 30 WHERE name = 'Alice';
DELETE FROM users WHERE name = 'Bob';
```

---

## 六、SQLite 文件在哪？

你在哪个目录执行：

```bash
sqlite3 test.db
```

数据库文件 **就在哪个目录**。

查看：

```bash
ls *.db
```

---

## 七、开发中 SQLite 的真实用途（给你方向）

你以后会在这些地方用 SQLite：

### ✅ 后端

* Express / NestJS 本地开发
* 小型项目 / demo
* CLI 工具的数据存储

### ✅ 移动端

* Flutter（`sqflite`）
* React Native（`react-native-sqlite-storage`）

### ✅ 学习 SQL

* 最适合练 `SELECT / JOIN / INDEX`

---

## 八、你现在该怎么练（别跳）

👉 **3 个必须练的任务：**

1. 用 sqlite 创建一个 `todo.db`
2. 建 `todos` 表（id / title / completed）
3. 用 `SELECT / UPDATE / DELETE` 操作它

如果你愿意，下一步我可以直接带你：

* 🧠 **SQLite + Node.js（原生 / better-sqlite3）**
* 🧠 **SQLite vs MySQL / PostgreSQL 本质区别**
* 🧠 **SQLite 设计表结构的正确姿势**

你选一个，我直接给你实战级讲解。
