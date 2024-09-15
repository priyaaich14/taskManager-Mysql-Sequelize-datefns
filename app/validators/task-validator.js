const taskvalidationSchema ={
    title:{
        in:['body'],
        exists:{
            errorMessage:'title is required'
        },
        notEmpty:{
            errorMessage:'title cannot be empty'
        },
        trim:true
    },
    description:{
        in:['body'],
        exists:{
            errorMessage:'description is required'
        },
        notEmpty:{
            errorMessage:'description cannot be empty'
        },
        trim:true
    },
    status:{
        in:['body'],
        exists:{
            errorMessage:'status is required'
        },
        notEmpty:{
            errorMessage:'status cannot be empty'
        },
        isIn:{
            options:[['pending','in progress','completed']]
        }
    }
}
const idValidationSchema = {
  id:{
    in:['params'],
    isMongoId:{
      errorMessage:'Invalid object Id format'
    }
  }
}
module.exports = {
    taskvalidationSchema,
    idValidationSchema
}