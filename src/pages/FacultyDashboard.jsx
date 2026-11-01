import { useContext, useEffect, useState } from 'react'
import Dashboard from '../components/Dashboard'
import { AuthContext } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'
const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100'

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function FacultyDashboard() {
  const { session } = useContext(AuthContext)
  const userId = session.user.id
  const [courses, setCourses] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [courseId, setCourseId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Edit mode state: which announcement is being edited, and its draft values
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // READ: load courses and this faculty member's announcements
  async function loadData(showSpinner = true) {
    if (showSpinner) setLoading(true)
    setError('')

    const [courseResult, announcementResult] = await Promise.all([
      supabase.from('courses').select('id, course_code').eq('faculty_id', userId).order('course_code'),
      supabase.from('announcements').select('id, course_id, title, body, created_at').eq('author_id', userId).order('created_at', { ascending: false }),
    ])

    if (courseResult.error || announcementResult.error) {
      setError(courseResult.error?.message || announcementResult.error?.message)
    }
    setCourses(courseResult.data || [])
    setAnnouncements(announcementResult.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [userId])

  // CREATE: post a new announcement
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: insertError } = await supabase.from('announcements').insert({
      course_id: courseId,
      title: title.trim(),
      body: body.trim(),
      author_id: userId,
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setTitle('')
    setBody('')
    setCourseId('')
    await loadData(false)
    setSubmitting(false)
  }

  // Switch a card into edit mode with its current values prefilled
  function startEdit(announcement) {
    setEditingId(announcement.id)
    setEditTitle(announcement.title)
    setEditBody(announcement.body)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditBody('')
  }

  // UPDATE: save the edited title and message
  async function handleSaveEdit(id) {
    setError('')
    setSavingEdit(true)

    const { error: updateError } = await supabase
      .from('announcements')
      .update({ title: editTitle.trim(), body: editBody.trim() })
      .eq('id', id)

    setSavingEdit(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    cancelEdit()
    await loadData(false)
  }

  // DELETE: remove an announcement after confirmation
  async function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return
    setError('')

    const { error: deleteError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadData(false)
  }

  const courseById = new Map(courses.map((course) => [course.id, course]))

  return (
    <Dashboard title="Faculty dashboard" description="Share updates with students in your courses.">
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className={cardClass}>
          <h2 className="text-xl font-semibold text-slate-900">Post an announcement</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a course and write an update for its students.</p>
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Course
              <select required value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={loading || courses.length === 0} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100">
                <option value="">{loading ? 'Loading courses…' : courses.length ? 'Select a course' : 'No courses assigned'}</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.course_code}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Title
              <input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="Announcement title" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Message
              <textarea required rows={5} value={body} onChange={(event) => setBody(event.target.value)} className={`${inputClass} resize-y`} placeholder="Write your announcement…" />
            </label>
            <button type="submit" disabled={submitting || loading || courses.length === 0} className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Posting…' : 'Post announcement'}
            </button>
          </form>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold text-slate-900">Your announcements</h2>
          {loading ? <p className="mt-5 text-sm text-slate-500">Loading announcements…</p> : announcements.length === 0 ? <p className="mt-5 text-sm text-slate-500">You haven’t posted any announcements yet.</p> : (
            <ul className="mt-5 divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="py-5 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{courseById.get(announcement.course_id)?.course_code || 'Course'}</p>

                  {editingId === announcement.id ? (
                    // EDIT MODE: inline form with Save and Cancel
                    <div className="mt-2 space-y-3">
                      <input value={editTitle} maxLength={160} onChange={(event) => setEditTitle(event.target.value)} className={inputClass} />
                      <textarea rows={4} value={editBody} onChange={(event) => setEditBody(event.target.value)} className={`${inputClass} resize-y`} />
                      <div className="flex gap-3">
                        <button type="button" onClick={() => handleSaveEdit(announcement.id)} disabled={savingEdit || !editTitle.trim() || !editBody.trim()} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                        <button type="button" onClick={cancelEdit} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE: announcement details with Edit and Delete buttons
                    <>
                      <h3 className="mt-1 font-semibold text-slate-900">{announcement.title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.body}</p>
                      <time className="mt-3 block text-xs text-slate-400" dateTime={announcement.created_at}>{formatDate(announcement.created_at)}</time>
                      <div className="mt-4 flex gap-3">
                        <button type="button" onClick={() => startEdit(announcement)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(announcement.id)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Dashboard>
  )
}