# Deploying Table on Vercel

The site is one Vercel project: the React app is the frontend service and the FastAPI app is the backend
service (see `vercel.json`). `/api/*` goes to the backend, so the browser talks to a single origin and no
frontend API URL is needed.

## 1. Database

Create a free MongoDB Atlas cluster (M0 / Free tier), a database user, and add `0.0.0.0/0` under
Network Access (Vercel's IP addresses change). Copy the `mongodb+srv://…` connection string.

## 2. Environment variables (Vercel → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `MONGO_URL` | the Atlas connection string, with the real password |
| `DB_NAME` | `table` |
| `JWT_SECRET` | a long random string |
| `CORS_ORIGINS` | the site URL, e.g. `https://tableco.vercel.app` |
| `SEED_DEMO_DATA` | `false` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay keys (test keys while testing) |
| `RAZORPAY_WEBHOOK_SECRET` | secret set on the Razorpay webhook to `https://<site>/api/razorpay/webhook` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | optional: booking emails stay off without them |
| `REACT_APP_SUPPORT_EMAIL`, `REACT_APP_LEGAL_NAME`, `REACT_APP_BUSINESS_ADDRESS`, `REACT_APP_SUPPORT_PHONE` | shown on the policy pages (needed for Razorpay) |

Do not set `REACT_APP_BACKEND_URL` on Vercel.

Leave `ADMIN_EMAIL` / `ADMIN_PASSWORD` unset: no admin account is created. Restaurants are managed
with their access codes.

## 3. Load the restaurants (once per database)

From `backend/`, with the Atlas string passed as a temporary variable (never saved to a file):

```bash
MONGO_URL='mongodb+srv://…' DB_NAME=table ./.venv/bin/python import_restaurants.py
MONGO_URL='mongodb+srv://…' DB_NAME=table ./.venv/bin/python generate_staff_codes.py
```

The import loads details, photos (stored in MongoDB) and menus. The second command prints each
restaurant's staff access code once — copy them down. `--reset` replaces all codes.

## 4. Redeploy and check

Open `/api/venues` (should list the restaurants), then `/restaurant-login` and sign in with a code.

## Notes

- Uploaded photos live in MongoDB (`uploads` collection), not on disk.
- The login page's "Skip login (temporary)" buttons use demo accounts; remove them before real use.
