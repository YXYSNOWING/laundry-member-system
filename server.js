const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/members/:id', (req, res) => {
  db.get('SELECT * FROM members WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '会员不存在' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/members', (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: '姓名和电话不能为空' });
    return;
  }

  db.run('INSERT INTO members (name, phone) VALUES (?, ?)', [name, phone], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, phone, balance: 0, wash_count: 0 });
  });
});

app.put('/api/members/:id', (req, res) => {
  const { name, phone } = req.body;
  db.run('UPDATE members SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
    [name, phone, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '更新成功' });
  });
});

app.delete('/api/members/:id', (req, res) => {
  db.run('DELETE FROM members WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '删除成功' });
  });
});

app.post('/api/members/:id/recharge', (req, res) => {
  const { amount, wash_count, remark } = req.body;
  const memberId = req.params.id;

  db.serialize(() => {
    // 先获取会员信息
    db.get('SELECT name, phone FROM members WHERE id = ?', [memberId], (err, member) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!member) {
        res.status(404).json({ error: '会员不存在' });
        return;
      }

      db.run('BEGIN TRANSACTION');
      
      db.run('INSERT INTO recharge_records (member_id, member_name, member_phone, amount, wash_count, remark) VALUES (?, ?, ?, ?, ?, ?)',
        [memberId, member.name, member.phone, amount || 0, wash_count || 0, remark || ''], function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }
      });

      db.run('UPDATE members SET balance = balance + ?, wash_count = wash_count + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [amount || 0, wash_count || 0, memberId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }
        db.run('COMMIT');
        res.json({ message: '充值成功' });
      });
    });
  });
});

app.post('/api/members/:id/consume', (req, res) => {
  const { amount, wash_count, remark } = req.body;
  const memberId = req.params.id;

  db.serialize(() => {
    // 先获取会员信息
    db.get('SELECT name, phone FROM members WHERE id = ?', [memberId], (err, member) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!member) {
        res.status(404).json({ error: '会员不存在' });
        return;
      }

      db.run('BEGIN TRANSACTION');
      
      db.run('INSERT INTO consumption_records (member_id, member_name, member_phone, amount, wash_count, remark) VALUES (?, ?, ?, ?, ?, ?)',
        [memberId, member.name, member.phone, amount || 0, wash_count || 0, remark || ''], function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }
      });

      db.run('UPDATE members SET balance = balance - ?, wash_count = wash_count - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [amount || 0, wash_count || 0, memberId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }
        db.run('COMMIT');
        res.json({ message: '消费成功' });
      });
    });
  });
});

app.get('/api/members/:id/recharge-records', (req, res) => {
  db.all('SELECT * FROM recharge_records WHERE member_id = ? ORDER BY created_at DESC', 
    [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/members/:id/consumption-records', (req, res) => {
  db.all('SELECT * FROM consumption_records WHERE member_id = ? ORDER BY created_at DESC', 
    [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取所有充值记录
app.get('/api/recharge-records', (req, res) => {
  db.all('SELECT * FROM recharge_records ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取所有消费记录
app.get('/api/consumption-records', (req, res) => {
  db.all('SELECT * FROM consumption_records ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/statistics', (req, res) => {
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM members) as total_members,
      (SELECT SUM(balance) FROM members) as total_balance,
      (SELECT SUM(wash_count) FROM members) as total_wash_count,
      (SELECT COUNT(*) FROM recharge_records) as total_recharge_records,
      (SELECT COUNT(*) FROM consumption_records) as total_consumption_records,
      (SELECT SUM(amount) FROM recharge_records) as total_recharge_amount,
      (SELECT SUM(amount) FROM consumption_records) as total_consumption_amount
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows[0]);
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});