const Task = require('../model/task-model')
const {validationResult} = require('express-validator')
const { format } = require('date-fns')
const taskCltr = {}

taskCltr.list = (req,res)=>{
    const { status, sortBy, sortOrder, page, limit } = req.query
  
    // Define filter criteria
    const filter = {}
    if (status && ['pending', 'in progress', 'completed'].includes(status)) {
      filter.status = status
    }
  
    // Define sort options
    let sort = {}
    if (sortBy && ['createdAt', 'updatedAt'].includes(sortBy)) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    }
  
    // Pagination options
    const options = {
      sort,
      skip: (parseInt(page) - 1) * parseInt(limit), // Convert page and limit to integers
      limit: parseInt(limit)
    }
  
    Task.find(filter, null, options)
      .then((tasks) => {
        // Convert tasks dates to IST format before sending response
        const tasksWithIST = tasks.map(task => convertToIST(task))
        res.json(tasksWithIST)
        //res.json(tasks)
      })
      .catch((err) => {
        res.status(500).json({ error: err.message })
      })
}
taskCltr.create = (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
  const body = req.body
  const task = new Task(body) // Include status in the task creation
  task.save()
    .then((savedTask) => {
      // Send the saved task as response with timestamps in IST format
     res.status(201).json(convertToIST(savedTask))
    //res.status(201).json(savedTask)
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
    })
}
taskCltr.show = (req, res) => {
    const errors = validationResult(req)
      if(!errors.isEmpty()){
          return res.status(400).json({errors:errors.array()})
      }
    const { id } = req.params
    Task.findById(id)
      .then((task) => {
        if (!task) {
          return res.status(404).json({ error: 'Task not found' })
        }
        // Convert task dates to IST format before sending response
        res.json(convertToIST(task))
      })
      .catch((err) => {
        res.status(500).json({ error: err.message })
      })
  }
  taskCltr.remove = (req, res) => {
    const { id } = req.params
    Task.findByIdAndDelete(id)
      .then((deletedTask) => {
        if (!deletedTask) {
          return res.status(404).json({ error: 'Task not found' })
        }
        // Send the deleted task as response with timestamps in IST format
        res.json(convertToIST(deletedTask))
      })
      .catch((err) => {
        res.status(500).json({ error: err.message })
      })
  }

  taskCltr.update = (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
  const { id } = req.params
  const body = req.body
  Task.findByIdAndUpdate(id, { ...body }, { new: true})
    .then((updatedTask) => {
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' })
      }
      // Send the updated task as response with timestamps in IST format
      res.json(convertToIST(updatedTask))
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
    })
}

function convertToIST(task) {
        const istDateFormat = 'yyyy-MM-dd HH:mm:ss' // Desired IST format string
        return {
          ...task.toObject(),
          createdAt: format(task.createdAt, istDateFormat),
          updatedAt: format(task.updatedAt, istDateFormat),
        }
      }

module.exports = taskCltr