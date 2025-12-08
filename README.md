# SchoolOS - Next.js School Management System

A premium, comprehensive School Management System built with **Next.js 14**, **Tailwind CSS v4**, and **Supabase**.

## 🚀 Features

### Core Modules
- **Role-Based Access Control**:
  - **SuperAdmin**: System-wide control, audit logs.
  - **Principal**: School management, teacher oversight.
  - **Teacher**: Class management, grading, attendance, certificates.
  - **Student**: View schedule, grades, certificates, profile.
  - **Parent**: Monitor child progress, view attendance.
- **Academic Management**:
  - **Classes & Subjects**: Create and assign teachers.
  - **Enrollment**: Manage student admission and status.
  - **Grading**: Record mid-term and final exam scores.
  - **Attendance**: Daily tracking and aggregation.
- **Engagement**:
  - **Messaging**: Internal communication and class broadcasts.
  - **Schedules**: Interactive calendar for classes and exams.
  - **Certificates**: Issue digital awards and transcripts.

### Technical Highlights
- **Architecture**: Next.js App Router (Server Actions).
- **Styling**: Premium Glassmorphism UI with Tailwind CSS.
- **Database**: PostgreSQL (via Supabase) with strict RLS policies.
- **Security**: Audit logging for critical actions.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account

### Installation

1.  **Clone Strategy**:
    ```bash
    git clone https://github.com/your-username/school-os.git
    cd school-os
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    > Note: Database schema setup is required. Please refer to `supabase_guide.md` or `schema.prisma` if using Prisma for migrations.

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Access App**:
    Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Default Scenarios

### Auto-School Creation
- When registering a new user (Principal/Admin), if no school is found, the system will automatically create a "Demo School" and assign the user to it.

### Roles
- Users can be assigned roles directly in the Database or via Admin dashboard (if enabled). Valid roles: `SUPERADMIN`, `PRINCIPAL`, `TEACHER`, `STUDENT`, `PARENT`.

---

## 📂 Project Structure

- `/app` - Next.js App Router pages and layouts.
  - `/dashboard` - Protected application routes.
  - `/actions` - Server Actions for data mutation.
- `/components` - Reusable UI components.
- `/lib` - Utilities and Supabase client configuration.

---

## ©️ License
Private / Proprietary.
