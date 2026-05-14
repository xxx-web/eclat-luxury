/**
 * ÉCLAT Node Functions - 订单处理 API
 * 使用 Node.js 运行时，支持更复杂的业务逻辑
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'eclat-secret-key-change-in-production';

// KV 存储客户端（通过 EdgeOne Pages 注入）
// 在 Node Functions 中通过 process.env 访问 KV 绑定

// 验证 JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.replace('Bearer ', '');
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// 统一响应格式
function jsonResponse(data, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
}

// 从 KV 获取所有订单（Node Functions 通过 API 调用 Edge KV）
async function getOrdersFromKV() {
  try {
    const baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const apiRes = await fetch(`${baseUrl}/api/orders/get?_internal=1`, {
      headers: { 'X-Internal-Call': 'true' }
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      return data.orders || [];
    }
  } catch (e) {
    console.error('KV fetch error:', e.message);
  }
  return [];
}

async function saveOrdersToKV(orders) {
  try {
    const baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/orders/get?_internal=1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Call': 'true'
      },
      body: JSON.stringify({ orders })
    });
  } catch (e) {
    console.error('KV save error:', e.message);
  }
}

// ===== 主请求处理器 =====
exports.handler = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  const method = req.method;

  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // ===== POST /node-api/orders/create =====
    if (path === '/node-api/orders/create' && method === 'POST') {
      const user = verifyToken(req);
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ success: false, message: '请先登录' }));
      }

      const body = await parseBody(req);
      const { items, total, address, phone, note } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: '订单商品不能为空' }));
      }

      const order = {
        id: 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5),
        userId: user.userId || user.email,
        items,
        total,
        address: address || '',
        phone: phone || '',
        note: note || '',
        status: 'pending',
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString()
      };

      // 保存订单（通过内部调用 Edge KV API）
      const orders = await getOrdersFromKV();
      orders.push(order);
      await saveOrdersToKV(orders);

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        message: '订单创建成功',
        orderId: order.id,
        order
      }));
    }

    // ===== GET /node-api/orders/user =====
    if (path === '/node-api/orders/user' && method === 'GET') {
      const user = verifyToken(req);
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ success: false, message: '请先登录' }));
      }

      const orders = await getOrdersFromKV();
      const userOrders = orders.filter(o => (o.userId || o.userEmail) === (user.userId || user.email));

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        orders: userOrders
      }));
    }

    // ===== GET /node-api/orders/:id =====
    if (path.match(/^\/node-api\/orders\/[^\/]+$/) && method === 'GET') {
      const user = verifyToken(req);
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ success: false, message: '请先登录' }));
      }

      const orderId = path.split('/').pop();
      const orders = await getOrdersFromKV();
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, message: '订单不存在' }));
      }

      // 检查权限（只能看自己的订单，管理员除外）
      if (order.userId !== (user.userId || user.email) && user.role !== 'admin') {
        res.statusCode = 403;
        return res.end(JSON.stringify({ success: false, message: '无权查看此订单' }));
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, order }));
    }

    // ===== 健康检查 =====
    if (path === '/node-api/health' && method === 'GET') {
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        service: 'ÉCLAT Node Functions',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }));
    }

    // 404
    res.statusCode = 404;
    return res.end(JSON.stringify({ success: false, message: 'Node API 路径不存在' }));

  } catch (error) {
    console.error('Node Function error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }));
  }
};
