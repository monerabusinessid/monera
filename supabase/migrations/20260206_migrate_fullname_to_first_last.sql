-- Migrate existing full_name data to first_name and last_name
-- This will split full_name into first_name (first word) and last_name (rest)

update public.profiles
set 
  first_name = split_part(full_name, ' ', 1),
  last_name = trim(substring(full_name from position(' ' in full_name) + 1))
where 
  full_name is not null 
  and full_name != ''
  and (first_name is null or last_name is null);
