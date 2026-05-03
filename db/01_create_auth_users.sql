-- ============================================================
-- CAMPFIRE — Create Auth Users via Supabase auth schema
-- Run in Supabase SQL Editor (hosted project)
-- Creates all 30 seed users with fixed UUIDs
-- Password for all users: CampFire2024!
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '8f560d5d-a4eb-424b-ad35-4189d0030260',
  '00000000-0000-0000-0000-000000000000',
  'loganriv@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "loganriv", "display_name": "Logan Rivera", "date_of_birth": "1982-01-11"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'd2de98e1-31b4-4799-a93d-62c2c978cbad',
  '00000000-0000-0000-0000-000000000000',
  'loganoka@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NULL, NOW(), NOW(),
  '{"username": "loganoka", "display_name": "Logan Okafor", "date_of_birth": "2008-10-05"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '87abeef3-9b2b-4d79-bd25-036d87ac0cf4',
  '00000000-0000-0000-0000-000000000000',
  'averygar@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "averygar", "display_name": "Avery Garcia", "date_of_birth": "1986-04-07"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'e77d208a-98a7-49ca-a9c6-ace6e84487f0',
  '00000000-0000-0000-0000-000000000000',
  'ziondia@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "ziondia", "display_name": "Zion Diallo", "date_of_birth": "2009-10-23"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '4c0d8638-a2a0-47c0-8748-c6edc733b209',
  '00000000-0000-0000-0000-000000000000',
  'micahngu@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "micahngu", "display_name": "Micah Nguyen", "date_of_birth": "1987-06-13"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '1ef9abac-7795-402b-8ce7-7193d5a1c12e',
  '00000000-0000-0000-0000-000000000000',
  'morganand@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "morganand", "display_name": "Morgan Andersen", "date_of_birth": "2009-10-07"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '7deb2480-d83c-477d-bb87-1e1db220f7cb',
  '00000000-0000-0000-0000-000000000000',
  'averymul@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "averymul", "display_name": "Avery Muller", "date_of_birth": "1984-10-30"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '45dd4228-b192-42da-a246-c045b6f3f8d7',
  '00000000-0000-0000-0000-000000000000',
  'camerongar@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "camerongar", "display_name": "Cameron Garcia", "date_of_birth": "1983-04-14"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'a24f55b1-9cac-4a9d-998a-ad248817db24',
  '00000000-0000-0000-0000-000000000000',
  'camerondia@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NULL, NOW(), NOW(),
  '{"username": "camerondia", "display_name": "Cameron Diallo", "date_of_birth": "2006-01-06"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'f470a2c9-e389-4309-9753-02eb6fab687c',
  '00000000-0000-0000-0000-000000000000',
  'loganngu@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "loganngu", "display_name": "Logan Nguyen", "date_of_birth": "2003-06-30"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '678f2340-a53b-42ff-a8a5-f335efb74dac',
  '00000000-0000-0000-0000-000000000000',
  'taylorsan@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "taylorsan", "display_name": "Taylor Santos", "date_of_birth": "1999-03-13"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '946e5502-ed6f-4879-80a6-d5dcf6616401',
  '00000000-0000-0000-0000-000000000000',
  'caseymue@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "caseymue", "display_name": "Casey Mueller", "date_of_birth": "1999-03-26"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '3587a23e-c903-42f3-808c-81f6ccae577b',
  '00000000-0000-0000-0000-000000000000',
  'lenamul@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "lenamul", "display_name": "Lena Muller", "date_of_birth": "1992-10-06"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '6b1dd4ea-1876-419b-bf67-54abf9ba6c9b',
  '00000000-0000-0000-0000-000000000000',
  'kennedyoka@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "kennedyoka", "display_name": "Kennedy Okafor", "date_of_birth": "1988-03-01"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '89031562-6bad-45e9-a543-d77729f80b9f',
  '00000000-0000-0000-0000-000000000000',
  'tobyfer@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NULL, NOW(), NOW(),
  '{"username": "tobyfer", "display_name": "Toby Ferreira", "date_of_birth": "2003-07-05"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '63c8caf9-d3ee-4aa9-83f2-9e6ccea030a5',
  '00000000-0000-0000-0000-000000000000',
  'rileyito@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "rileyito", "display_name": "Riley Ito", "date_of_birth": "2006-06-28"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '79512e68-d821-487f-84da-c465b03c4f72',
  '00000000-0000-0000-0000-000000000000',
  'cameronand@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NULL, NOW(), NOW(),
  '{"username": "cameronand", "display_name": "Cameron Andersen", "date_of_birth": "2010-07-01"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '9038fba0-2c31-4269-844c-e7eeda91ff89',
  '00000000-0000-0000-0000-000000000000',
  'zionkow@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "zionkow", "display_name": "Zion Kowalski", "date_of_birth": "2012-10-30"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '4f249882-1461-441c-8633-2fcfbca42655',
  '00000000-0000-0000-0000-000000000000',
  'piperito@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "piperito", "display_name": "Piper Ito", "date_of_birth": "1998-02-01"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'f0e89160-11d3-4458-acc1-7f9ee6fc2b35',
  '00000000-0000-0000-0000-000000000000',
  'tobyros@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "tobyros", "display_name": "Toby Rossi", "date_of_birth": "2001-07-13"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'ea8bcb67-cf2f-49d3-b63b-9fd1a7558573',
  '00000000-0000-0000-0000-000000000000',
  'milokim@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "milokim", "display_name": "Milo Kim", "date_of_birth": "1999-12-17"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '3372d3bc-3784-4719-90b2-a39764db39da',
  '00000000-0000-0000-0000-000000000000',
  'blakegar@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "blakegar", "display_name": "Blake Garcia", "date_of_birth": "1989-02-24"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '3412b044-a222-469d-9f45-4a86fd872e91',
  '00000000-0000-0000-0000-000000000000',
  'ezrariv@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "ezrariv", "display_name": "Ezra Rivera", "date_of_birth": "1991-06-06"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '701b3da5-c56a-4ae4-973e-844a68e7730b',
  '00000000-0000-0000-0000-000000000000',
  'sageoko@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "sageoko", "display_name": "Sage Okonkwo", "date_of_birth": "2002-07-17"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '71c72e78-06ab-4201-a2d0-b4740b44e36e',
  '00000000-0000-0000-0000-000000000000',
  'sawyerpat@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "sawyerpat", "display_name": "Sawyer Patel", "date_of_birth": "1991-07-19"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '74512536-3514-46b8-816a-636af1f880cd',
  '00000000-0000-0000-0000-000000000000',
  'piperito1@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "piperito1", "display_name": "Piper Ito", "date_of_birth": "1983-10-02"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  '92944235-a013-4729-b25b-1ca626f6a183',
  '00000000-0000-0000-0000-000000000000',
  'kennedykow@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "kennedykow", "display_name": "Kennedy Kowalski", "date_of_birth": "1994-05-14"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'f5562d30-4881-4b27-ad64-ad149559176e',
  '00000000-0000-0000-0000-000000000000',
  'noahmul@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NULL, NOW(), NOW(),
  '{"username": "noahmul", "display_name": "Noah Muller", "date_of_birth": "1996-08-05"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'b7074ba5-c94f-4a23-9b43-1385f8cbcd1c',
  '00000000-0000-0000-0000-000000000000',
  'quinnsan@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "quinnsan", "display_name": "Quinn Santos", "date_of_birth": "1998-03-07"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data, role, aud
) VALUES (
  'a0a64fdb-ab10-445a-8bf5-8c43793e3bb5',
  '00000000-0000-0000-0000-000000000000',
  'harleyriv@campfire-demo.dev',
  crypt('CampFire2024!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"username": "harleyriv", "display_name": "Harley Rivera", "date_of_birth": "1985-01-14"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Auth identities (required for email/password login)
-- ============================================================

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '8f560d5d-a4eb-424b-ad35-4189d0030260', '8f560d5d-a4eb-424b-ad35-4189d0030260', 'loganriv@campfire-demo.dev',
  '{"sub": "8f560d5d-a4eb-424b-ad35-4189d0030260", "email": "loganriv@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'd2de98e1-31b4-4799-a93d-62c2c978cbad', 'd2de98e1-31b4-4799-a93d-62c2c978cbad', 'loganoka@campfire-demo.dev',
  '{"sub": "d2de98e1-31b4-4799-a93d-62c2c978cbad", "email": "loganoka@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '87abeef3-9b2b-4d79-bd25-036d87ac0cf4', '87abeef3-9b2b-4d79-bd25-036d87ac0cf4', 'averygar@campfire-demo.dev',
  '{"sub": "87abeef3-9b2b-4d79-bd25-036d87ac0cf4", "email": "averygar@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'e77d208a-98a7-49ca-a9c6-ace6e84487f0', 'e77d208a-98a7-49ca-a9c6-ace6e84487f0', 'ziondia@campfire-demo.dev',
  '{"sub": "e77d208a-98a7-49ca-a9c6-ace6e84487f0", "email": "ziondia@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '4c0d8638-a2a0-47c0-8748-c6edc733b209', '4c0d8638-a2a0-47c0-8748-c6edc733b209', 'micahngu@campfire-demo.dev',
  '{"sub": "4c0d8638-a2a0-47c0-8748-c6edc733b209", "email": "micahngu@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '1ef9abac-7795-402b-8ce7-7193d5a1c12e', '1ef9abac-7795-402b-8ce7-7193d5a1c12e', 'morganand@campfire-demo.dev',
  '{"sub": "1ef9abac-7795-402b-8ce7-7193d5a1c12e", "email": "morganand@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '7deb2480-d83c-477d-bb87-1e1db220f7cb', '7deb2480-d83c-477d-bb87-1e1db220f7cb', 'averymul@campfire-demo.dev',
  '{"sub": "7deb2480-d83c-477d-bb87-1e1db220f7cb", "email": "averymul@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '45dd4228-b192-42da-a246-c045b6f3f8d7', '45dd4228-b192-42da-a246-c045b6f3f8d7', 'camerongar@campfire-demo.dev',
  '{"sub": "45dd4228-b192-42da-a246-c045b6f3f8d7", "email": "camerongar@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a24f55b1-9cac-4a9d-998a-ad248817db24', 'a24f55b1-9cac-4a9d-998a-ad248817db24', 'camerondia@campfire-demo.dev',
  '{"sub": "a24f55b1-9cac-4a9d-998a-ad248817db24", "email": "camerondia@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'f470a2c9-e389-4309-9753-02eb6fab687c', 'f470a2c9-e389-4309-9753-02eb6fab687c', 'loganngu@campfire-demo.dev',
  '{"sub": "f470a2c9-e389-4309-9753-02eb6fab687c", "email": "loganngu@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '678f2340-a53b-42ff-a8a5-f335efb74dac', '678f2340-a53b-42ff-a8a5-f335efb74dac', 'taylorsan@campfire-demo.dev',
  '{"sub": "678f2340-a53b-42ff-a8a5-f335efb74dac", "email": "taylorsan@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '946e5502-ed6f-4879-80a6-d5dcf6616401', '946e5502-ed6f-4879-80a6-d5dcf6616401', 'caseymue@campfire-demo.dev',
  '{"sub": "946e5502-ed6f-4879-80a6-d5dcf6616401", "email": "caseymue@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '3587a23e-c903-42f3-808c-81f6ccae577b', '3587a23e-c903-42f3-808c-81f6ccae577b', 'lenamul@campfire-demo.dev',
  '{"sub": "3587a23e-c903-42f3-808c-81f6ccae577b", "email": "lenamul@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '6b1dd4ea-1876-419b-bf67-54abf9ba6c9b', '6b1dd4ea-1876-419b-bf67-54abf9ba6c9b', 'kennedyoka@campfire-demo.dev',
  '{"sub": "6b1dd4ea-1876-419b-bf67-54abf9ba6c9b", "email": "kennedyoka@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '89031562-6bad-45e9-a543-d77729f80b9f', '89031562-6bad-45e9-a543-d77729f80b9f', 'tobyfer@campfire-demo.dev',
  '{"sub": "89031562-6bad-45e9-a543-d77729f80b9f", "email": "tobyfer@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '63c8caf9-d3ee-4aa9-83f2-9e6ccea030a5', '63c8caf9-d3ee-4aa9-83f2-9e6ccea030a5', 'rileyito@campfire-demo.dev',
  '{"sub": "63c8caf9-d3ee-4aa9-83f2-9e6ccea030a5", "email": "rileyito@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '79512e68-d821-487f-84da-c465b03c4f72', '79512e68-d821-487f-84da-c465b03c4f72', 'cameronand@campfire-demo.dev',
  '{"sub": "79512e68-d821-487f-84da-c465b03c4f72", "email": "cameronand@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '9038fba0-2c31-4269-844c-e7eeda91ff89', '9038fba0-2c31-4269-844c-e7eeda91ff89', 'zionkow@campfire-demo.dev',
  '{"sub": "9038fba0-2c31-4269-844c-e7eeda91ff89", "email": "zionkow@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '4f249882-1461-441c-8633-2fcfbca42655', '4f249882-1461-441c-8633-2fcfbca42655', 'piperito@campfire-demo.dev',
  '{"sub": "4f249882-1461-441c-8633-2fcfbca42655", "email": "piperito@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'f0e89160-11d3-4458-acc1-7f9ee6fc2b35', 'f0e89160-11d3-4458-acc1-7f9ee6fc2b35', 'tobyros@campfire-demo.dev',
  '{"sub": "f0e89160-11d3-4458-acc1-7f9ee6fc2b35", "email": "tobyros@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'ea8bcb67-cf2f-49d3-b63b-9fd1a7558573', 'ea8bcb67-cf2f-49d3-b63b-9fd1a7558573', 'milokim@campfire-demo.dev',
  '{"sub": "ea8bcb67-cf2f-49d3-b63b-9fd1a7558573", "email": "milokim@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '3372d3bc-3784-4719-90b2-a39764db39da', '3372d3bc-3784-4719-90b2-a39764db39da', 'blakegar@campfire-demo.dev',
  '{"sub": "3372d3bc-3784-4719-90b2-a39764db39da", "email": "blakegar@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '3412b044-a222-469d-9f45-4a86fd872e91', '3412b044-a222-469d-9f45-4a86fd872e91', 'ezrariv@campfire-demo.dev',
  '{"sub": "3412b044-a222-469d-9f45-4a86fd872e91", "email": "ezrariv@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '701b3da5-c56a-4ae4-973e-844a68e7730b', '701b3da5-c56a-4ae4-973e-844a68e7730b', 'sageoko@campfire-demo.dev',
  '{"sub": "701b3da5-c56a-4ae4-973e-844a68e7730b", "email": "sageoko@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '71c72e78-06ab-4201-a2d0-b4740b44e36e', '71c72e78-06ab-4201-a2d0-b4740b44e36e', 'sawyerpat@campfire-demo.dev',
  '{"sub": "71c72e78-06ab-4201-a2d0-b4740b44e36e", "email": "sawyerpat@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '74512536-3514-46b8-816a-636af1f880cd', '74512536-3514-46b8-816a-636af1f880cd', 'piperito1@campfire-demo.dev',
  '{"sub": "74512536-3514-46b8-816a-636af1f880cd", "email": "piperito1@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '92944235-a013-4729-b25b-1ca626f6a183', '92944235-a013-4729-b25b-1ca626f6a183', 'kennedykow@campfire-demo.dev',
  '{"sub": "92944235-a013-4729-b25b-1ca626f6a183", "email": "kennedykow@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'f5562d30-4881-4b27-ad64-ad149559176e', 'f5562d30-4881-4b27-ad64-ad149559176e', 'noahmul@campfire-demo.dev',
  '{"sub": "f5562d30-4881-4b27-ad64-ad149559176e", "email": "noahmul@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'b7074ba5-c94f-4a23-9b43-1385f8cbcd1c', 'b7074ba5-c94f-4a23-9b43-1385f8cbcd1c', 'quinnsan@campfire-demo.dev',
  '{"sub": "b7074ba5-c94f-4a23-9b43-1385f8cbcd1c", "email": "quinnsan@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a0a64fdb-ab10-445a-8bf5-8c43793e3bb5', 'a0a64fdb-ab10-445a-8bf5-8c43793e3bb5', 'harleyriv@campfire-demo.dev',
  '{"sub": "a0a64fdb-ab10-445a-8bf5-8c43793e3bb5", "email": "harleyriv@campfire-demo.dev"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;
