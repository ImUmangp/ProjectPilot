# Idea Tool

A modern web application for generating and managing ideas using AI. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Authentication with Supabase Auth
- 🎨 Modern dark theme UI
- 🤖 AI-powered idea generation using Google Gemini
- 💾 Save and manage generated ideas
- 👤 User profile management
- 📱 Responsive design

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth)
- **AI:** Google Gemini
- **Styling:** Tailwind CSS, HeadlessUI
- **Icons:** Heroicons

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd structured-idea-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Setup

Run the following SQL in your Supabase SQL editor to set up the required tables:

```sql
-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    user_id uuid unique references auth.users on delete cascade,
    username text unique,
    display_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Set up RLS policies
create policy "Users can view their own profile"
    on public.profiles for select
    using ( auth.uid() = user_id );

create policy "Users can update their own profile"
    on public.profiles for update
    using ( auth.uid() = user_id );

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check ( auth.uid() = user_id );
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
