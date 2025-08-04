import mongoose from 'mongoose'

export const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // recommended for reference
    default: null
  }
}, { _id: true }); // ✅ force auto _id for embedded task


export const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  goal: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  tasks: {
    type: [taskSchema],
    default: []
  }
})

// Export the model too if you want to use mongoose.model() version
export default mongoose.models.Sprint || mongoose.model('Sprint', sprintSchema)
