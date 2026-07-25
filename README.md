# PlacementTracker 🚀

PlacementTracker is a full-stack placement preparation suite built for SVCE MCA students. It helps students track topic mastery across Data Structures & Algorithms (DSA), Aptitude, and Core Computer Science subjects, attempt practice questions, utilize AI-driven mock interviews, and maintain daily learning streaks.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling:** Tailwind CSS, Lucide Icons
- **Database:** MongoDB Atlas with [Mongoose](https://mongoosejs.com/)
- **Authentication:** NextAuth.js (Google OAuth)
- **Media Management:** Cloudinary API
- **AI Integration:** Groq API (with multi-key rate limit rotation)
- **Deployment:** Vercel + Vercel Cron

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js (v18.x or later)
- MongoDB database instance (local or MongoDB Atlas)

### 2. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/theja8458/preplacementtracker.git
   cd placement-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual environment credentials in `.env`:
   - `MONGODB_URI`: MongoDB connection string
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google Cloud OAuth credentials
   - `NEXTAUTH_SECRET` & `NEXTAUTH_URL`: NextAuth configuration
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary API parameters
   - `GROQ_API_KEY_1` to `GROQ_API_KEY_5`: Groq API keys for AI assistant
   - `CRON_SECRET`: Authorization secret for Vercel Cron endpoints
   - `AI_DAILY_LIMIT`: Maximum daily AI interactions per user (default: 15)

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Seed & Maintenance Scripts

The project includes CLI utility scripts in the `scripts/` directory for database seeding and topic reordering:

- **Seed Foundations:** `npx tsx scripts/seed-foundations.ts`
- **Seed Complete Data:** `npx tsx scripts/seed.ts`
- **Seed Demo Data:** `npx tsx scripts/seed-demo.ts`
- **Reorder Topics:** `npx tsx scripts/reorder-topics.ts`

---

## 🌐 Deployment Notes

- **Hosting:** Primary deployment hosted on **Vercel**.
- **Database:** Hosted on **MongoDB Atlas**.
- **Cron Jobs:** Uses **Vercel Cron** (`/api/cron/streak-warning`) to send daily streak reminders. Ensure `CRON_SECRET` is set in Vercel environment variables.

---

## 🎓 Disclaimer

This software was developed as an academic project for SVCE MCA students. It is an independent project and is not officially affiliated with or endorsed by Sri Venkateswara College of Engineering (SVCE).
