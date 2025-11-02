// Simple JavaScript Backend Server (CommonJS - No TypeScript, No ESM required)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const DB_PATH = process.env.DATABASE_URL || './data.db';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const crypto = require('crypto');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Init DB (better-sqlite3 if available, otherwise in-memory fallback)
let db;
let usingMemoryDb = false;
let memory = null; // Make memory accessible outside catch block
try {
  const Database = require('better-sqlite3');
  db = new Database.default ? new Database.default(DB_PATH) : new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  console.log('✅ Database initialized (better-sqlite3)');
} catch (err) {
  usingMemoryDb = true;
  console.warn('⚠️ better-sqlite3 not available, using in-memory storage. Error:', err?.message || err);
  memory = {
    chat_history: [],
    sms_subscriptions: [],
    sms_logs: [],
    users: [], // Added users array
  };
  db = {
    exec: () => {},
    pragma: () => {},
    prepare: (sql) => {
      const lower = String(sql).toLowerCase();
      return {
        run: (...args) => {
          if (lower.startsWith('insert into chat_history')) {
            const [id, user_id, bot_type, message, response] = args;
            memory.chat_history.push({ id, user_id, bot_type, message, response, created_at: new Date().toISOString() });
            return { changes: 1 };
          }
          if (lower.startsWith('insert into sms_subscriptions')) {
            const [id, phone_number, language, subscribed_services] = args;
            const existingIdx = memory.sms_subscriptions.findIndex(s => s.phone_number === phone_number);
            if (existingIdx >= 0) memory.sms_subscriptions.splice(existingIdx, 1);
            memory.sms_subscriptions.push({ id, phone_number, language, subscribed_services, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
            return { changes: 1 };
          }
          if (lower.startsWith('update sms_subscriptions')) {
            const [language, subscribed_services, phone_number] = args;
            const sub = memory.sms_subscriptions.find(s => s.phone_number === phone_number);
            if (sub) {
              sub.language = language;
              sub.subscribed_services = subscribed_services;
              sub.is_active = 1;
              sub.updated_at = new Date().toISOString();
            }
            return { changes: sub ? 1 : 0 };
          }
          if (lower.startsWith('insert into sms_logs')) {
            const [id, phone_number, message, status] = args;
            memory.sms_logs.push({ id, phone_number, message, status, sent_at: new Date().toISOString(), twilio_sid: null, error_message: null });
            return { changes: 1 };
          }
          // Added users insert support
          if (lower.startsWith('insert into users')) {
            const [id, email, password_hash] = args;
            const existing = memory.users.find(u => u.email === email);
            if (existing) {
              const e = new Error('UNIQUE constraint failed: users.email');
              e.code = 'SQLITE_CONSTRAINT';
              throw e;
            }
            memory.users.push({ id, email, password_hash, created_at: new Date().toISOString() });
            return { changes: 1 };
          }
          return { changes: 0 };
        },
        get: (param) => {
          if (lower.startsWith('select * from sms_subscriptions where phone_number')) {
            return memory.sms_subscriptions.find(s => s.phone_number === param) || undefined;
          }
          // Added users select support
          if (lower.includes('select') && lower.includes('from users') && lower.includes('where email')) {
            return memory.users.find(u => u.email === param) || undefined;
          }
          return undefined;
        },
        all: (limit) => {
          if (lower.startsWith('select id, phone_number, language')) {
            const rows = memory.sms_subscriptions.filter(s => s.is_active).sort((a,b) => (b.created_at || '').localeCompare(a.created_at || ''));
            return rows.slice(0, Number(limit) || rows.length);
          }
          if (lower.startsWith('select * from sms_logs')) {
            const rows = [...memory.sms_logs].sort((a,b) => (b.sent_at || '').localeCompare(a.sent_at || ''));
            return rows.slice(0, Number(limit) || rows.length);
          }
          return [];
        }
      };
    }
  };
  console.log('✅ In-memory database initialized');
}

// Chat History Table
db.exec(`
  create table if not exists chat_history (
    id text primary key,
    user_id text not null,
    bot_type text not null,
    message text not null,
    response text not null,
    created_at text default (datetime('now'))
  );
`);

// Users Table
db.exec(`
  create table if not exists users (
    id text primary key,
    email text unique not null,
    password_hash text not null,
    created_at text default (datetime('now'))
  );
`);

// SMS Subscriptions Table
db.exec(`
  create table if not exists sms_subscriptions (
    id text primary key,
    phone_number text unique not null,
    language text default 'en',
    subscribed_services text,
    is_active integer default 1,
    created_at text default (datetime('now')),
    updated_at text default (datetime('now'))
  );
`);

// SMS Logs Table
db.exec(`
  create table if not exists sms_logs (
    id text primary key,
    phone_number text not null,
    message text not null,
    status text,
    sent_at text default (datetime('now')),
    twilio_sid text,
    error_message text
  );
`);

// For real DB this message already printed above

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Simple password hashing using scrypt
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  const check = crypto.scryptSync(password, salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

function generateToken(user) {
  // Minimal JWT using HMAC-SHA256 (no external deps)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, iat: Math.floor(Date.now()/1000) })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  const [header, payload, signature] = String(token || '').split('.');
  if (!header || !payload || !signature) return null;
  const data = `${header}.${payload}`;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return null; }
}

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const password_hash = hashPassword(password);
  try {
    if (!usingMemoryDb) {
      db.prepare('insert into users (id, email, password_hash) values (?, ?, ?)').run(id, email, password_hash);
    } else {
      const existing = db.prepare('select * from users where email = ?').get?.(email);
      if (existing) return res.status(409).json({ error: 'email already exists' });
      db.prepare('insert into users (id, email, password_hash) values (?, ?, ?)').run(id, email, password_hash);
    }
    const token = generateToken({ id, email });
    return res.json({ token, user: { id, email } });
  } catch (e) {
    const msg = (e && e.message || '').toLowerCase();
    if (msg.includes('unique') || msg.includes('constraint')) return res.status(409).json({ error: 'email already exists' });
    return res.status(500).json({ error: 'signup failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const row = db.prepare('select id, email, password_hash from users where email = ?').get(email);
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    const ok = verifyPassword(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = generateToken({ id: row.id, email: row.email });
    return res.json({ token, user: { id: row.id, email: row.email } });
  } catch (e) {
    return res.status(500).json({ error: 'login failed' });
  }
});

// Google OAuth endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, email, name, picture, access_token } = req.body || {};
    
    // Method 1: Google ID Token (credential)
    if (credential) {
      try {
        // Verify Google ID token with Google's API
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!verifyRes.ok) throw new Error('Invalid Google token');
        const userInfo = await verifyRes.json();
        const email = userInfo.email;
        if (!email) return res.status(400).json({ error: 'Email not found in Google token' });
        
        // Find or create user
        let user = db.prepare('select id, email from users where email = ?').get(email);
        if (!user) {
          const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          const password_hash = hashPassword(crypto.randomBytes(16).toString('hex')); // Random password for Google users
          try {
            if (!usingMemoryDb) {
              db.prepare('insert into users (id, email, password_hash) values (?, ?, ?)').run(id, email, password_hash);
            } else {
              // Check if user already exists in memory
              const existing = memory.users.find(u => u.email === email);
              if (existing) {
                user = { id: existing.id, email: existing.email };
              } else {
                memory.users.push({ id, email, password_hash, created_at: new Date().toISOString() });
              }
            }
            if (!user) {
              user = db.prepare('select id, email from users where email = ?').get(email) || { id, email };
            }
          } catch (e) {
            // User might have been created by another request
            user = db.prepare('select id, email from users where email = ?').get(email);
            if (!user) {
              console.error('Failed to create/find user:', e);
              throw e;
            }
          }
        }
        
        const token = generateToken({ id: user.id, email: user.email });
        return res.json({ token, user: { id: user.id, email: user.email } });
      } catch (e) {
        console.error('Google token verification error:', e);
        return res.status(401).json({ error: 'Invalid Google token' });
      }
    }
    
    // Method 2: Access token (for OAuth2 flow)
    if (access_token && email) {
      // Verify access token by fetching user info
      try {
        const userRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
        if (!userRes.ok) throw new Error('Invalid access token');
        const googleUser = await userRes.json();
        
        if (googleUser.email !== email) {
          return res.status(400).json({ error: 'Email mismatch' });
        }
        
        // Find or create user
        let user = db.prepare('select id, email from users where email = ?').get(email);
        if (!user) {
          const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          const password_hash = hashPassword(crypto.randomBytes(16).toString('hex'));
          try {
            if (!usingMemoryDb) {
              db.prepare('insert into users (id, email, password_hash) values (?, ?, ?)').run(id, email, password_hash);
            } else {
              // Check if user already exists in memory
              const existing = memory.users.find(u => u.email === email);
              if (existing) {
                user = { id: existing.id, email: existing.email };
              } else {
                memory.users.push({ id, email, password_hash, created_at: new Date().toISOString() });
              }
            }
            if (!user) {
              user = db.prepare('select id, email from users where email = ?').get(email) || { id, email };
            }
          } catch (e) {
            user = db.prepare('select id, email from users where email = ?').get(email);
            if (!user) {
              console.error('Failed to create/find user:', e);
              throw e;
            }
          }
        }
        
        const token = generateToken({ id: user.id, email: user.email });
        return res.json({ token, user: { id: user.id, email: user.email } });
      } catch (e) {
        console.error('Google OAuth verification error:', e);
        return res.status(401).json({ error: 'Invalid Google access token' });
      }
    }
    
    return res.status(400).json({ error: 'Missing credential or email' });
  } catch (e) {
    console.error('Google auth error:', e);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'unauthorized' });
  req.user = payload;
  next();
}

