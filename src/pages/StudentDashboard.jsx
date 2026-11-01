import { useContext, useEffect, useState } from 'react'
import Dashboard from '../components/Dashboard'
import { AuthContext } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function StudentDashboard() {
  const { session } = useContext(AuthContext)
  const userId = session.user.id
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAnnouncements() {
      setLoading(true)
      setError('')

      // Find this student's enrolled courses before requesting their announcements.
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', userId)

      if (enrollmentError) {
        if (active) setError(enrollmentError.message)
        if (active) setLoading(false)
        return
      }

      const courseIds = [...new Set((enrollments || []).map((row) => row.course_id))]
      if (courseIds.length === 0) {
        if (active) setAnnouncements([])
        if (active) setLoading(false)
        return
      }

      const [courseResult, announcementResult] = await Promise.all([
        supabase.from('courses').select('id, course_code').in('id', courseIds),
        supabase.from('announcements').select('id, course_id, title, body, created_at').in('course_id', courseIds).order('created_at', { ascending: false }),
      ])

      if (!active) return
      if (courseResult.error || announcementResult.error) {
        setError(courseResult.error?.message || announcementResult.error?.message)
      }
      const coursesById = new Map((courseResult.data || []).map((course) => [course.id, course]))
      setAnnouncements((announcementResult.data || []).map((announcement) => ({
        ...announcement,
        courseCode: coursesById.get(announcement.course_id)?.course_code || 'Course',
      })))
      setLoading(false)
    }

    loadAnnouncements()
    return () => { active = false }
  }, [userId])

  return (
    <Dashboard title="Student dashboard" description="Updates from your enrolled courses.">
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Course announcements</h2>
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <p className="mt-5 text-sm text-slate-500">Loading announcements…</p> : announcements.length === 0 ? <p className="mt-5 text-sm text-slate-500">There are no announcements for your courses yet.</p> : (
          <ul className="mt-5 divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{announcement.courseCode}</p>
                  <time className="text-xs text-slate-400" dateTime={announcement.created_at}>{formatDate(announcement.created_at)}</time>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{announcement.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Dashboard>
  )
}
