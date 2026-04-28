# Bull ASUR - Navigation Guide

## Home Page (`/`)
The landing page with 4 role-based entry buttons.

**Buttons:**
- Étudiant → `/login/etudiant`
- Enseignant → `/login/enseignant`
- Secrétariat → `/login/secretariat`
- Admin → `/login/admin`

---

## Login Pages

### Student Login (`/login/etudiant`)
- **Color**: Blue theme
- **Test Credentials**: `mmartin2024` / `password123`
- **Redirect on Success**: `/dashboard`

### Teacher Login (`/login/enseignant`)
- **Color**: Green theme
- **Test Credentials**: `jdupontweb` / `password123`
- **Redirect on Success**: `/dashboard`

### Secretariat Login (`/login/secretariat`)
- **Color**: Amber theme
- **Test Credentials**: `admin` / `admin`
- **Redirect on Success**: `/admin/dashboard`

### Admin Login (`/login/admin`)
- **Color**: Red theme
- **Test Credentials**: `root` / `root`
- **Redirect on Success**: `/admin/dashboard`

---

## Admin/Secretariat Dashboard

### Main Dashboard (`/admin/dashboard`)
Overview page with:
- **Statistics Cards**:
  - Total Students (click to go to student management)
  - Total Teachers (click to go to teacher management)
  - Total Subjects (click to go to subject management)
  - Total Semesters (click to go to semester management)

- **Quick Action Cards**:
  - Academic Configuration Section
    - Add Semester
    - Add Teaching Unit (UE)
    - Add Subject
  - User Management Section
    - Manage Teachers
    - Manage Students
    - My Profile

### Teacher Management (`/admin/teachers`)
**Features:**
- List all teachers in table format
- Columns: Name, First Name, Email, Matriculation, Specialization, Actions
- **Create Teacher** button (top right)
  - Form modal with fields:
    - Name, First Name
    - Email, Matriculation
    - Specialization
    - Password
- **Actions**:
  - Edit (prepared for implementation)
  - Delete (with confirmation)

### Student Management (`/admin/students`)
**Features:**
- List all students in table format
- Columns: Name, First Name, Email, Matriculation, Actions
- **Create Student** button (top right)
  - Form modal with fields:
    - Name, First Name, Email
    - Matriculation, Identifier
    - Password
    - Date of Birth, Place of Birth
    - BAC Type, Year, Mention
    - Phone Number, Address (optional)
- **Actions**:
  - Edit (prepared for implementation)
  - Delete (with confirmation)

### Academic Management

#### Semesters (`/admin/semesters`)
**Tab 1 - Semesters**
- List all semesters
- Columns: Label, Code, Academic Year, Actions
- Create new semester form with:
  - Label, Code
  - Academic Year (format: YYYY-YYYY)
- Delete action

#### Teaching Units (`/admin/ue`)
**Tab 2 - Teaching Units**
- List all UEs
- Columns: Code, Label, Semester, Actions
- Create new UE form with:
  - Code, Label
  - Semester dropdown (auto-populated from semesters)
- Delete action

#### Subjects (`/admin/subjects`)
**Tab 3 - Subjects**
- List all subjects/matières
- Columns: Label, Coefficient, Credits, Actions
- Create new subject form with:
  - Label
  - Coefficient (decimal)
  - Credits (integer)
  - UE dropdown (auto-populated from UEs)
- Delete action

### User Profile (`/admin/profile`)
**Features:**
- **Profile Card** (left side):
  - Avatar with user initial
  - Name, Email
  - Role
  - First Name
  - Registration Date

- **Information Section** (right side):
  - Email (read-only)
  - Name (read-only)
  - Role (read-only)
  - Info: Personal info only editable by admin

- **Security Section** (right side):
  - Password change button
  - Form with:
    - Current password
    - New password
    - Confirm password
  - Password visibility toggle
  - Success/error messages

---

## Student Dashboard (`/dashboard`)
After login as student:
- Welcome message with student name
- Role badge: "Étudiant"
- Quick action cards:
  - My Bulletins (view grades)
  - Results (view averages)
