const express = require('express');
const cors = require('cors');
const path = require('path');
const simulator = require('./simulator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Get cluster status
app.get('/api/status', (req, res) => {
  res.json(simulator.getStatus());
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  res.json(simulator.getJobs());
});

// Submit a new job
app.post('/api/jobs', (req, res) => {
  const { name, duration, employeeName } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Job name is required' });
  }
  const job = simulator.submitJob(name, duration || 10000, employeeName || 'Anonymous');
  res.status(201).json(job);
});

// Delete all jobs (reset simulation)
app.delete('/api/jobs', (req, res) => {
  simulator.jobs = [];
  simulator.activeOnPremJobs = 0;
  simulator.activeCloudJobs = 0;
  simulator.cloudCapacity = 0;
  res.sendStatus(204);
});

// React Catch-all route
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HPC Simulator Backend running on http://localhost:${PORT}`);
});
