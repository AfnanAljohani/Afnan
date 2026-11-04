-- Grant admin rights to an existing Supabase Auth user.
-- 1) Supabase Dashboard → Authentication → Users → "Add user" → "Create new user"
--    (enter the e-mail and a strong password, tick "Auto Confirm User").
-- 2) Replace the e-mail below and run this in Dashboard → SQL Editor.
--    Nothing here is stored in the repository: the e-mail is only typed in the SQL Editor.

insert into private.admins (user_id, email)
select id, email from auth.users where email = lower('REPLACE-WITH-ADMIN-EMAIL@example.com')
on conflict (user_id) do nothing
returning email as admin_added;

-- List admins:      select email, created_at from private.admins;
-- Remove an admin:  delete from private.admins where email = 'someone@example.com';
