# Bull ASUR Frontend - Complete Features Documentation

## Overview

A production-ready React/TypeScript frontend for the Bull ASUR academic management system with full Admin/Secretariat dashboard, role-based access control, and comprehensive management interfaces.

## Features Implemented

### 1. Home Page
- **Background Image**: Full-screen backdrop with backpack photo
- **Role Selection**: 4 transparent buttons for different user roles:
  - Étudiant (Student)
  - Enseignant (Teacher)
  - Secrétariat (Secretariat)
  - Admin
- **Responsive Design**: Mobile-friendly layout with hover effects
- **Professional Styling**: Premium aesthetic with overlays and transitions

### 2. Authentication System
- **Multi-Role Login**: Separate login pages for each role
- **JWT Token Management**: Secure token storage and validation
- **Error Handling**: Clear error messages for failed authentication
- **Password Visibility Toggle**: Enhanced UX for password input
- **Test Credentials Display**: Quick reference for test accounts
- **Auto-Redirect**: Redirects authenticated users to dashboard

### 3. Student Dashboard
- View personal grades and bulletins
- Consultation of academic results
- Role-based restricted access

### 4. Teacher Dashboard
- Note entry for assigned courses
- Course management interface
- Student assessment tools

### 5. Admin/Secretariat Dashboard
- **Stats Overview**: Real-time statistics for:
  - Total Students
  - Total Teachers
  - Total Subjects
  - Total Semesters
- **Quick Actions**: Easy access to common management tasks
- **Comprehensive Navigation**: Sidebar with all available modules

### 6. Sidebar Navigation
- **Collapsible Design**: Compact/expanded modes
- **Active State Indication**: Current page highlighting
- **Submenu Support**: Grouped navigation for academic management
- **User Info Section**: Display connected user information
- **Logout Button**: Quick access to logout
- **Smooth Animations**: Professional transitions

### 7. Teacher Management
- **List Teachers**: Full table view with pagination
- **Create Teacher**: Modal form for new teacher entries
- **Edit Teacher**: (Prepared UI - API integration ready)
- **Delete Teacher**: Confirmation dialog with safe deletion
- **Fields**:
  - Name, First Name
  - Email, Matriculation Number
  - Specialization
  - Password (secure entry)

### 8. Student Management
- **List Students**: Complete student roster
- **Create Student**: Comprehensive form with all required fields
- **Edit Student**: (Prepared UI - API integration ready)
- **Delete Student**: Safe removal with confirmation
- **Fields**:
  - Name, First Name, Email
  - Matriculation Number, Identifier
  - Date of Birth, Place of Birth
  - BAC Type, Year, Mention
  - Phone Number, Address

### 9. Academic Management
Three-tab interface for managing academic structure:

#### Semesters
- Create new semesters
- View semester list (Code, Label, Academic Year)
- Delete semesters
- Quick semester access

#### Teaching Units (UE)
- Create new UEs
- Assign to specific semesters
- View all UEs with codes
- Delete UEs
- Dropdown selection for semester assignment

#### Subjects (Matières)
- Create subject entries
- Define coefficients and credits
- Link to teaching units
- Manage academic structure
- Complete subject database

### 10. User Profile Management
- **View Profile**: Display user information
- **Protected Fields**: Read-only personal information
- **Password Change**: Secure password modification form
- **Password Visibility**: Toggle for current and new passwords
- **Confirmation**: Confirm password with validation
- **Success/Error Messages**: Clear user feedback
- **Responsive Layout**: Works on all screen sizes

## Technology Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Routing**: React Router v6.20.0
- **HTTP Client**: Axios 1.6.2
- **Forms**: React Hook Form 7.48.0
- **Styling**: TailwindCSS 3.4.1
- **Icons**: Lucide React 0.344.0
- **Build Tool**: Vite 5.4.2

## Project Structure

