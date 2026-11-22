# Dev-X Project: Smart Study & Mistake-Tracker Hub (v1 → v2 Handoff)

## Current Working v1 Features
- **Supabase Auth**: Email/password sign-up, sign-in, and sign-out.
- **Database (`public.mistake_logs`)**: Per-user Row Level Security (RLS) enabled.
- **Core CRUD & Filtering**: Add mistake log, search by keyword, filter by subject/status, toggle status (`Needs Practice` ↔ `Reviewed`), and delete.

---

## Local Setup for Teammates
1. Clone the repository and install packages:
   ```bash
   git clone <YOUR_REPO_URL>
   cd devx-project
   npm install