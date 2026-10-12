import React, { useEffect, useMemo, useState } from 'react'
import { api, getToken } from './api'
import {
  GraduationCap, LayoutDashboard, Users, Search, Plus, LogOut, ShieldCheck,
  BookOpen, TrendingUp, UserRound, Bell, ChevronRight, Pencil, Trash2,
  X, Menu, CircleUserRound, ArrowUpRight, LockKeyhole, Sparkles
} from 'lucide-react'

const blank = { studentCode:'', fullName:'', age:18, branch:'ECE', yearOfStudy:1, marks:0, email:'', password:'' }
const demoRows = [
  { id:1, studentCode:'EU2401', fullName:'Aarav Sharma', age:19, branch:'ECE', yearOfStudy:2, marks:86, email:'aarav@example.com' },
  { id:2, studentCode:'EU2402', fullName:'Diya Reddy', age:20, branch:'CSE', yearOfStudy:3, marks:92, email:'diya@example.com' },
  { id:3, studentCode:'EU2403', fullName:'Ishaan Rao', age:19, branch:'EEE', yearOfStudy:2, marks:71, email:'ishaan@example.com' },
  { id:4, studentCode:'EU2404', fullName:'Ananya Patel', age:21, branch:'ECE', yearOfStudy:4, marks:88, email:'ananya@example.com' },
]
export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edupilot_session')) } catch { return null }
  })
  const [loginRole, setLoginRole] = useState('ADMIN')
  const [email, setEmail] = useState('admin@edupilot.local')
  const [password, setPassword] = useState('ChangeMe123!')
  const [loginError, setLoginError] = useState('')
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState('dashboard')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

  useEffect(() => {
    if (session && getToken()) refresh()
    else if (session && !getToken()) logout()
  }, [])

  async function refresh(q = search) {
    if (!session) return
    try {
      if (session.role === 'ADMIN') setStudents(await api(`/students${q ? `?q=${encodeURIComponent(q)}` : ''}`))
      else setStudents([await api('/students/me')])
      setApiAvailable(true)
    } catch (e) {
      setApiAvailable(false)
      setError(e.message + ' — check that the backend and database are running.')
    }
  }
  useEffect(() => {
    if (!session) return
    const timer = setTimeout(() => refresh(search), 250)
    return () => clearTimeout(timer)
  }, [search, session?.role])

  async function signIn(e) {
    e.preventDefault(); setBusy(true); setLoginError('')
    try {
      const result = await api('/auth/login', { method:'POST', body:JSON.stringify({ email, password }) })
      if (result.role !== loginRole) throw new Error(`This account is ${result.role.toLowerCase()}. Choose the matching portal.`)
      localStorage.setItem('edupilot_token', result.token)
      const next = { role:result.role, email:result.email }
      localStorage.setItem('edupilot_session', JSON.stringify(next))
      setSession(next); setPage('dashboard'); setError('')
      if (result.role === 'ADMIN') setStudents(await api('/students'))
      else setStudents([await api('/students/me')])
    } catch (e) { setLoginError(e.message || 'Unable to sign in.') }
    finally { setBusy(false) }
  }
  function logout() {
    localStorage.removeItem('edupilot_token'); localStorage.removeItem('edupilot_session')
    setSession(null); setStudents([]); setPage('dashboard'); setLoginError('')
  }
  function openCreate() { setEditing(null); setForm(blank); setError(''); setModal(true) }
  function openEdit(s) {
    setEditing(s); setForm({ ...s, password:'' }); setError(''); setModal(true)
  }
  async function saveStudent(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (editing && !form.password) throw new Error('For this starter, enter a temporary/reset password when saving an edited student.')
      const body = { ...form, age:Number(form.age), yearOfStudy:Number(form.yearOfStudy), marks:Number(form.marks) }
      await api(editing ? `/students/${editing.id}` : '/students', {
        method:editing ? 'PUT' : 'POST', body:JSON.stringify(body)
      })
      setModal(false); setNotice(editing ? 'Student record updated.' : 'Student account created.')
      await refresh()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  async function removeStudent(s) {
    if (!confirm(`Delete ${s.fullName} and their login account? This cannot be undone.`)) return
    try { await api(`/students/${s.id}`, { method:'DELETE' }); setNotice('Student deleted.'); await refresh() }
    catch(e) { setError(e.message) }
  }

  const isAdmin = session?.role === 'ADMIN'
  const rows = students
  const average = rows.length ? Math.round(rows.reduce((sum,s)=>sum+(Number(s.marks)||0),0)/rows.length) : 0
  const above80 = rows.filter(s => Number(s.marks) >= 80).length
  const needsSupport = rows.filter(s => Number(s.marks) < 75).length

  if (!session) return <Login role={loginRole} setRole={setLoginRole} email={email} setEmail={setEmail}
    password={password} setPassword={setPassword} onSubmit={signIn} busy={busy} error={loginError} />

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'open':''}`}>
      <div className="brand"><div className="brand-icon"><GraduationCap size={23}/></div><div><b>EduPilot</b><small>STUDENT SYSTEM</small></div><button className="icon-btn mobile-close" onClick={()=>setSidebarOpen(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>
        <button className={`nav-item ${page==='dashboard'?'active':''}`} onClick={()=>{setPage('dashboard');setSidebarOpen(false)}}><LayoutDashboard size={18}/> Overview</button>
        {isAdmin && <button className={`nav-item ${page==='students'?'active':''}`} onClick={()=>{setPage('students');setSidebarOpen(false)}}><Users size={18}/> Students <span className="nav-count">{rows.length}</span></button>}
        {!isAdmin && <button className={`nav-item ${page==='profile'?'active':''}`} onClick={()=>setPage('profile')}><UserRound size={18}/> My profile</button>}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><b>Keep growing</b><p>Small steps every day lead to meaningful progress.</p></div>
        <div className="account-row"><div className="avatar">{isAdmin?'AD':(session.email||'ST').slice(0,2).toUpperCase()}</div><div className="account-meta"><b>{isAdmin?'Administrator':'Student account'}</b><small>{session.email}</small></div><button className="icon-btn" title="Log out" onClick={logout}><LogOut size={17}/></button></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setSidebarOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{page==='students'?'Students':page==='profile'?'My profile':'Overview'}</b></div><div className="top-actions"><span className="live-pill"><span/> {apiAvailable?'Connected':'API offline'}</span><button className="icon-btn notification" title="Notifications"><Bell size={18}/></button><div className="avatar small">{isAdmin?'AD':'ST'}</div></div></header>
      <div className="content">
        {error && !modal && <div className="alert error"><span>{error}</span><button onClick={()=>setError('')}><X size={16}/></button></div>}
        {notice && <div className="alert success"><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></div>}
        {page==='dashboard' && <Dashboard isAdmin={isAdmin} rows={rows} average={average} above80={above80} needsSupport={needsSupport} onManage={()=>setPage(isAdmin?'students':'profile')} onAdd={openCreate} />}
        {page==='students' && isAdmin && <section>
          <div className="page-heading"><div><div className="eyebrow">DIRECTORY</div><h1>Student management</h1><p>Manage student profiles and account access in one place.</p></div><button className="primary-btn" onClick={openCreate}><Plus size={17}/> Add student</button></div>
          <div className="panel table-panel"><div className="table-toolbar"><div><h3>All students <span className="subtle-count">{rows.length}</span></h3><p>Search by student ID, name, or branch</p></div><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students..."/><kbd>⌕</kbd></div></div>
            <StudentTable rows={rows} onEdit={openEdit} onDelete={removeStudent}/></div>
        </section>}
        {page==='profile' && <section><div className="page-heading"><div><div className="eyebrow">YOUR SPACE</div><h1>My profile</h1><p>Your personal academic information.</p></div></div><div className="profile-grid">{rows.map(s=><div className="panel profile-card" key={s.id}><div className="profile-cover"><div className="profile-avatar">{s.fullName?.split(' ').map(x=>x[0]).slice(0,2).join('')}</div></div><h2>{s.fullName}</h2><p className="muted">{s.studentCode} · {s.branch}</p><div className="profile-details">{[['Student ID',s.studentCode],['Age',s.age],['Branch',s.branch],['Year',`Year ${s.yearOfStudy}`],['Marks',`${s.marks}%`],['Email',s.email]].map(([a,b])=><div key={a}><span>{a}</span><b>{b}</b></div>)}</div></div>)}</div></section>}
      </div>
    </main>
    {modal && <StudentModal form={form} setForm={setForm} editing={editing} onClose={()=>setModal(false)} onSubmit={saveStudent} busy={busy} error={error}/>}
  </div>
}

function Login({ role, setRole, email, setEmail, password, setPassword, onSubmit, busy, error }) {
  return <div className="login-layout"><div className="login-visual"><div className="login-brand"><div className="brand-icon"><GraduationCap size={24}/></div><b>EduPilot</b></div><div className="visual-copy"><div className="eyebrow">ONE CAMPUS. ONE CONNECTED SPACE.</div><h1>Every student.<br/><span>Every possibility.</span></h1><p>A smarter, simpler way to manage student records and keep academic information within reach.</p><div className="visual-stat-row"><div><b>01</b><span>Centralized records</span></div><div><b>02</b><span>Role-based access</span></div><div><b>03</b><span>Academic visibility</span></div></div></div><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-footer">EDUPILOT · STUDENT MANAGEMENT SYSTEM</div></div>
    <div className="login-side"><div className="login-card"><div className="login-mobile-logo"><div className="brand-icon"><GraduationCap/></div><b>EduPilot</b></div><div className="login-welcome"><div className="eyebrow">WELCOME BACK</div><h2>Sign in to your portal</h2><p>Choose your account type to continue.</p></div>
      <div className="role-switch"><button className={role==='ADMIN'?'selected':''} onClick={()=>{setRole('ADMIN');setEmail('admin@edupilot.local')}}><ShieldCheck size={17}/> Admin</button><button className={role==='STUDENT'?'selected':''} onClick={()=>{setRole('STUDENT');setEmail('')}}><GraduationCap size={18}/> Student</button></div>
      <form onSubmit={onSubmit} className="login-form"><label>Email address</label><div className="input-wrap"><UserRound size={17}/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@college.edu"/></div><label>Password</label><div className="input-wrap"><LockKeyhole size={17}/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></div>
        {error && <div className="form-error">{error}</div>}<button className="primary-btn login-submit" disabled={busy}>{busy?'Signing in...':'Sign in securely'} <ArrowUpRight size={17}/></button></form>
      <div className="login-security"><ShieldCheck size={16}/><span>Secure sign-in · Role-based access control</span></div><p className="login-hint">Admin demo credentials are configured in the backend environment. Change the default password before use.</p></div><div className="login-side-footer">© 2026 EduPilot <span>Privacy-first student records</span></div></div></div>
}

function Dashboard({ isAdmin, rows, average, above80, needsSupport, onManage, onAdd }) {
  return <section><div className="page-heading"><div><div className="eyebrow">YOUR CAMPUS AT A GLANCE</div><h1>{isAdmin?'Overview dashboard':'Welcome to your dashboard'}</h1><p>{isAdmin?'A clear view of your student records and academic snapshot.':'Your academic information, organized in one place.'}</p></div>{isAdmin&&<button className="primary-btn" onClick={onAdd}><Plus size={17}/> Add student</button>}</div>
    <div className="welcome-banner"><div><div className="welcome-chip"><Sparkles size={14}/> {isAdmin?'ADMIN WORKSPACE':'STUDENT WORKSPACE'}</div><h2>{isAdmin?'Good systems create room for great outcomes.':'Your progress is your own story.'}</h2><p>{isAdmin?'Keep student information organized, accessible, and up to date.':'Review your academic details and stay connected to your learning journey.'}</p></div><div className="banner-art"><div className="art-circle circle-a"/><div className="art-circle circle-b"/><GraduationCap size={66}/></div></div>
    <div className="stats-grid"><Stat icon={<Users/>} label={isAdmin?'Total students':'Your record'} value={isAdmin?rows.length:rows.length?'1':'0'} note={isAdmin?'Registered student profiles':'Personal academic profile'} tone="purple"/><Stat icon={<TrendingUp/>} label="Average marks" value={rows.length?`${average}%`:'—'} note="Across visible records" tone="green"/><Stat icon={<BookOpen/>} label={isAdmin?'Scoring 80%+':'Your marks'} value={rows.length?(isAdmin?above80:`${rows[0]?.marks ?? 0}%`):'—'} note={isAdmin?'Strong performance snapshot':'Latest recorded marks'} tone="blue"/><Stat icon={<ShieldCheck/>} label={isAdmin?'Below 75%':'Access level'} value={isAdmin?needsSupport:'Student'} note={isAdmin?'Review records needing attention':'Personal records only'} tone="orange"/></div>
    <div className="dashboard-bottom"><div className="panel recent-panel"><div className="panel-heading"><div><h3>{isAdmin?'Recently managed students':'Academic summary'}</h3><p>{isAdmin?'A quick view of student records.':'Your profile at a glance.'}</p></div>{isAdmin&&<button className="text-btn" onClick={onManage}>View directory <ChevronRight size={15}/></button>}</div>{isAdmin?<StudentTable rows={rows.slice(0,5)} compact/>:rows.length?<div className="summary-grid">{[['Student ID',rows[0].studentCode],['Branch',rows[0].branch],['Year',`Year ${rows[0].yearOfStudy}`],['Marks',`${rows[0].marks}%`]].map(([k,v])=><div className="summary-item" key={k}><span>{k}</span><b>{v}</b></div>)}</div>:<EmptyState/>}</div>
      <div className="panel insight-panel"><div className="panel-heading"><div><h3>{isAdmin?'Academic snapshot':'Your progress'}</h3><p>{isAdmin?'Quick indicators from saved marks.':'A simple view of your recorded marks.'}</p></div><div className="insight-icon"><TrendingUp size={19}/></div></div><div className="chart-summary"><div className="chart-number">{rows.length?`${average}%`:'—'}<small>Average marks</small></div><div className="mini-bars">{[42,64,53,80,62,91,72,86,67,95,75,88].map((v,i)=><div key={i} style={{height:`${v}%`}} className={i===9?'bar-highlight':''}/>)}</div></div><div className="chart-legend"><span><i/> Marks snapshot</span><span>Illustrative visual</span></div><div className="insight-note"><Sparkles size={16}/><span>{isAdmin?'Use academic indicators as prompts for supportive review, not as final judgments.':'Keep checking your academic record for updated information.'}</span></div></div></div>
  </section>
}
function Stat({ icon, label, value, note, tone }) { return <div className="panel stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div> }
function StudentTable({ rows, onEdit, onDelete, compact=false }) {
  if (!rows.length) return <EmptyState/>
  return <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>BRANCH / YEAR</th><th>MARKS</th>{!compact&&onEdit&&<th>ACTIONS</th>}</tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><div className="student-cell"><div className="student-avatar">{s.fullName?.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>{s.fullName}</b><small>{s.email}</small></div></div></td><td><span className="code-pill">{s.studentCode}</span></td><td><b>{s.branch}</b><small className="table-sub">Year {s.yearOfStudy}</small></td><td><div className="mark-cell"><div className="mark-track"><span style={{width:`${Math.max(0,Math.min(100,Number(s.marks)||0))}%`}}/></div><b>{s.marks}%</b></div></td>{!compact&&onEdit&&<td><div className="row-actions"><button className="icon-btn" title="Edit" onClick={()=>onEdit(s)}><Pencil size={16}/></button><button className="icon-btn danger-icon" title="Delete" onClick={()=>onDelete(s)}><Trash2 size={16}/></button></div></td>}</tr>)}</tbody></table></div>
}
function StudentModal({ form, setForm, editing, onClose, onSubmit, busy, error }) {
  const update=(key,value)=>setForm(f=>({...f,[key]:value}))
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-header"><div><div className="eyebrow">{editing?'UPDATE RECORD':'NEW RECORD'}</div><h2>{editing?'Edit student':'Add a student'}</h2><p>{editing?'Update the profile and reset credentials.':'Create a student profile and login account.'}</p></div><button className="icon-btn" onClick={onClose}><X/></button></div><form onSubmit={onSubmit}><div className="form-grid">
    <div className="field"><label>Student ID</label><input required value={form.studentCode} onChange={e=>update('studentCode',e.target.value)} placeholder="e.g. EU2405"/></div>
    <div className="field"><label>Full name</label><input required value={form.fullName} onChange={e=>update('fullName',e.target.value)} placeholder="Student full name"/></div>
    <div className="field"><label>Age</label><input type="number" min="16" max="100" required value={form.age} onChange={e=>update('age',e.target.value)}/></div>
    <div className="field"><label>Branch</label><select value={form.branch} onChange={e=>update('branch',e.target.value)}>{['ECE','CSE','EEE','MECH','CIVIL','IT','Other'].map(b=><option key={b}>{b}</option>)}</select></div>
    <div className="field"><label>Year of study</label><select value={form.yearOfStudy} onChange={e=>update('yearOfStudy',e.target.value)}>{[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}</select></div>
    <div className="field"><label>Marks (%)</label><input type="number" min="0" max="100" required value={form.marks} onChange={e=>update('marks',e.target.value)}/></div>
    <div className="field full"><label>Student email</label><input type="email" required value={form.email} onChange={e=>update('email',e.target.value)} placeholder="student@college.edu"/></div>
    <div className="field full"><label>{editing?'Reset password':'Temporary password'}</label><input type="password" minLength="8" required={!editing} value={form.password} onChange={e=>update('password',e.target.value)} placeholder="At least 8 characters"/><small className="field-help">The password is stored as a BCrypt hash, never as plain text.</small></div>
    </div>{error&&<div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={busy}>{busy?'Saving...':editing?'Save changes':'Create student'}</button></div></form></div></div>
}
function EmptyState(){return <div className="empty-state"><div className="empty-icon"><Users size={23}/></div><b>No student records yet</b><p>Add a student to begin building your directory.</p></div>}