```
src/
├── components/
│   ├── LoginForm.tsx              # Multi-role login form
│   ├── ProtectedRoute.tsx         # Route protection wrapper
│   └── AdminLayout.tsx            # Sidebar & layout wrapper
├── contexts/
│   └── AuthContext.tsx            # Global auth state
├── hooks/
│   └── useAuth.ts                # Auth custom hook
├── pages/
│   ├── Home.tsx                  # Landing page with role buttons
│   ├── Dashboard.tsx             # Role-based dashboard
│   └── admin/
│       ├── DashboardAdmin.tsx    # Admin dashboard with stats
│       ├── TeacherManagement.tsx # Teacher CRUD
│       ├── StudentManagement.tsx # Student CRUD
│       ├── AcademicManagement.tsx # Semester/UE/Subject management
│       └── ProfilePage.tsx       # User profile & password change
├── services/
│   ├── api.ts                    # Axios instance with interceptors
│   └── auth.ts                   # Authentication service
├── types/
│   └── index.ts                  # TypeScript interfaces
├── App.tsx                       # Main router
└── index.css                     # Global styles
```

## API Integration

All components connect to the production backend:
- **Base URL**: `https://bull-back-z97c.onrender.com`
- **Authentication**: JWT Bearer tokens
- **Request Interceptors**: Auto-add authorization headers
- **Response Interceptors**: Handle 401 errors with redirect

### Endpoints Used

- `GET /profil` - User profile
- `GET /etudiants` - List students
- `POST /etudiants` - Create student
- `DELETE /etudiants/:id` - Delete student
- `GET /enseignants` - List teachers
- `POST /enseignants` - Create teacher
- `DELETE /enseignants/:id` - Delete teacher
- `GET /semestres` - List semesters
- `POST /semestres` - Create semester
- `DELETE /semestres/:id` - Delete semester
- `GET /unites-enseignement` - List UEs
- `POST /unites-enseignement` - Create UE
- `DELETE /unites-enseignement/:id` - Delete UE
- `GET /matieres` - List subjects
- `POST /matieres` - Create subject
- `DELETE /matieres/:id` - Delete subject
- `PUT /auth/{role}/change-password` - Change password

## Design Patterns

### Color System
- **Primary Blue**: Button actions, primary UI
- **Green**: Student/Teacher positive actions
- **Amber**: Secretariat administrative functions
- **Red**: Admin/Delete operations
- **Gray**: Neutral backgrounds and disabled states

### UI Components
- **Modals**: For creation forms with validation
- **Tables**: Responsive tables with hover states
- **Alerts**: Error/success notifications
- **Loaders**: Skeleton/spinner states during loading
- **Buttons**: Consistent styling with hover/active states

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Collapsible sidebar on mobile
- Stacked forms on small screens
- Touch-friendly button sizes

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Access control by role
- **CORS Handling**: Proper cross-origin requests
- **Input Validation**: Form validation before submission
- **Password Security**: Hidden password fields by default
- **Session Management**: Auto-logout on token expiry

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Bundle Size**: 299KB (88.99KB gzipped)
- **Caching**: Axios interceptors for token management
- **Responsive Images**: Optimized background image
- **CSS Optimization**: TailwindCSS purging unused styles

## Error Handling

- **Network Errors**: Display user-friendly messages
- **Validation Errors**: Form field validation with feedback
- **Authentication Errors**: Auto-redirect to login
- **API Errors**: Detailed error messages from backend
- **Loading States**: Spinners and disabled buttons during requests

## Testing Credentials

### Admin
- ID: `root`
- Password: `root`

### Secretariat
- ID: `admin`
- Password: `admin`

### Teacher
- ID: `jdupontweb`
- Password: `password123`

### Student
- ID: `mmartin2024`
- Password: `password123`

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

## Future Enhancements

- [ ] Edit existing records
- [ ] Bulk import/export functionality
- [ ] Advanced filtering and search
- [ ] Report generation
- [ ] Real-time notifications
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Advanced analytics dashboard
- [ ] Evaluation/Grade management
- [ ] Certificate generation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Notes

- All forms include proper validation
- Error messages are contextual and helpful
- Loading states provide clear feedback
- The sidebar remembers navigation state
- Protected routes prevent unauthorized access
- Logout properly clears all local data
