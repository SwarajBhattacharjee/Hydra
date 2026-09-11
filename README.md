# 💧 Hydra — Hydration Companion with Personality

<div align="center">

![Hydra Banner](https://img.shields.io/badge/Hydra-Smart%20Hydration%20Companion-0284c7?style=for-the-badge&logo=droplet&logoColor=white)

**A witty, gamified hydration tracker that nudges you to drink water via Mail, SMS, and Push notifications — featuring customizable mascot personalities!**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](#license)

[Features](#-key-features) • [Notification Channels](#-multi-channel-notifications) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Deployment](#-deployment)

</div>

---

## 🌟 Overview

**Hydra** turns hydration into an engaging, habit-forming experience. Forget boring reminder popups — Hydra pairs an interactive animated mascot with flexible notification channels (**Email**, **SMS Phone**, **Web Push**) and funny voice personalities ranging from warm & encouraging to unhinged chaotic emergency alerts!

---

## ✨ Key Features

### 💧 Smart Hydration Tracking & Gamification
- **Animated Liquid Bottle Meter**: Dynamic SVG filling bottle visualizer that reflects your real-time daily hydration progress.
- **Interactive Mascot (Hydro)**: Reacts to your drinking habits with dynamic mood states (`worried`, `flat`, `pleased`, `excited`, `thrilled`, `streak`).
- **Personality Voice Packs**: Choose your mascot's attitude when nagging you:
  - 💖 **Friendly**: Warm, upbeat & supportive reminders.
  - 💪 **Motivational**: High-energy fitness coach vibe.
  - ⚡ **Chaotic**: Unhinged & hilarious emergency alerts.
  - 😒 **Passive-Aggressive**: Cheeky reverse-psychology nagging.
  - 🎭 **Dramatic**: Epic cinematic storytelling (*"THE WATER MUST FLOW"*).
- **Streak & Leveling System**: Earn XP for every sip logged, unlock badges/achievements, and build consecutive day hydration streaks.
- **Friend Mode**: Weave a friend's name into your reminder copy for extra accountability.

---

## 🔔 Multi-Channel Notifications

Hydra ensures you never miss a reminder, no matter what device or browser you use:

| Channel | Provider | Description |
| :--- | :--- | :--- |
| **📧 Mail / Email** | [Resend API](https://resend.com) | Direct HTML email reminders sent to your email inbox. |
| **📱 Phone SMS** | [Twilio API](https://www.twilio.com) | Instant SMS text alerts sent directly to your phone number. |
| **🔔 Web Push** | VAPID / Service Worker | Native browser & mobile lockscreen push notifications. |
| **💻 Local Push** | Web Notification API | Instant in-browser reminder popups. |

*Built-in Dev Mode: In local development or unconfigured API mode, Hydra runs a simulated log dispatcher with full test feedback.*

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database / Cloud**: [Supabase](https://supabase.com/) (Optional cloud sync) + LocalStorage (Offline-first)
- **Push & Email**: `web-push`, Resend REST API, Twilio REST API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SwarajBhattacharjee/Hydra.git
   cd Hydra
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Add your credentials (optional for offline dev mode):
   ```env
   # Web Push VAPID Keys (Generate via `npx web-push generate-vapid-keys`)
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key

   # Email Delivery (Resend)
   RESEND_API_KEY=re_your_resend_key
   EMAIL_FROM=Hydra Hydration <reminders@yourdomain.com>

   # SMS Delivery (Twilio)
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Progressive Web App (PWA) Setup

Hydra is PWA-ready for iOS and Android:
- **iPhone / iOS**: Open Hydra in Safari -> Tap **Share** -> Tap **Add to Home Screen**.
- **Android / Chrome**: Open Hydra in Chrome -> Tap menu -> Tap **Install App**.

---

## 🌐 Deployment

Deploy seamlessly to [Vercel](https://vercel.com/):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSwarajBhattacharjee%2FHydra)

1. Push your repository to GitHub.
2. Import project into Vercel.
3. Add your Environment Variables in Vercel Project Settings (`RESEND_API_KEY`, `TWILIO_*`, etc.).
4. Click **Deploy**.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with 💙 & 💧 to keep you hydrated.</sub>
</div>
