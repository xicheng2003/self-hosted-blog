# AuraDawn Blog

A minimalist, self-hosted blog platform built with Next.js 15+, Tailwind CSS, and Prisma. Designed with a focus on typography and a "magazine" aesthetic.

![Project Preview](public/preview.png) 
*(Note: Add a screenshot of your homepage here)*

## ✨ Features

- **Minimalist Design**: Clean, typography-focused interface using `Noto Serif SC` and `Geist Sans`.
- **Markdown Support**: Write posts in Markdown with GFM support, syntax highlighting (`highlight.js`), and custom components.
- **Media Cards**: Automatic rich link previews for external URLs within posts.
- **Admin Dashboard**: 
  - Rich text editor (Tiptap) for writing and editing posts.
  - Image upload support (S3/MinIO compatible).
  - Post management (Publish/Unpublish, Tags, Categories).
- **SEO Optimized**: Built-in sitemap, robots.txt, and dynamic metadata.
- **Responsive**: Fully responsive layout for mobile and desktop.
- **Dark Mode**: (Optional/Configurable) System-aware theme support.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: `react-markdown`, `remark-gfm`, `rehype-highlight`
- **Storage**: AWS SDK v3 (S3 compatible)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Local or Cloud like Supabase/Neon)
- S3-compatible storage (MinIO, AWS S3, R2, etc.)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/self_host_blog.git
    cd self_host_blog
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with the following variables:

    ```env
    # Database (Prisma)
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
    DIRECT_URL="postgresql://user:password@localhost:5432/mydb?schema=public" # If using Supabase

    # Authentication (NextAuth)
    AUTH_SECRET="your-random-secret-key" # Generate with: npx auth secret

    # Object Storage (S3/MinIO)
    S3_ENDPOINT="http://localhost:9000"
    S3_ACCESS_KEY_ID="your-access-key"
    S3_SECRET_ACCESS_KEY="your-secret-key"
    S3_BUCKET_NAME="blog-images"
    S3_REGION="us-east-1"
    ```

4.  **Database Setup**
    Push the schema to your database:
    ```bash
    npx prisma db push
    ```
    *(Optional) Seed the database with initial data:*
    ```bash
    npx prisma db seed
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📂 Project Structure

```
├── app/                # Next.js App Router pages and API routes
│   ├── admin/          # Admin dashboard routes
│   ├── api/            # Backend API endpoints
│   ├── posts/          # Public post list and detail pages
│   ├── globals.css     # Global styles and Tailwind directives
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable React components
│   ├── ui/             # UI primitives (buttons, inputs, etc.)
│   └── media-card.tsx  # Custom link preview component
├── lib/                # Utility functions and configurations
│   ├── prisma.ts       # Prisma client instance
│   └── utils.ts        # Helper functions
├── prisma/             # Database schema and seed scripts
└── public/             # Static assets
```

## 🎨 Customization

### Fonts
The project uses `next/font` to load **Geist Sans** (sans-serif) and **Noto Serif SC** (serif). You can modify these in `app/layout.tsx`.

### Colors & Styling
Global styles are defined in `app/globals.css`. The project uses Tailwind CSS variables for theming.
- **Serif Font**: Used for headings and article content to give a "magazine" feel.
- **Sans Font**: Used for UI elements, metadata, and navigation.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
