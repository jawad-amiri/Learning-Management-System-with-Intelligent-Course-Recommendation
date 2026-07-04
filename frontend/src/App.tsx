import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { useAuth } from '@/features/auth/context/useAuth'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { Suspense, lazy } from 'react'
import MainLayout from '@/layouts/MainLayout'

// Lazy loaded pages
const Home = lazy(() => import('@/features/home/pages/HomePage'))
const Login = lazy(() => import('@/features/auth/pages/LoginPage'))
const Register = lazy(() => import('@/features/auth/pages/RegisterPage'))
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const Courses = lazy(() => import('@/features/courses/pages/CoursesPage'))
const CourseDetail = lazy(() => import('@/features/courses/pages/CourseDetailPage'))
const CourseEdit = lazy(() => import('@/features/courses/pages/CourseEditPage'))
const Learning = lazy(() => import('@/features/videos/pages/LearningPage'))
const MyProgress = lazy(() => import('@/features/progress/pages/MyProgressPage'))
const Certificates = lazy(() => import('@/features/certificates/pages/CertificatesPage'))
const Recommendations = lazy(() => import('@/features/recommendations/pages/RecommendationsPage'))
const Profile = lazy(() => import('@/features/profile/pages/ProfilePage'))
const TeacherProfile = lazy(() => import('@/features/profile/pages/TeacherProfilePage'))
const TeacherMedia = lazy(() => import('@/features/uploads/pages/TeacherMediaPage'))
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboardPage'))
const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsersPage'))
const AdminCourses = lazy(() => import('@/features/admin/pages/AdminCoursesPage'))
const AdminRules = lazy(() => import('@/features/admin/pages/AdminRulesPage'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

function TeacherMediaAlias() {
  return <TeacherMedia />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <RequireAuth>
                  <MainLayout />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route
                path="/courses/:id/edit"
                element={
                  <RequireRole roles={['teacher', 'admin', 'super_admin']}>
                    <CourseEdit />
                  </RequireRole>
                }
              />
              <Route path="/learn/:courseId" element={<Learning />} />
              <Route path="/progress" element={<MyProgress />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/teachers/:id" element={<TeacherProfile />} />
              <Route
                path="/teacher/media"
                element={
                  <RequireRole roles={['teacher']}>
                    <TeacherMediaAlias />
                  </RequireRole>
                }
              />
              <Route
                path="/teacher/upload-video"
                element={
                  <RequireRole roles={['teacher']}>
                    <TeacherMediaAlias />
                  </RequireRole>
                }
              />
              <Route
                path="/teacher/upload-file"
                element={
                  <RequireRole roles={['teacher']}>
                    <TeacherMediaAlias />
                  </RequireRole>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireRole roles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RequireRole roles={['admin', 'super_admin']}>
                    <AdminUsers />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <RequireRole roles={['admin', 'super_admin']}>
                    <AdminCourses />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/rules"
                element={
                  <RequireRole roles={['admin', 'super_admin']}>
                    <AdminRules />
                  </RequireRole>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

