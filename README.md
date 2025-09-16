# Medical Appointment System - Frontend

A modern medical appointment management system built with Next.js, React, and JWT authentication. Features a responsive design and seamless integration with the ASP.NET Core backend API.

## Features

- **Patient Portal**
  - Registration and login
  - Profile management
  - Appointment scheduling and viewing
  - Appointment history and status tracking
- **Doctor Portal**
  - Registration and login
  - Profile management
  - View and manage appointments
  - Patient appointment history
- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interfaces
- **Security**
  - JWT-based authentication
  - Role-based access control
  - Secure token storage
  - Protected routes

## Technology Stack

- **Next.js 13.4.10**
- **React 18.2.0**
- **Axios** for API communication
- **JWT Decode** for token handling
- **CSS Modules** for styling
- **Local Storage** for token persistence

## Prerequisites

- Node.js (version 14.x or higher)
- npm (comes with Node.js)
- Backend API running (ASP.NET Core)
- Modern web browser
- Code editor (VS Code recommended)

## Project Structure

```
medical-client/
├── components/
│   ├── Layout.js          # Main layout wrapper
│   └── PrivateRoute.js    # Auth route protection
├── lib/
│   └── api.js            # API integration
├── pages/
│   ├── doctor/
│   │   ├── dashboard.js   # Doctor dashboard
│   │   ├── login.js      # Doctor login
│   │   ├── profile.js    # Doctor profile
│   │   └── register.js   # Doctor registration
│   ├── patient/
│   │   ├── dashboard.js   # Patient dashboard
│   │   ├── login.js      # Patient login
│   │   ├── profile.js    # Patient profile
│   │   └── register.js   # Patient registration
│   ├── _app.js           # App configuration
│   └── index.js          # Landing page
├── styles/
│   └── globals.css       # Global styles
└── utils/
    └── auth.js           # Auth utilities
```

## Available Routes

### Public Routes

- `/` - Landing page
- `/patient/login` - Patient login
- `/patient/register` - Patient registration
- `/doctor/login` - Doctor login
- `/doctor/register` - Doctor registration

### Protected Routes (Requires Authentication)

- `/patient/dashboard` - Patient dashboard
- `/patient/profile` - Patient profile management
- `/doctor/dashboard` - Doctor dashboard
- `/doctor/profile` - Doctor profile management

## API Integration

The frontend communicates with the backend through these main services:

### Authentication API

```javascript
AuthApi.loginPatient(data);
AuthApi.registerPatient(data);
AuthApi.loginDoctor(data);
AuthApi.registerDoctor(data);
```

### Patient API

```javascript
PatientApi.getById(id);
PatientApi.updateProfile(id, data);
PatientApi.getAppointmentsByPatient(patientId);
PatientApi.scheduleAppointment(data);
```

### Doctor API

```javascript
DoctorApi.getById(id);
DoctorApi.updateProfile(id, data);
DoctorApi.getAppointmentsByDoctor(doctorId);
```

### Appointments API

```javascript
AppointmentsApi.getById(id);
AppointmentsApi.cancel(id);
AppointmentsApi.complete(id);
```

## Authentication Flow

1. **Login Process**

   - User submits credentials
   - Backend validates and returns JWT
   - Token stored in localStorage
   - User redirected to dashboard

2. **Protected Routes**

   - Check for valid token
   - Verify user role
   - Redirect to login if unauthorized

3. **Token Management**

   ```javascript
   // Store token
   setAuthToken(token);

   // Get stored token
   getStoredToken();

   // Extract user info
   getUserFromToken();
   ```

## Component Features

### Patient Dashboard

- Appointment scheduling
- View upcoming appointments
- Cancel appointments
- Appointment history

### Doctor Dashboard

- View scheduled appointments
- Manage appointment status
- Patient appointment history
- Daily/weekly schedule view

### Profile Management

- Update personal information
- View profile details
- Email and phone updates
- Role-specific fields

## Styling System

- **Global Styles**: Base styling and variables
- **Component-Specific**: Modular CSS approach
- **Responsive Design**: Mobile-first breakpoints
- **Theme Variables**: Consistent color scheme
- **Interactive States**: Hover, focus, active states

## Error Handling

- Form validation feedback
- API error messages
- Network error handling
- Loading states
- User-friendly error messages

## Development Notes

- Uses Next.js for server-side rendering
- JWT stored in localStorage
- Environment-based API URLs

## Security Measures

- JWT token validation
- Protected route guards
- XSS prevention
- CORS handling
- Secure token storage

