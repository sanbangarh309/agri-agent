# 🌾 AI Agri Advisor (Local LLM)

A full-width, real-time **AI Agriculture Advisor** that helps farmers with:
- Crop planning & seasonal guidance  
- Pest & disease management  
- Irrigation & fertilizer advice  
- Buy/Sell guidance (mandi, FPOs, processors, exporters)  

Runs **100% locally** using **LM Studio** (no OpenAI API key required).  
Supports **streaming responses**, session-based history, and Markdown-formatted output.

---

## ✨ Features

- 🧠 Local LLM via LM Studio (Qwen/Gemma compatible)
- ⚡ Real-time streaming responses (token-by-token)
- 🧾 Markdown-formatted answers (headings, bullets, steps)
- 🧑‍🌾 Location-aware advice
- 💾 Session-based history (local file storage)
- 📐 Full-width UI for long, readable content
- 🔐 No cloud dependency

---

## 🧩 Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Flask (Python)
- **LLM Runtime**: LM Studio (OpenAI-compatible API)
- **Markdown Rendering**: react-markdown + remark-gfm

---

## 📁 Project Structure

```txt
agriAgent/
├── frontend/
│   └── src/AgriAgent.jsx
├── backend/
│   ├── app.py
│   ├── storage.py
│   ├── requirements.txt
│   └── data/            # session history (gitignored)
├── README.md
└── .gitignore
```

## 🔧 Prerequisites
- Node.js 18+
- Python 3.10+
- LM Studio installed

## 🚀 Setup
1️⃣ LM Studio

Install LM Studio: https://lmstudio.ai

Download a model (recommended):

qwen2.5-7b-instruct (best balance)

or google/gemma-3-4b (lighter)

Load the model in LM Studio

Start the Local API Server
Verify - 
```bash
curl http://localhost:1234/v1/models
```