# 🌌 Aetheria Verba

> *"Aetheria" a Latin word signifies "Ethereal" and "Verba" that signifies "words" *

**Aetheria Verba** is an independent, minimalist digital journal built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**. It features a modern, clean UI with dark mode support, category filtering, instant client-side search, interactive article modals, local bookmarking, and Markdown content integration.

# 🚧 Site Under Development
---

## What's Being Built?

* **Ethereal Aesthetics & Dark Mode**: Beautiful dark/light theme switching with custom typography and color schemes.
* **Featured Story Hero**: Highlighted lead article with normalized, responsive image containers.
* **Instant Search**: Real-time article searching by title, excerpt, or category.
* **Category Filtering**: Filter entries by tags (*Tech*, *Mandarin*, *Pets*, *Love*, *Science*, *Travel*, *Career*).
* **Bookmarking System**: Save favorite articles locally with persistent `localStorage` support.
* **Interactive Article Modal**: Full-screen modal reader for comfortable distraction-free reading.
* **Markdown-Powered Content**: Article metadata and frontmatter parsing for easy publishing.
* **Responsiveness**: Optimized for desktop, tablet, and mobile displays.
* **Media & Visuals**: Images and visual assets are placeholders sourced from [Unsplash](https://unsplash.com/). All original rights belong to their respective creators.

---

## Tech Stack

* **Framework:** [React 18](https://reactjs.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** [Vercel](https://vercel.com/)

---

## Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/aetheria-verba.git](https://github.com/your-username/aetheria-verba.git)
   cd aetheria-verba


2. **Install dependencies:**
```bash
npm install

```


3. **Start the development server:**
```bash
npm run dev

```


4. Open `http://localhost:5174` (or the port shown in your terminal) in your browser.

---

## Project Structure

```text
aetheria-verba/
├── src/
│   ├── components/         # Reusable UI components (ArticleModal, etc.)
│   ├── content/
│   │   └── articles/       # Markdown (.md) source files for entries
│   ├── data/               # Article data array and frontmatter parser
│   ├── hooks/              # Custom React hooks (useBookmarks, etc.)
│   ├── App.tsx             # Main application layout and state
│   ├── index.css            # Tailwind directives and custom CSS
│   └── main.tsx            # React root entry point
├── public/                 # Static assets
└── package.json

```

---

## ✍️ Adding New Articles

To publish a new story:

1. Add a new `.md` file inside `src/content/articles/` (e.g., `5-my-new-story.md`).
2. Add frontmatter metadata at the top:

```markdown
---
id: "5"
title: "Your Title Here"
excerpt: "A brief summary or preview of the article."
category: "Tech"
date: "Aug 11, 2026"
readTime: "5 min read"
imageUrl: "[https://images.unsplash.com/your-photo-url](https://images.unsplash.com/your-photo-url)"
featured: false
---

Your Markdown content goes here...

```

3. Set `featured: true` on whichever article you want featured on the hero section!

---

## Deployment

This application is configured for seamless deployment on **Vercel**:

1. Push your changes to GitHub.
2. Import your repository into [Vercel](https://vercel.com/).
3. Choose **Vite** as the framework preset.
4. Click **Deploy**.

---

## License

**Written Content & Literary Works**: All  stories, personal reflections, and illustrations are © 2026 **Aetheria Verba**. All rights reserved. Content may not be reproduced, republished, or redistributed without explicit permission.