- Logout button

---

## Teacher Dashboard (`/dashboard`)
After login as teacher:
- Welcome message with teacher name
- Role badge: "Enseignant"
- Quick action cards:
  - Enter Grades
  - My Subjects
- Logout button

---

## URL Routes Summary

| Path | Component | Access | Role |
|------|-----------|--------|------|
| `/` | Home | Public | Any |
| `/login/:role` | LoginForm | Public | Any |
| `/dashboard` | Dashboard | Protected | Any Auth |
| `/admin/dashboard` | DashboardAdmin | Protected | Admin/Secret |
| `/admin/teachers` | TeacherManagement | Protected | Admin/Secret |
| `/admin/students` | StudentManagement | Protected | Admin/Secret |
| `/admin/semesters` | AcademicMgmt | Protected | Admin/Secret |
| `/admin/ue` | AcademicMgmt | Protected | Admin/Secret |
| `/admin/subjects` | AcademicMgmt | Protected | Admin/Secret |
| `/admin/bulletins` | DashboardAdmin | Protected | Admin/Secret |
| `/admin/profile` | ProfilePage | Protected | Admin/Secret |

---

## Navigation Flow Chart

```
Home Page
├── Student Login → Student Dashboard
│   ├── View Bulletins
│   └── View Results
├── Teacher Login → Teacher Dashboard
│   ├── Enter Grades
│   └── Manage Subjects
├── Secretariat Login → Admin Dashboard
│   ├── Manage Teachers
│   ├── Manage Students
│   ├── Manage Academic Content
│   │   ├── Semesters
│   │   ├── Teaching Units
│   │   └── Subjects
│   ├── View Bulletins
│   └── My Profile
└── Admin Login → Admin Dashboard
    ├── Manage Teachers
    ├── Manage Students
    ├── Manage Academic Content
    │   ├── Semesters
    │   ├── Teaching Units
    │   └── Subjects
    ├── View Bulletins
    └── My Profile
```

---

## Sidebar Navigation (Admin/Secretariat)

The sidebar has collapsible menu with these items:

1. **Tableau de bord** (Home icon)
   - Takes to `/admin/dashboard`

2. **Gestion Enseignants** (Book Open icon)
   - Takes to `/admin/teachers`

3. **Gestion Étudiants** (Graduation Cap icon)
   - Takes to `/admin/students`

4. **Gestion Académique** (File Text icon) - **Expandable**
   - Semestres → `/admin/semesters`
   - Unités d'Enseignement → `/admin/ue`
   - Matières → `/admin/subjects`

5. **Bulletins** (File Text icon)
   - Takes to `/admin/bulletins`

6. **Profil** (User icon)
   - Takes to `/admin/profile`

---

## Features Accessibility

### Creating Records
- Click **"Ajouter..."** buttons (green for students, blue for teachers/academic)
- Fill in the modal form
- Click **Créer** to submit

### Editing Records
- Click **Edit icon** (pencil) in table rows
- Currently prepared UI - functionality will be implemented

### Deleting Records
- Click **Delete icon** (trash) in table rows
- Confirm in dialog
- Record is removed

### Viewing Details
- Tables show all important information
- Click on stats cards for quick navigation
- Use sidebar for full navigation

---

## Keyboard Navigation
- **Tab**: Navigate between form fields
- **Enter**: Submit forms or trigger buttons
- **Escape**: Close modals (prepared)

---

## Error Handling

All pages include error alerts that display:
- Network failures
- Validation errors
- API response errors
- Authentication issues

Each error message is specific and actionable.

---

## Loading States

All data-fetching operations show:
- Spinner icon with "Chargement..." message
- Disabled buttons during submission
- "Aucun résultat trouvé" message when no data

---

## Mobile Navigation

The sidebar:
- Collapses to icons on small screens
- Can be toggled with hamburger menu
- Maintains all functionality on mobile devices

Forms:
- Single column on mobile
- Multi-column on desktop
- Full responsive layout

Tables:
- Horizontal scroll on mobile
- Full width on desktop
- Touch-friendly controls
