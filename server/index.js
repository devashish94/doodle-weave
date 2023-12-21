const path = require("path")
const express = require('express')
const cors = require('cors')
const db = require('./models/db')
const app = express()

const PORT = process.env.PORT || 4000

const corsOptions = {
  origin: "*"
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.static(path.resolve(__dirname, "public")))

// -----------------------------------------------------------------
app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "login.html"))
})

app.get("/register", function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "register.html"))
})
// -----------------------------------------------------------------

app.post('/login', function (req, res) {
  const { username, password } = req.body
  console.log(username, password)

  const sql = "select user_id, username, password from users where username = ? and password = ?"
  db.query(sql, [username, password], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        message: err
      })
    } else {
      console.log(result)
      if (!result || result.length === 0) {
        return res.json({
          status: "FAIL",
          statusCode: 400,
          isUser: false
        })
      }
      const { user_id } = result[0]
      return res.json({
        status: "OK",
        statusCode: 200,
        isUser: true,
        message: "logged in",
        user_id
      })
    }
  })
})

app.post('/register', function (req, res) {
  const { username, email, password } = req.body

  const sql = "insert into users (username, password, email) values (?, ?, ?)"
  db.query(sql, [username, password, email], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        register: false,
        message: err
      })
    } else {
      return res.json({
        register: true,
        message: "registered",
        username,
        email
      })
    }
  })
})

app.get('/health', function (req, res) {
  res.json({
    status: 'OK',
    statusCode: 200,
    message: "Server is up and running"
  })
})

app.get('/get-name/:id', function (req, res) {
  const { id } = req.params

  const sql = `select project_name from projects where project_id = ?`
  db.query(sql, [id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: "cannot get name from db"
      })
    } else {
      console.log(result)
      res.json(result[0])
    }
  })
})

app.put('/send-data', function (req, res) {
  const { id, history, picture } = req.body

  const sql = 'update projects set history = ?, picture = ? where project_id = ?'
  db.query(sql, [JSON.stringify(history), picture, id], function (err, result) {
    if (err) {
      console.log(err)
      return res.json({
        error: true,
        details: 'failed to insert into db'
      })
    }
    console.log(result)
    return res.json({ status: "ok" })
  })
})

app.get('/project/:id', function (req, res) {
  const id = req.params.id
  const sql = 'select project_id, project_name, created_at, picture, history from projects where project_id = ?'

  db.query(sql, [id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: 'failed to get project data',
        history: [[]]
      })
    }
    const { history, ...rest } = result[0]
    return res.json({ ...rest, history: JSON.parse(history) })
  })
})

app.get('/dashboard/:user_id', function (req, res) {
  const { user_id } = req.params
  const sql = 'select project_id, project_name, created_at, picture from projects where user_id = ?'

  db.query(sql, [user_id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: 'failed to get project data'
      })
    }
    return res.json(result)
  })
})

app.get('/new-project/:user_id', function (req, res) {
  const { user_id } = req.params
  const sql = "insert into projects (user_id, project_name, history, picture) values (?, 'Untitled', '[[]]', '')"

  db.query(sql, [user_id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: 'could not create new project db',
        message: err
      })
    } else {
      return res.json(result)
    }
  })
})

app.put('/update-name', function (req, res) {
  const { project_name, project_id } = req.body
  const sql = "update projects set project_name = ? where project_id = ?"
  db.query(sql, [project_name, project_id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: "cannot update project name",
        message: err
      })
    } else {
      return res.json({
        message: "name updated"
      })
    }
  })
})

app.delete('/delete/:project_id', function (req, res) {
  const { project_id } = req.params
  const sql = "delete from projects where project_id = ?"

  db.query(sql, [project_id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: "could not delete project",
        message: err.message
      })
    } else {
      return res.json({
        ok: true,
        details: `deleted project_id = ${project_id}`
      })
    }
  })
})

app.get('/download/:id', function (req, res) {
  const { id } = req.params
  const sql = "select picture from projects where project_id = ?"

  db.query(sql, [id], function (err, result) {
    if (err) {
      return res.json({
        error: true,
        details: err
      })
    } else {
      const baseImage = result[0].picture
      const imageBuffer = Buffer.from(baseImage.split(",")[1], "base64")

      res.setHeader('Content-disposition', 'attachment; filename=image.png');
      res.setHeader('Content-type', 'image/png');

      res.send(imageBuffer)
    }
  })
})

app.listen(PORT, function () {
  console.log(`Server is running at PORT:${PORT}`)
})
