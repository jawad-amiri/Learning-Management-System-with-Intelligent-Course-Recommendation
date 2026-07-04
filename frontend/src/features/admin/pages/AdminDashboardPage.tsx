import { useState, useEffect } from 'react'
import { api, getErrorMessage } from '@/services/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Award, Sparkles } from 'lucide-react'

interface DashboardData {
  users?: Array<{
    id: number
    full_name?: string
    role?: string
    role_name?: string
    created_at?: string
  }>
  courses?: Array<{
    id: number
    title: string
    teacher_name?: string
    status?: string
  }>
  total_users?: number
  total_courses?: number
  activeCourses?: number
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError("")
      const { data: dashboardData } = await api.get('/dashboard')
      setData(dashboardData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 dark:text-slate-100">{data.total_users || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-400/12">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
                <p className="mt-1 text-3xl font-bold text-primary-600 dark:text-primary-200">{data.total_courses || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-400/12">
                <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Courses</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{data.activeCourses || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI Rules</p>
                <p className="text-2xl font-bold text-primary-600 mt-1 dark:text-primary-200">Rule based</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-400/12">
                <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>Recent Users</CardHeader>
          <CardContent>
            {(data.users || []).length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm dark:text-slate-400">No users found</div>
            ) : (
              <div className="space-y-3">
                {data.users?.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-surface-subtle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600 dark:bg-primary-400/12 dark:text-primary-200">
                        {u.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.full_name}</p>
                        <p className="text-xs text-slate-500 capitalize dark:text-slate-400">{u.role_name || u.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Recent Courses</CardHeader>
          <CardContent>
            {(data.courses || []).length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm dark:text-slate-400">No courses found</div>
            ) : (
              <div className="space-y-3">
                {data.courses?.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-surface-subtle">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate dark:text-slate-100">{c.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">by {c.teacher_name}</p>
                    </div>
                    <Badge variant={c.status === 'active' ? 'success' : 'gray'}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

