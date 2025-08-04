import mongoose from 'mongoose';
import { sprintSchema } from './sprint.js';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  sprints: {
    type: [sprintSchema],
    default: []
  },
  progress: { type: Number, default: 0 }
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
