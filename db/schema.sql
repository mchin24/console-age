-- CREATE DATABASE consoles;
-- CREATE USER console_svc WITH PASSWORD '4Y2tHbVr*%X3m3wp';
-- GRANT CONNECT ON DATABASE consoles TO console_svc;
-- GRANT USAGE ON SCHEMA public TO console_svc;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO console_svc;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO console_svc;

-- \c consoles;

CREATE TABLE IF NOT EXISTS consoles (
    id SERIAL PRIMARY KEY,
    name TEXT,
    manufacturer TEXT,
    release_date DATE,
    age INTEGER,
    image_url TEXT
);