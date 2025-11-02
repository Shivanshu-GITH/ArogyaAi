# ArogyaAI - Health Chatbot Platform

A comprehensive health chatbot platform with multiple AI-powered chatbots, multilingual support, and SMS/WhatsApp integration.

## Features

- ✅ 3 AI Chatbots (General Health, Mental Health, Image/Voice)
- ✅ Multilingual support (8+ languages)
- ✅ Find Doctors (Google Maps integration)
- ✅ SMS & WhatsApp Notifications (Twilio integration)
- ✅ Chat logs stored in SQLite database
- ✅ Real-time health alerts

## Setup

### Backend Setup

1. Create `server/.env`:
```env
PORT=4000
DATABASE_URL=./data.db
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# Twilio (for SMS & WhatsApp) - Optional
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
```

2. Install and run:
```bash
cd server
npm install
node server-simple.cjs
```

### Frontend Setup

1. Create `.env` in project root:
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

2. Install and run:
```bash
npm install
npm run dev
```

## API Endpoints

- `POST /api/chatlogs` - Store chat history
- `GET /api/places/nearby` - Find nearby doctors
- `POST /api/sms/subscribe` - Subscribe to SMS alerts
- `GET /api/whatsapp/qr` - Generate WhatsApp QR code
- `GET /api/health` - Health check

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **AI**: Google Gemini AI
- **Maps**: Google Maps API
- **SMS/WhatsApp**: Twilio (optional)
