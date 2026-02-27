# 洗衣店会员管理系统

一个简单易用的H5洗衣店会员管理系统，支持会员信息管理、充值消费记录和数据统计。

## 功能特性

- 会员信息管理：添加、编辑、删除会员
- 充值功能：支持金额充值和次数充值
- 消费功能：记录会员消费金额和次数
- 记录查询：查看每个会员的充值和消费明细
- 数据统计：查看总会员数、总余额、总次数等统计数据
- 搜索功能：快速查找会员
- 响应式设计：适配手机和电脑端

## 技术栈

- 前端：Vue.js 3（CDN方式引入）
- 后端：Node.js + Express
- 数据库：SQLite

## 项目结构

```
laundry-member-system/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── database.js
│   └── laundry.db（自动生成）
└── frontend/
    └── index.html
```

## 安装步骤

### 1. 安装Node.js

确保已安装Node.js（建议版本14.x或更高）

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 启动后端服务

```bash
npm start
```

后端服务将在 http://localhost:3000 运行

### 4. 打开前端页面

在浏览器中直接打开 `frontend/index.html` 文件，或使用本地服务器打开。

## 使用说明

### 会员管理

1. **添加会员**：点击"添加会员"按钮，输入姓名和电话
2. **编辑会员**：点击会员卡片上的"编辑"按钮修改信息
3. **删除会员**：点击"删除"按钮删除会员（需确认）
4. **搜索会员**：在搜索框中输入姓名或电话进行搜索

### 充值功能

1. 点击会员卡片上的"充值"按钮
2. 输入充值金额（可选）
3. 输入充值次数（可选）
4. 添加备注（可选）
5. 点击"确定"完成充值

### 消费功能

1. 点击会员卡片上的"消费"按钮
2. 输入消费金额（可选）
3. 输入消费次数（默认为1）
4. 添加备注（可选）
5. 点击"确定"完成消费

### 查看记录

1. 点击会员卡片上的"记录"按钮
2. 查看该会员的所有充值和消费记录
3. 记录包含金额、次数、时间和备注信息

### 数据统计

1. 点击顶部"数据统计"标签
2. 查看系统整体统计数据：
   - 总会员数
   - 总余额
   - 总剩余次数
   - 充值统计（记录数和总金额）
   - 消费统计（记录数和总金额）

## API接口

### 会员管理

- `GET /api/members` - 获取所有会员
- `GET /api/members/:id` - 获取单个会员信息
- `POST /api/members` - 创建新会员
- `PUT /api/members/:id` - 更新会员信息
- `DELETE /api/members/:id` - 删除会员

### 充值消费

- `POST /api/members/:id/recharge` - 会员充值
- `POST /api/members/:id/consume` - 会员消费
- `GET /api/members/:id/recharge-records` - 获取充值记录
- `GET /api/members/:id/consumption-records` - 获取消费记录

### 统计

- `GET /api/statistics` - 获取统计数据

## 数据库结构

### members（会员表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 姓名 |
| phone | TEXT | 电话（唯一） |
| balance | REAL | 余额 |
| wash_count | INTEGER | 洗衣次数 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### recharge_records（充值记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| member_id | INTEGER | 会员ID |
| amount | REAL | 充值金额 |
| wash_count | INTEGER | 充值次数 |
| remark | TEXT | 备注 |
| created_at | DATETIME | 创建时间 |

### consumption_records（消费记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| member_id | INTEGER | 会员ID |
| amount | REAL | 消费金额 |
| wash_count | INTEGER | 消费次数 |
| remark | TEXT | 备注 |
| created_at | DATETIME | 创建时间 |

## 注意事项

1. 数据库文件 `laundry.db` 会自动在backend目录下生成
2. 建议定期备份数据库文件
3. 首次运行会自动创建数据库表结构
4. 确保后端服务正常运行后再使用前端页面

## 开发模式

如需开发模式自动重启，可以使用：

```bash
npm run dev
```

## 许可证

MIT