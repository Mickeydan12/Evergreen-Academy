import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors(), express.json())

let nextId = 100
const db = {
  students: [
    { id: 1, name: 'Amara Okafor', grade: 'Grade 7', guardian: 'Ngozi Okafor' },
    { id: 2, name: 'Daniel Mensah', grade: 'Grade 8', guardian: 'Efua Mensah' },
    { id: 3, name: 'Fatima Bello', grade: 'Grade 9', guardian: 'Musa Bello' },
    { id: 4, name: 'Tunde Adeyemi', grade: 'Grade 7', guardian: 'Bola Adeyemi' },
  ],
  teachers: [
    { id: 1, name: 'Mrs. Ijeoma Eze', subject: 'Mathematics', email: 'eze@school.edu' },
    { id: 2, name: 'Mr. Kwame Boateng', subject: 'Science', email: 'boateng@school.edu' },
    { id: 3, name: 'Ms. Halima Yusuf', subject: 'English', email: 'yusuf@school.edu' },
  ],
  classes: [
    { id: 1, name: 'Grade 7', teacher: 'Mrs. Ijeoma Eze', room: 'A1' },
    { id: 2, name: 'Grade 8', teacher: 'Mr. Kwame Boateng', room: 'B2' },
    { id: 3, name: 'Grade 9', teacher: 'Ms. Halima Yusuf', room: 'C3' },
  ],
  fees: [
    { id: 1, student: 'Amara Okafor', amount: 450, status: 'paid' },
    { id: 2, student: 'Daniel Mensah', amount: 450, status: 'pending' },
    { id: 3, student: 'Fatima Bello', amount: 500, status: 'paid' },
    { id: 4, student: 'Tunde Adeyemi', amount: 450, status: 'pending' },
  ],
}

for (const name of ['students', 'teachers', 'classes']) {
  app.get(`/api/${name}`, (_, res) => res.json(db[name]))
  app.post(`/api/${name}`, (req, res) => {
    const row = { id: nextId++, ...req.body }
    db[name].push(row)
    res.status(201).json(row)
  })
  app.delete(`/api/${name}/:id`, (req, res) => {
    db[name] = db[name].filter(r => r.id !== Number(req.params.id))
    res.json({ ok: true })
  })
}

app.get('/api/fees', (_, res) => res.json(db.fees))
app.post('/api/fees/:id/pay', (req, res) => {
  const fee = db.fees.find(f => f.id === Number(req.params.id))
  if (!fee) return res.status(404).json({ error: 'Fee record not found' })
  fee.status = 'paid'
  res.json(fee)
})

app.get('/api/stats', (_, res) => {
  const total = db.fees.reduce((s, f) => s + f.amount, 0)
  const paid = db.fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0)
  res.json({
    students: db.students.length, teachers: db.teachers.length, classes: db.classes.length,
    paid, pending: total - paid, rate: total ? Math.round((paid / total) * 100) : 0,
  })
})

app.listen(5000, () => console.log('API running on http://localhost:5000'))
