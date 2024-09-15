const mongoose = require('mongoose')

const configureDB = ()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/task-manage-app-24')
  .then((db) => {
    console.log('Connected to DB',db.connections[0].name)
  })

  .catch((err) => {
    console.error('Error connecting to DB:', err)
  })
}
module.exports = configureDB