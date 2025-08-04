import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  developers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  assignedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  sprintAssignments: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId },
      sprintId: { type: mongoose.Schema.Types.ObjectId },
      developerIds: [{ type: mongoose.Schema.Types.ObjectId }]
    }
  ]
});

// THIS IS IMPORTANT
export default mongoose.models.Team || mongoose.model('Team', teamSchema);
