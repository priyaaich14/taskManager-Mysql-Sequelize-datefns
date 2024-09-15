const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const { checkSchema, validationResult } = require('express-validator')
const port = 3014;
const app = express()

app.use(express.json())
app.use(cors())

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'priya1417',
  password: 'Debashis@1417',
  database: 'TASK-SQL-MARCH-24',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const taskValidationSchema = {
  title: {
    in: ['body'],
    exists: {
      errorMessage: 'title field is required'
    },
    notEmpty: {
      errorMessage: 'title cannot be empty'
    },
    trim: true
  },
  description: {
    in: ['body'],
    exists: {
      errorMessage: 'description field is required'
    },
    notEmpty: {
      errorMessage: 'description cannot be empty'
    },
    trim: true
  },
  status: {
    in: ['body'],
    exists: {
      errorMessage: 'status field is required'
    },
    notEmpty: {
      errorMessage: 'status cannot be empty'
    },
    isIn: {
      options: [['pending', 'in-progress','completed']],
      errorMessage: 'status should be one of pending, in-progress or completed'
    }
  }
}

const idValidationSchema = {
  id: {
    in: ['params'],
    isInt: {
      errorMessage: 'Invalid task Id'
    }
  }
}

app.get('/api/tasks', (req, res) => {
  pool.query('SELECT * FROM tasks', (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: 'Something went wrong' })
    }
    res.json(results)
  })
})

app.post('/api/tasks', checkSchema(taskValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
  
    const { title, description, status } = req.body;
    pool.query('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)', [title, description, status], (error, results, fields) => {
      if (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' })
      }
      const insertedTask = {
        id: results.insertId,
        title,
        description,
        status
      }
      res.status(201).json({ message: 'Task created successfully', task: insertedTask })
    })
  })
  

app.get('/api/tasks/:id', checkSchema(idValidationSchema), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { id } = req.params
  pool.query('SELECT * FROM tasks WHERE id = ?', [id], (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: 'Something went wrong' })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(results[0])
  })
})

app.delete('/api/tasks/:id', checkSchema(idValidationSchema), (req, res) => {
    const { id } = req.params
  
    // Fetch the task to be deleted
    pool.query('SELECT * FROM tasks WHERE id = ?', [id], (selectError, selectResults, selectFields) => {
      if (selectError) {
        return res.status(500).json({ error: 'Something went wrong while fetching task to be deleted' })
      }
      if (selectResults.length === 0) {
        return res.status(404).json({ error: 'Task to be deleted not found' })
      }
  
      const deletedTask = selectResults[0]
  
      // Delete the task from the database
      pool.query('DELETE FROM tasks WHERE id = ?', [id], (deleteError, deleteResults, deleteFields) => {
        if (deleteError) {
          return res.status(500).json({ error: 'Something went wrong while deleting task' })
        }
        if (deleteResults.affectedRows === 0) {
          return res.status(404).json({ error: 'Record not found' })
        }
  
        // Respond with the deleted task data along with success message
        res.json({ message: 'Task deleted successfully', deletedTask })
      })
    })
  })
  
app.put('/api/tasks/:id', checkSchema(idValidationSchema), checkSchema(taskValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { id } = req.params
    const { title, description, status } = req.body
  
    pool.query('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?', [title, description, status, id], (error, results, fields) => {
      if (error) {
        return res.status(500).json({ error: 'Something went wrong' })
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Record not found' })
      }
  // Fetch the updated task from the database
      pool.query('SELECT * FROM tasks WHERE id = ?', [id], (selectError, selectResults, selectFields) => {
        if (selectError) {
          return res.status(500).json({ error: 'Something went wrong while fetching updated task' })
        }
        if (selectResults.length === 0) {
          return res.status(404).json({ error: 'Updated record not found' })
        }
        const updatedTask = selectResults[0]
        res.json({ message: 'Task updated successfully', task: updatedTask })
      })
    })
  })
app.listen(port, () => {
  console.log('Server running on port', port)
})
