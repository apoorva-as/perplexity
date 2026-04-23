# 🚀 Perplexity AI Clone  

An advanced **AI-powered answer engine** inspired by Perplexity AI, designed to deliver **real-time, context-aware responses** by combining LLM reasoning with live web search.  

This project mimics modern AI search systems — understanding queries, fetching real-time data, and generating structured answers in a conversational interface.  

---

## ✨ Features  

- 🤖 AI-powered conversational interface  
- 🌐 Real-time web search using Tavily API  
- 🧠 Context-aware responses with LangChain + LangGraph agents  
- 💬 Persistent chat history (MongoDB)  
- ⚡ Real-time communication using Socket.IO  
- 🔐 Secure authentication (JWT + HTTP-only cookies)  
- 🧾 Markdown-rendered responses (code, lists, formatting)  
- 🎨 Fully responsive UI with Tailwind CSS  

---

## 🧠 How It Works  

1. User sends a query from the frontend  
2. Backend processes it using LangChain agent workflows  
3. Agent decides whether to:  
   - Use LLM (Mistral)  
   - Or fetch real-time data via Tavily API  
4. Response is generated using context + external data  
5. Sent back in real-time via Socket.IO  

---

## 🛠️ Tech Stack  

### Frontend  
- React 19 + Vite  
- Tailwind CSS  
- Redux Toolkit  
- React Router  
- Axios  
- React Markdown  

### Backend  
- Node.js  
- Express 5  
- MongoDB + Mongoose  
- Socket.IO  

### AI & Integrations  
- LangChain  
- LangGraph  
- Mistral  
- Tavily API  

---
## Setup Backend
cd backend
npm install
npm run dev

## Setup Frontend
cd frontend
npm install
npm run dev
🔑 Environment Variables

Create a .env file in the backend folder:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
MISTRAL_API_KEY=your_key
TAVILY_API_KEY=your_key

## 📂 Project Structure 
perplexity/
│── frontend/ # React UI
│── backend/ # Express API + AI logic
│── README.md


## Future Improvements
🔎 Add source citations like Perplexity AI
🧠 Improve multi-turn conversation memory
📊 Add analytics dashboard
🌙 Dark/Light mode
📱 Enhance mobile responsiveness
🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!


---
