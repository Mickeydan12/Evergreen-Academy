import { useEffect, useState } from 'react'

const api = (path, method = 'GET', body) =>
  fetch('/api/' + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json())

const money = n => '$' + n.toLocaleString() // change the currency here

function Dashboard() {
  const [s, setS] = useState(null)
  useEffect(() => { api('stats').then(setS) }, [])
  if (!s) return <p>Loading…</p>
  return (
    <>
      <h1>Overview</h1>
      <section className="hero">
        <div className="big">{s.rate}%</div>
        <div>
          <h2>of term fees collected</h2>
          <div className="bar"><span style={{ width: s.rate + '%' }} /></div>
          <p>{money(s.paid)} received, {money(s.pending)} still owed</p>
        </div>
      </section>
      <section className="stats">
        {[['Students', s.students], ['Teachers', s.teachers], ['Classes', s.classes]].map(([l, v]) => (
          <div key={l}><b>{v}</b><span>{l}</span></div>
        ))}
      </section>
    </>
  )
}

function Crud({ path, title, noun, fields }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({})
  const load = () => api(path).then(setRows)
  useEffect(() => { load() }, [path])
  const add = async e => { e.preventDefault(); await api(path, 'POST', form); setForm({}); load() }
  const del = async id => { await api(`${path}/${id}`, 'DELETE'); load() }
  return (
    <>
      <h1>{title}</h1>
      <form className="add" onSubmit={add}>
        {fields.map(f => (
          <input key={f.k} placeholder={f.label} aria-label={f.label} required
            value={form[f.k] || ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
        ))}
        <button>Add {noun}</button>
      </form>
      <div className="wrap">
        <table>
          <thead><tr>{fields.map(f => <th key={f.k}>{f.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                {fields.map(f => <td key={f.k}>{r[f.k]}</td>)}
                <td><button className="ghost" onClick={() => del(r.id)}>Remove</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={fields.length + 1}>No {title.toLowerCase()} yet. Add the first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Fees() {
  const [rows, setRows] = useState([])
  const load = () => api('fees').then(setRows)
  useEffect(() => { load() }, [])
  const pay = async id => { await api(`fees/${id}/pay`, 'POST'); load() }
  return (
    <>
      <h1>Fees</h1>
      <div className="wrap">
        <table>
          <thead><tr><th>Student</th><th>Amount</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.student}</td><td>{money(r.amount)}</td>
                <td><span className={'tag ' + r.status}>{r.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                <td>{r.status !== 'paid' && <button className="ghost" onClick={() => pay(r.id)}>Mark as paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const pages = {
  Overview: () => <Dashboard />,
  Students: () => <Crud path="students" title="Students" noun="student"
    fields={[{ k: 'name', label: 'Full name' }, { k: 'grade', label: 'Grade' }, { k: 'guardian', label: 'Guardian' }]} />,
  Teachers: () => <Crud path="teachers" title="Teachers" noun="teacher"
    fields={[{ k: 'name', label: 'Full name' }, { k: 'subject', label: 'Subject' }, { k: 'email', label: 'Email' }]} />,
  Classes: () => <Crud path="classes" title="Classes" noun="class"
    fields={[{ k: 'name', label: 'Class' }, { k: 'teacher', label: 'Teacher' }, { k: 'room', label: 'Room' }]} />,
  Fees: () => <Fees />,
}

export default function App() {
  const [page, setPage] = useState('Overview')
  return (
    <div className="app">
      <nav>
        <div className="brand">Evergreen Academy</div>
        {Object.keys(pages).map(p => (
          <button key={p} className={p === page ? 'on' : ''} onClick={() => setPage(p)}>{p}</button>
        ))}
      </nav>
      <main>{pages[page]()}</main>
    </div>
  )
}
