-- Create storage buckets for content and course thumbnails
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('courses', 'courses', true)
on conflict (id) do nothing;

-- Storage policies: public read, admin write/manage for both buckets
drop policy if exists "Public can read objects (content/courses)" on storage.objects;
create policy "Public can read objects (content/courses)"
  on storage.objects for select
  using (bucket_id in ('content','courses'));

drop policy if exists "Admins can manage content bucket" on storage.objects;
create policy "Admins can manage content bucket"
  on storage.objects for all
  using (
    bucket_id = 'content' and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );

-- INSERT requires a WITH CHECK policy; USING is ignored on INSERT
drop policy if exists "Admins can upload to content bucket" on storage.objects;
create policy "Admins can upload to content bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'content' and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );

drop policy if exists "Admins can manage courses bucket" on storage.objects;
create policy "Admins can manage courses bucket"
  on storage.objects for all
  using (
    bucket_id = 'courses' and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );

-- INSERT requires a WITH CHECK policy; USING is ignored on INSERT
drop policy if exists "Admins can upload to courses bucket" on storage.objects;
create policy "Admins can upload to courses bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'courses' and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );

-- Create content table
create table if not exists content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  type text not null check (type in ('video','audio','image','blog')),
  file_url text,
  file_path text,
  transcription text,
  duration integer,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure required columns exist if the table was created earlier without them
alter table content add column if not exists file_path text;
alter table content add column if not exists created_by uuid references auth.users(id) on delete cascade;
alter table content add column if not exists duration integer;

-- Enable RLS
alter table content enable row level security;

-- Policies
drop policy if exists "Public can view content" on content;
create policy "Public can view content"
  on content for select
  using (true);

drop policy if exists "Admins can insert content" on content;
create policy "Admins can insert content"
  on content for insert
  with check ((auth.jwt() ->> 'email' like '%@alumno.buap.mx'));

drop policy if exists "Admins can update own content" on content;
create policy "Admins can update own content"
  on content for update
  using (created_by = auth.uid() and (auth.jwt() ->> 'email' like '%@alumno.buap.mx'));

drop policy if exists "Admins can delete own content" on content;
create policy "Admins can delete own content"
  on content for delete
  using (created_by = auth.uid() and (auth.jwt() ->> 'email' like '%@alumno.buap.mx'));

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_content_updated_at on content;
create trigger update_content_updated_at
  before update on content
  for each row
  execute function update_updated_at_column();

-- Many-to-many: link content to courses
create table if not exists course_content (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade,
  content_id uuid references content(id) on delete cascade,
  order_index integer default 0,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course_id, content_id)
);

alter table course_content enable row level security;

-- Policies for course_content
drop policy if exists "Public can view course-content on active courses" on course_content;
create policy "Public can view course-content on active courses"
  on course_content for select
  using (
    exists (
      select 1 from courses
      where courses.id = course_content.course_id
      and courses.is_active = true
    )
  );

drop policy if exists "Admins can link content to own courses" on course_content;
create policy "Admins can link content to own courses"
  on course_content for insert
  with check (
    exists (
      select 1 from courses
      where courses.id = course_content.course_id
      and courses.created_by = auth.uid()
    ) and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );

drop policy if exists "Admins can manage links on own courses" on course_content;
create policy "Admins can manage links on own courses"
  on course_content for update using (
    exists (
      select 1 from courses
      where courses.id = course_content.course_id
      and courses.created_by = auth.uid()
    ) and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  )
  with check (
    exists (
      select 1 from courses
      where courses.id = course_content.course_id
      and courses.created_by = auth.uid()
    ) and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );

drop policy if exists "Admins can unlink content from own courses" on course_content;
create policy "Admins can unlink content from own courses"
  on course_content for delete using (
    exists (
      select 1 from courses
      where courses.id = course_content.course_id
      and courses.created_by = auth.uid()
    ) and (auth.jwt() ->> 'email' like '%@alumno.buap.mx')
  );
