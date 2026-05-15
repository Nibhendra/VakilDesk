<div align="center">
  <img src="assets/officiallogo.png" alt="VakilDesk Logo" width="120" />
  <h1>⚖️ VakilDesk</h1>
  <p><strong>Your Legal Practice, Simplified.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## 🌟 Overview

**VakilDesk** is a modern, production-ready, AI-powered legal practice management application designed specifically for advocates and law firms. It eliminates paperwork and administrative overhead by centralizing case management, client records, and hearing schedules into a single, intuitive mobile platform.

Built with performance and aesthetics in mind, VakilDesk offers a stunning, highly responsive UI with persistent Light/Dark mode, deeply integrated native authentication, and real-time cloud sync.

---

## ✨ Key Features

- 🔐 **Native Authentication:** Seamless integration with Google Sign-In using native Android credentials, alongside traditional Email/Password auth via Firebase.
- 📂 **Case & Client Management:** Create, track, and manage comprehensive client profiles and case documents in real-time.
- 📅 **Hearing Tracker:** Never miss a date. Track upcoming hearings, past proceedings, and daily schedules.
- 🎨 **Dynamic Theming:** Beautiful, user-controlled Light and Dark modes managed globally with persistent state.
- ☁️ **Cloud Synchronization:** Built on Firebase Firestore for instant, real-time data sync across all your devices.
- 🤖 **AI-Powered Insights:** Leverage generative AI to analyze case documents and draft legal responses.

---

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) / [Expo SDK 54](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Auth:** [Firebase v12](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Native Login:** `@react-native-google-signin/google-signin`
- **Forms & Validation:** `react-hook-form` & `zod`
- **Routing:** `expo-router`

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed, along with the Expo CLI.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nibhendra/VakilDesk.git
   cd React_VakilDesk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on `.env.example` and add your Firebase and Google OAuth keys:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
   ```

4. **Start the Development Server:**
   ```bash
   npx expo start --clear
   ```

> **Note:** Because this app uses custom native code for Google Sign-In, testing authentication requires generating a standalone APK (`npx eas-cli build -p android`) or an Expo Development Build instead of using the standard Expo Go app.

---

## 📱 Screenshots

*(Add screenshots here showing the Dashboard, Login Screen, Dark Mode, and Case Management UI)*

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Nibhendra">Nibhendra</a></p>
</div>