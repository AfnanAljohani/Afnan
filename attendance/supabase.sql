-- نظام التحضير الذكي · أكاديمية الطاقة والمياه
-- الصقي هذا الملف كامل في Supabase → SQL Editor → Run
-- كل التحقق (الموقع، وقت المحاضرة، مرة وحدة لكل محاضرة) يصير هنا في السيرفر،
-- فما أحد يقدر يتجاوزه بتعديل الصفحة.

-- ───────── الإعدادات ─────────
create table if not exists settings (
  id               int primary key default 1 check (id = 1),
  lat              double precision not null,
  lng              double precision not null,
  radius_m         int not null,  -- نصف قطر السياج حول الأكاديمية
  max_accuracy_m   int not null,  -- نرفض الموقع إذا دقة GPS أسوأ من كذا
  open_before_min  int not null,  -- يفتح التحضير قبل المحاضرة بكم دقيقة
  close_after_min  int not null,  -- يقفل بعد بداية المحاضرة بكم دقيقة
  late_after_min   int not null   -- بعدها يعتبر متأخر
);

insert into settings values (1, 22.831133, 39.028038, 250, 150, 10, 20, 5)
on conflict (id) do nothing;

-- ───────── جدول المحاضرات (6 محاضرات من 8 الصبح) ─────────
create table if not exists lectures (
  num        int primary key,
  title      text not null,
  starts_at  time not null,
  ends_at    time not null
);

insert into lectures values
  (1, 'المحاضرة الأولى',  '08:00', '08:50'),
  (2, 'المحاضرة الثانية', '09:00', '09:50'),
  (3, 'المحاضرة الثالثة', '10:00', '10:50'),
  (4, 'المحاضرة الرابعة', '11:00', '11:50'),
  (5, 'المحاضرة الخامسة', '12:00', '12:50'),
  (6, 'المحاضرة السادسة', '13:00', '13:50')
on conflict (num) do nothing;

-- ───────── سجل الحضور ─────────
create table if not exists attendance (
  id                  bigint generated always as identity primary key,
  full_name           text not null,
  academic_id         text not null,
  day                 date not null,
  lecture             int  not null references lectures(num),
  checked_in_at       timestamptz not null default now(),
  minutes_from_start  int  not null,
  status              text not null check (status in ('on_time', 'late')),
  distance_m          int  not null,
  device_id           text,
  unique (academic_id, day, lecture),  -- الرقم الأكاديمي مرة وحدة بس لكل محاضرة
  unique (device_id, day, lecture)     -- الجوال الواحد ما يحضّر لشخصين
);

-- الزوار ما يقدرون يقرون أو يكتبون الجداول مباشرة، بس عن طريق الدوال تحت
alter table settings   enable row level security;
alter table lectures   enable row level security;
alter table attendance enable row level security;

drop policy if exists "read settings" on settings;
create policy "read settings" on settings for select using (true);
drop policy if exists "read lectures" on lectures;
create policy "read lectures" on lectures for select using (true);

-- ───────── تسجيل الحضور ─────────
create or replace function check_in(
  p_name text, p_academic_id text,
  p_lat double precision, p_lng double precision, p_accuracy double precision,
  p_device text
) returns json
language plpgsql security definer set search_path = public as $$
declare
  s     settings;
  l     lectures;
  now_r timestamp := now() at time zone 'Asia/Riyadh';
  d     date := now_r::date;
  t     time := now_r::time;
  dist  double precision;
  mins  int;
  rec   attendance;
begin
  select * into s from settings where id = 1;

  p_name := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  p_academic_id := upper(trim(coalesce(p_academic_id, '')));

  if char_length(p_name) < 2 or char_length(p_name) > 80 then
    raise exception 'اكتب اسمك الكامل';
  end if;
  if p_academic_id !~ '^[0-9A-Z-]{3,20}$' then
    raise exception 'الرقم الأكاديمي غير صحيح';
  end if;
  if p_lat is null or p_lng is null then
    raise exception 'لازم تسمح للموقع يوصل لمكانك';
  end if;
  if p_accuracy is null or p_accuracy > s.max_accuracy_m then
    raise exception 'دقة الموقع ضعيفة (% م). شغّل GPS وحاول مرة ثانية', round(coalesce(p_accuracy, 9999));
  end if;

  dist := 2 * 6371000 * asin(sqrt(
            power(sin(radians(p_lat - s.lat) / 2), 2) +
            cos(radians(s.lat)) * cos(radians(p_lat)) *
            power(sin(radians(p_lng - s.lng) / 2), 2)));
  if dist > s.radius_m then
    raise exception 'أنت خارج موقع الأكاديمية (تبعد % م)', round(dist);
  end if;

  select * into l from lectures
   where t between starts_at - make_interval(mins => s.open_before_min)
               and starts_at + make_interval(mins => s.close_after_min)
   order by starts_at limit 1;
  if not found then
    raise exception 'التحضير مقفل الحين. يفتح قبل كل محاضرة بـ % دقائق ويقفل بعد بدايتها بـ % دقيقة',
      s.open_before_min, s.close_after_min;
  end if;

  mins := greatest(0, floor(extract(epoch from (t - l.starts_at)) / 60))::int;

  select * into rec from attendance
   where academic_id = p_academic_id and day = d and lecture = l.num;
  if found then
    return json_build_object('already', true, 'full_name', rec.full_name, 'lecture', l.num,
      'title', l.title, 'checked_in_at', rec.checked_in_at,
      'minutes', rec.minutes_from_start, 'status', rec.status);
  end if;

  begin
    insert into attendance (full_name, academic_id, day, lecture, minutes_from_start,
                            status, distance_m, device_id)
    values (p_name, p_academic_id, d, l.num, mins,
            case when mins > s.late_after_min then 'late' else 'on_time' end,
            round(dist), nullif(p_device, ''))
    returning * into rec;
  exception when unique_violation then
    if sqlerrm like '%device_id%' then
      raise exception 'هذا الجوال سجّل حضور شخص ثاني في هالمحاضرة';
    end if;
    raise exception 'حضورك مسجل من قبل في هالمحاضرة';
  end;

  return json_build_object('already', false, 'full_name', rec.full_name, 'lecture', l.num,
    'title', l.title, 'checked_in_at', rec.checked_in_at,
    'minutes', rec.minutes_from_start, 'status', rec.status);
end $$;

-- ───────── شاشة العرض (بدون الرقم الأكاديمي) ─────────
create or replace function wall(p_day date default null)
returns table (full_name text, lecture int, checked_in_at timestamptz,
               minutes_from_start int, status text)
language sql security definer set search_path = public stable as $$
  select a.full_name, a.lecture, a.checked_in_at, a.minutes_from_start, a.status
    from attendance a
   where a.day = coalesce(p_day, (now() at time zone 'Asia/Riyadh')::date)
   order by a.checked_in_at desc;
$$;

revoke all on function check_in(text, text, double precision, double precision, double precision, text) from public;
revoke all on function wall(date) from public;
grant execute on function check_in(text, text, double precision, double precision, double precision, text) to anon, authenticated;
grant execute on function wall(date) to anon, authenticated;
