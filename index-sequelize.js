const express = require('express')
const cors = require('cors')
//require('dotenv').config()
const { checkSchema, validationResult } = require('express-validator')
const { Sequelize, DataTypes } = require('sequelize')

const port = 3065

const app = express()

app.use(express.json())
app.use(cors())

// Initialize Sequelize with database credentials
const sequelize = new Sequelize('task-sql-march-24', 'priya1417', 'Debashis@1417', {
  host: '127.0.0.1',
  dialect: 'mysql',
})

// const sequelize = new Sequelize('task-sql-march-24', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
//     host: '127.0.0.1',
//     dialect: 'mysql',
    

//   },console.log(process.env.DB_USERNAME),
//   console.log(process.env.DB_PASSWORD))

// Define Task model
const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
    allowNull: false,
  }
},{
    timestamps: false, // Add timestamps to the model
  });


// Sync the model with the database
(async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync() // This will sync all defined models with the database
    //console.log('Database synchronized')
  } catch (error) {
    console.error('Error connecting to the database:', error)
  }
})()

// Validation schemas
const taskValidationSchema = {
  title: {
    in: ['body'],
    exists: {
      errorMessage: 'Title field is required',
    },
    notEmpty: {
      errorMessage: 'Title cannot be empty',
    },
    trim: true,
  },
  description: {
    in: ['body'],
    exists: {
      errorMessage: 'Description field is required',
    },
    notEmpty: {
      errorMessage: 'Description cannot be empty',
    },
    trim: true,
  },
  status: {
    in: ['body'],
    exists: {
      errorMessage: 'Status field is required',
    },
    notEmpty: {
      errorMessage: 'Status cannot be empty',
    },
    isIn: {
      options: [['pending', 'in-progress', 'completed']],
      errorMessage: 'Status should be one of pending, in-progress, or completed',
    },
  },
}
// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await sequelize.models.Task.findAll()
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/tasks', checkSchema(taskValidationSchema), async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
  
    const { title, description, status } = req.body;
    const newTask = await sequelize.models.Task.create({ title, description, status })
    res.status(201).json({ message: 'Task created successfully', task: newTask })
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// GET request to retrieve a single task by ID
app.get('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id
      const task = await sequelize.models.Task.findByPk(taskId)
      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }
      res.json(task)
    } catch (error) {
      console.error('Error fetching task:', error)
      res.status(500).json({ error: 'Something went wrong' })
    }
  })
  
  // PUT request to update an existing task by ID
  app.put('/api/tasks/:id', checkSchema(taskValidationSchema), async (req, res) => {
    try {
      const taskId = req.params.id
      const task = await sequelize.models.Task.findByPk(taskId)
      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }
  
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
  
      const { title, description, status } = req.body
      await task.update({ title, description, status })
      res.json({ message: 'Task updated successfully', task })
    } catch (error) {
      console.error('Error updating task:', error)
      res.status(500).json({ error: 'Something went wrong' })
    }
  })
  
  // DELETE request to delete a task by ID
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const task = await sequelize.models.Task.findByPk(taskId)
      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }
      await task.destroy();
      res.json({ message: 'Task deleted successfully',task })
    } catch (error) {
      console.error('Error deleting task:', error)
      res.status(500).json({ error: 'Something went wrong' })
    }
  })
  

app.listen(port, () => {
  console.log('Server running on port', port)
})
