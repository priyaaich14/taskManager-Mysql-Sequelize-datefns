const mongoose = require('mongoose')

const { Schema, model } = mongoose

const taskSchema = new Schema({
    title: String,
    description:String,
    status:String,
  },{timestamps:true})

  const Task = model('Task', taskSchema)

  module.exports = Task