import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';

// Models
import Sprint from './models/sprint.js';
import Project from './models/project.js';
import Team from './models/team.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


// Middleware

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dreamy-starburst-5c6c0e.netlify.app'
  ],
  credentials: true
}));


app.use(express.json());

// ✅ Direct MongoDB URI (for practice only)
mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Logger middleware
app.use((req, res, next) => {
  console.clear();
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// ===== Project Routes =====

// Get all projects (with populated sprints)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('sprints');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add sprint to project
// Add sprint to project
app.put('/api/projects/:projectId/sprints', async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprintData = req.body.sprint;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.sprints.push(sprintData); // ✅ push full sprint object
    await project.save();

    res.status(200).json({ message: 'Sprint added successfully', sprint: sprintData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add task to sprint
// Add task to embedded sprint inside project
// PUT: Add a task to a sprint inside a project
app.put('/api/projects/:projectId/sprints/:sprintId/tasks', async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;
    const { task } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const sprint = project.sprints.find(s => s.id == sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });

    sprint.tasks = sprint.tasks || [];
    sprint.tasks.push(task);

    await project.save();
    res.json({ message: 'Task added', project });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const update = req.body;

    const updatedProject = await Project.findByIdAndUpdate(projectId, update, {
      new: true,
      runValidators: true
    });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (err) {
    console.error('❌ Error updating project:', err);
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
});
// ✅ Get single project by ID
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('❌ Error fetching project:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== Team Routes =====

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamLead')
      .populate('developers')
      .populate('assignedProjects')
      .populate('sprintAssignments.projectId')
      .populate('sprintAssignments.sprintId')
      .populate('sprintAssignments.developerIds');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamLead') // optionally populate team lead
      .populate('developers') // optionally populate developers
      .populate('assignedProjects') // THIS IS CRUCIAL
    res.json(teams)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
})


// Update team
app.put('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign sprint to team
app.put('/api/teams/:id/assign-sprint', async (req, res) => {
  try {
    const { projectId, sprintId, developerIds } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) return res.status(404).json({ message: 'Team not found' });

    team.sprintAssignments.push({ projectId, sprintId, developerIds });
    await team.save();

    res.json({ message: 'Sprint assigned successfully', team });
  } catch (err) {
    console.error('❌ Error assigning sprint:', err);
    res.status(500).json({ message: 'Failed to assign sprint' });
  }
});
// Create a new team
app.post('/api/teams', async (req, res) => {
  try {
    const { teamLead, developers, assignedProjects = [], sprintAssignments = [] } = req.body;

    const newTeam = new Team({
      teamLead,
      developers,
      assignedProjects,
      sprintAssignments
    });

    const savedTeam = await newTeam.save();

    // Optionally populate related fields
    const populatedTeam = await Team.findById(savedTeam._id)
      .populate('teamLead')
      .populate('developers')
      .populate('assignedProjects')
      .populate('sprintAssignments.projectId')
      .populate('sprintAssignments.sprintId')
      .populate('sprintAssignments.developerIds');

    res.status(201).json(populatedTeam);
  } catch (err) {
    console.error('❌ Error creating team:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});



// ===== User Routes =====

import mongoosePkg from 'mongoose';
const { Schema, model } = mongoosePkg;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  role: String,
  available: { type: Number, default: 0 }
});

const User = model('User', userSchema);

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, 10);
    const created = await User.create(user);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/projects/:projectId/sprints/:sprintId/tasks', async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;
    const { task } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const sprint = project.sprints.find(s =>
      s._id?.toString() === sprintId || s.id?.toString() === sprintId
    );

    if (!sprint) {
      console.log('Sprint not found. Existing sprints:', project.sprints.map(s => s._id?.toString() || s.id));
      return res.status(404).json({ message: 'Sprint not found' });
    }

    const taskIndex = sprint.tasks.findIndex(t => t._id.toString() === task._id);
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

    sprint.tasks[taskIndex] = task;
    await project.save();

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// ===== Start Server =====
app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
