-- Redacted recovery placeholder.
-- The original file contained a temporary QA password and should not be committed.

update auth.users
set encrypted_password = crypt('<REDACTED_TEMP_PASSWORD>', gen_salt('bf')),
    email_confirmed_at = now(),
    confirmed_at = now(),
    updated_at = now()
where email = '<REDACTED_QA_EMAIL>';
