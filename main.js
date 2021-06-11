const express = require('express')
const cookieParser = require('cookie-parser')

const teacherRouter = require('./controllers/teacher')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())

app.use(teacherRouter)

app.listen(port, () => console.log(`Server is up at ${port}`))