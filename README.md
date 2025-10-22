# 🧠 Servoya Cloud Worker

### Overview  
Servoya Cloud Worker is a modern Node.js backend running on **Google Cloud Run**, serving as the automation and AI orchestration layer of the Servoya system.

---

### 🚀 Features  
- Handles HTTP requests and connects with external APIs.  
- Integrated with:
  - **OpenAI API** for AI-powered content generation.  
  - **Supabase** for data storage and authentication.  
- Built on **Express.js** and optimized for scalability on Google Cloud.

---

### 🧩 Tech Stack  
- **Node.js 18+**  
- **Express.js**  
- **Supabase JS SDK**  
- **OpenAI SDK**  
- **Google Cloud Build + Cloud Run**

---

### 🏗️ Deployment  
This service is automatically deployed through **Google Cloud Build** using the configuration file `cloudbuild.yaml`,  
which builds the container image from the `Dockerfile` and deploys it to **Google Cloud Run**.

#### Environment Variables (required)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`

> These variables must be configured in Google Cloud Run under *Environment Variables*.  
> The service will not start without them.

---

### 🌍 Status  
✅ Live on Google Cloud Run  
✅ Synced with GitHub Repository  
🟡 Next: Integrate AI Video Generation + Monetization Modules

---

### 👨‍💻 Author  
**Omer Rahmani**  
Entrepreneur & AI Automation Developer  
📧 [omer@servoya.com](mailto:omer@servoya.com)  
🌐 [https://servoya.com](https://servoya.com)
```0