// Chat logs
app.post('/api/chatlogs', (req, res) => {
  try {
    const { user_id, bot_type, message, response } = req.body || {};
    if (!user_id || !bot_type || !message || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const stmt = db.prepare(
      'insert into chat_history (id, user_id, bot_type, message, response) values (?, ?, ?, ?, ?)'
    );
    stmt.run(id, user_id, bot_type, message, response);
    return res.json({ id });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to save log' });
  }
});

// Places API proxy
app.get('/api/places/nearby', async (req, res) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
    }
    const { lat, lng, radius = '5000', type = 'doctor', keyword } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat,lng required' });
    const qs = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: String(radius),
      type: String(type),
      key: GOOGLE_MAPS_API_KEY,
    });
    if (keyword) qs.set('keyword', keyword);
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${qs.toString()}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data?.status && data.status !== 'OK') {
      console.warn('Places API status:', data.status, data.error_message);
    }
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Places proxy failed' });
  }
});

// Helper: Format phone number
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
};

// SMS MOCK ROUTES
console.log('📱 Using MOCK SMS routes (Twilio packages not installed)');

// POST /api/sms/subscribe
app.post('/api/sms/subscribe', (req, res) => {
  try {
    const { phoneNumber, language = 'en', services = [] } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const servicesJson = JSON.stringify(services);

    // Check if already subscribed
    const existing = db.prepare('select * from sms_subscriptions where phone_number = ?').get(formattedPhone);

    if (existing) {
      // Update existing subscription
      db.prepare(`
        update sms_subscriptions 
        set language = ?, subscribed_services = ?, is_active = 1, updated_at = datetime('now')
        where phone_number = ?
      `).run(language, servicesJson, formattedPhone);

      console.log(`✅ Updated subscription for ${formattedPhone}`);
      
      return res.json({ 
        success: true, 
        message: 'Subscription updated successfully (MOCK MODE)',
        phoneNumber: formattedPhone,
        mock: true
      });
    }

    // Create new subscription
    db.prepare(`
      insert into sms_subscriptions (id, phone_number, language, subscribed_services)
      values (?, ?, ?, ?)
    `).run(id, formattedPhone, language, servicesJson);

    // Mock SMS sending (log instead)
    const welcomeMessage = language === 'hi' 
      ? `🩺 ArogyaAI में आपका स्वागत है! आपने सफलतापूर्वक स्वास्थ्य अलर्ट के लिए सदस्यता ले ली है।`
      : `🩺 Welcome to ArogyaAI! You've successfully subscribed to health alerts.`;

    console.log(`📱 MOCK SMS to ${formattedPhone}:`);
    console.log(`   ${welcomeMessage}`);

    // Log to database
    const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    db.prepare(`
      insert into sms_logs (id, phone_number, message, status)
      values (?, ?, ?, ?)
    `).run(logId, formattedPhone, welcomeMessage, 'mock_sent');

    return res.json({ 
      success: true, 
      message: 'Successfully subscribed! (MOCK MODE - Install twilio for real SMS)',
      phoneNumber: formattedPhone,
      mock: true
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to subscribe' });
  }
});

// GET /api/sms/subscribers
app.get('/api/sms/subscribers', (req, res) => {
  try {
    const subscribers = db.prepare(`
      select id, phone_number, language, subscribed_services, created_at
      from sms_subscriptions
      where is_active = 1
      order by created_at desc
    `).all();

    return res.json({ 
      success: true, 
      count: subscribers.length,
      subscribers,
      mock: true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch subscribers' });
  }
});

// GET /api/sms/logs
app.get('/api/sms/logs', (req, res) => {
  try {
    const { limit = '50' } = req.query;
    const logs = db.prepare(`
      select * from sms_logs
      order by sent_at desc
      limit ?
    `).all(Number(limit));

    return res.json({ 
      success: true, 
      count: logs.length,
      logs,
      mock: true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch logs' });
  }
});

// GET /api/whatsapp/qr - Generate QR Code (SVG)
app.get('/api/whatsapp/qr', (req, res) => {
  try {
    const { phone = '+918882183479' } = req.query;
    const message = encodeURIComponent('Hello ArogyaAI! I want to start using your health services.');
    const whatsappUrl = `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${message}`;

    // Create a simple SVG QR code placeholder
    const svgQR = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
  <rect width="400" height="480" fill="#f0f0f0"/>
  <rect x="50" y="50" width="300" height="300" fill="white" stroke="#333" stroke-width="2"/>
  
  <!-- QR Code Pattern Simulation -->
  <g fill="#000">
    <!-- Top-left finder pattern -->
    <rect x="70" y="70" width="70" height="70"/>
    <rect x="85" y="85" width="40" height="40" fill="white"/>
    <rect x="95" y="95" width="20" height="20"/>
    
    <!-- Top-right finder pattern -->
    <rect x="260" y="70" width="70" height="70"/>
    <rect x="275" y="85" width="40" height="40" fill="white"/>
    <rect x="285" y="95" width="20" height="20"/>
    
    <!-- Bottom-left finder pattern -->
    <rect x="70" y="260" width="70" height="70"/>
    <rect x="85" y="275" width="40" height="40" fill="white"/>
    <rect x="95" y="285" width="20" height="20"/>
    
    <!-- Data modules (simulated pattern) -->
    <rect x="160" y="80" width="15" height="15"/>
    <rect x="180" y="80" width="15" height="15"/>
    <rect x="160" y="100" width="15" height="15"/>
    <rect x="200" y="100" width="15" height="15"/>
    <rect x="220" y="100" width="15" height="15"/>
    <rect x="160" y="120" width="15" height="15"/>
    <rect x="180" y="140" width="15" height="15"/>
    <rect x="200" y="140" width="15" height="15"/>
    <rect x="160" y="160" width="15" height="15"/>
    <rect x="200" y="160" width="15" height="15"/>
    <rect x="220" y="160" width="15" height="15"/>
    <rect x="180" y="180" width="15" height="15"/>
    <rect x="160" y="200" width="15" height="15"/>
    <rect x="200" y="200" width="15" height="15"/>
    <rect x="180" y="220" width="15" height="15"/>
    <rect x="220" y="220" width="15" height="15"/>
  </g>
  
  <text x="200" y="380" text-anchor="middle" font-family="Arial" font-size="16" fill="#25D366" font-weight="bold">
    WhatsApp QR Code
  </text>
  <text x="200" y="405" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
    Scan to chat on WhatsApp
  </text>
  <text x="200" y="430" text-anchor="middle" font-family="Arial" font-size="12" fill="#25D366">
    +91 888 218 3479
  </text>
  <text x="200" y="450" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
    Or click "Start WhatsApp Chat" button
  </text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(svgQR);
  } catch (error) {
    console.error('QR Code generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate QR code' });
  }
});

// POST /api/whatsapp/send
app.post('/api/whatsapp/send', (req, res) => {
  const { phoneNumber, message } = req.body;
  console.log(`💬 MOCK WhatsApp to ${phoneNumber}: ${message}`);
  return res.json({ 
    success: true, 
    message: 'WhatsApp message logged (MOCK MODE)',
    mock: true
  });
});

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Backend listening on http://localhost:' + PORT);
  console.log('📊 Database: ' + DB_PATH);
  console.log('📱 SMS/WhatsApp: MOCK MODE (Real Twilio not configured)');
  console.log('✅ Server ready! Open http://localhost:5173/whatsapp-sms');
  console.log('========================================');
});

