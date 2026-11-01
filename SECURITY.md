# Security

## Reporting a problem

Please do not open a public issue for a vulnerability. Use GitHub's **Report a vulnerability** button on the
Security tab of this repository. You will get an answer within a few days.

## Who may do what

| Role        | Signs in with         | Can                                                                   |
| ----------- | --------------------- | --------------------------------------------------------------------- |
| Visitor     | nothing               | See public photos and videos.                                         |
| Friend      | the shared passcode   | Also see private items. Optional: `FRIENDS_ENABLED=false` removes it. |
| Admin       | username and password | Upload, organise and delete. Private items only with private access.  |
| Super admin | username and password | Everything, plus admins, branding, and restoring what admins deleted. |

## How the app protects itself

- **Passwords and the passcode** are stored as scrypt hashes, never in clear text.
- **Sessions** are signed cookies (`HttpOnly`, `SameSite=Lax`, `Secure` over HTTPS). Changing a password or
  the passcode ends the sessions that depended on it.
- **The first account** needs a one-time code printed in the server log, so nobody who merely finds a new
  installation can take it over.
- **Guessing is slowed down** per address and per account on sign-in, unlock and setup.
- **Writes are same-origin only**: requests with a foreign `Origin` are refused.
- **Uploads are identified by content**, not by name or declared type. Images are decoded and re-encoded;
  location data is removed from the web copies. Logos are re-encoded as plain PNG.
- **Pages carry a Content-Security-Policy** with a per-request nonce, plus `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy` and, over HTTPS, `Strict-Transport-Security`.
- **Private media is never cached by shared caches** and every media request is checked against the viewer's
  access.
- **Nothing is loaded from other sites.** Fonts and scripts are part of the app.

## Running it safely

Serve it over HTTPS behind a reverse proxy that sets `X-Real-IP`, keep the data folder on a volume that only
the app can read, and back that folder up. Details: [docs/operations.md](docs/operations.md).
