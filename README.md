# Ace Guevarra — Professional Portfolio

A modern, high-performance portfolio website built to showcase my journey as an Associate System Developer, featuring full-stack projects, workflow automations, and an interactive AI assistant.

## 🚀 Key Features

- **AI Chat Assistant**: Integrated with **Gemini 2.0 Flash** to answer questions about my experience, skills, and technical background in real-time.
- **Dynamic UI**: Theme-aware components, including a custom avatar that switches based on light/dark mode preference.
- **Responsive Design**: Optimized for all devices using **Tailwind CSS** and **Shadcn UI**.
- **Performance**: Built on **Next.js 15** with App Router for optimal speed and SEO.
- **Content-Driven**: Integrated blog and project showcase managed via structured data.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [Magic UI](https://magicui.design/)
- **AI**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini API)
- **Icons**: [Lucide React](https://lucide.dev/), Custom SVGs
- **Deployment**: [Vercel](https://vercel.com/)

## 🏁 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aceguevarra/ace-portfolio.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Configuration**:
   Update your professional details in `src/data/resume.tsx`.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
