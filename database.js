const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'laundry.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 删除旧表（如果存在）
  db.run(`DROP TABLE IF EXISTS recharge_records`);
  db.run(`DROP TABLE IF EXISTS consumption_records`);
  
  // 创建会员表
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    balance REAL DEFAULT 0,
    wash_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 创建充值记录表（添加会员姓名和手机号字段）
  db.run(`CREATE TABLE IF NOT EXISTS recharge_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    member_name TEXT NOT NULL,
    member_phone TEXT NOT NULL,
    amount REAL NOT NULL,
    wash_count INTEGER DEFAULT 0,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 创建消费记录表（添加会员姓名和手机号字段）
  db.run(`CREATE TABLE IF NOT EXISTS consumption_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    member_name TEXT NOT NULL,
    member_phone TEXT NOT NULL,
    amount REAL DEFAULT 0,
    wash_count INTEGER DEFAULT 0,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('数据库表创建成功');
});

module.exports = db;