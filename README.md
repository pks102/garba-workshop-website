# Joy Kids Care Garba Workshop

Registration website for the Joy Kids Care Garba Workshop on 28–30 September 2026.

## Features

- Public participant registration form
- Cloudflare D1 registration storage
- Google Sign-In protected admin page
- CSV export for registered participant details
- Responsive event banner and mobile-friendly layout

## Configuration

Create runtime environment variables based on `.env.example`:

- `GOOGLE_CLIENT_ID`
- `ADMIN_GOOGLE_EMAILS`
- `ADMIN_SESSION_SECRET`

Personal administrator email addresses and secrets are intentionally not committed.

## Hosting

The production website is hosted through ChatGPT Sites. Platform-owned hosting adapters and internal build tooling are intentionally excluded from this public repository.
