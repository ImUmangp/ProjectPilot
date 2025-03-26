-- Create the profiles table if it doesn't exist
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    user_id uuid unique references auth.users on delete cascade,
    username text unique,
    display_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone
);

-- Create indexes for faster lookups
create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists profiles_display_name_idx on public.profiles(display_name);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
    on public.profiles for select
    using ( auth.uid() = user_id );

create policy "Users can update their own profile"
    on public.profiles for update
    using ( auth.uid() = user_id );

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check ( auth.uid() = user_id );

-- Create function to ensure profile table exists
create or replace function public.ensure_profile_table()
returns void
language plpgsql
security definer
as $$
begin
    -- Create the profile for the user if it doesn't exist
    insert into public.profiles (id, user_id, username, display_name, created_at)
    select 
        auth.uid(),
        auth.uid(),
        (select email from auth.users where id = auth.uid()),
        (select email from auth.users where id = auth.uid()),
        now()
    where not exists (
        select 1 from public.profiles where user_id = auth.uid()
    );
end;
$$; 