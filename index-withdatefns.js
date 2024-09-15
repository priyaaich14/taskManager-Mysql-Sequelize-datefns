const express = require('express')
const cors = require('cors')
const {checkSchema} = require('express-validator')
const configureDB = require('./config/db')
const taskCltr = require('./app/controller/task-cltr')
const {taskvalidationSchema,idValidationSchema} = require('./app/validators/task-validator')
const port = 3044

const app = express()
app.use(express.json())
app.use(cors())
configureDB()


// Create Task
app.post('/api/tasks',checkSchema(taskvalidationSchema),taskCltr.create)
// Get Tasks with Filtering, Sorting, and Pagination
app.get('/api/tasks', taskCltr.list)
// Get Task by ID
app.get('/api/tasks/:id',checkSchema(idValidationSchema), taskCltr.show)
// Update Task
app.put('/api/tasks/:id',checkSchema(idValidationSchema),checkSchema(taskvalidationSchema), taskCltr.update)
// Delete Task
app.delete('/api/tasks/:id',checkSchema(idValidationSchema), taskCltr.remove)



app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})


