# Chat App

**Real-time messaging app with authentication and image sharing.**

A full-stack chat application supporting live one-to-one messaging, user authentication, and image uploads in conversations.

---

## 🚀 What it does

- User signup/login with JWT-based authentication (cookies)
- Real-time messaging via WebSockets (Socket.IO) — messages appear instantly, no polling
- Online/offline user presence
- Image sharing in chat via Cloudinary
- Persistent chat history stored in MongoDB

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, React Router, TailwindCSS + daisyUI |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Media | Cloudinary |

---

## 🏗️ Architecture

```
chat-app/
├── frontend/    # React + Vite — UI, auth pages, chat interface
└── backend/     # Express + Socket.IO — REST API, WebSocket server, auth
```

The backend exposes a REST API for auth and message history, and a Socket.IO server for real-time message delivery and presence. Frontend state (auth session, active chat, online users) is managed with Zustand.

---

## 📄 License

**All rights reserved.**

This project and its source code are proprietary. No part of this repository may be copied, modified, distributed, or used in any form without explicit written permission from the author.

© Safwen Ben Mabrouk

---

## 📬 Contact

**Safwen Ben Mabrouk** — Full-Stack Software Engineer
- Email: safwenbenmabrouk@gmail.com
- LinkedIn: [linkedin.com/in/safwen-ben-mabrouk](https://linkedin.com/in/safwen-ben-mabrouk)
- GitHub: [@Safwen-bm](https://github.com/Safwen-bm)