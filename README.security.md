Security configuration
======================

Set SESSION_SECRET to a unique random value of at least 32 characters before starting the server (for example, generate one with `openssl rand -hex 32`). Do not commit it. Replacing the old public secret invalidates existing sessions.

Production requires HTTPS because session cookies use Secure. When behind a reverse proxy, configure Express trust proxy for the specific trusted proxy before the session middleware.

Run regression tests with `node --test test/security.test.js` from this directory. These tests isolate middleware and routes; they do not require MongoDB.
