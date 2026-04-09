const { v4: uuidv4 } = require('uuid');

class HPCSimulator {
  constructor() {
    this.jobs = [];
    this.onPremCapacity = 5;
    this.cloudCapacity = 0; // Dynamic capacity based on burst
    this.activeOnPremJobs = 0;
    this.activeCloudJobs = 0;

    // Start event loop for simulation
    setInterval(() => this.tick(), 2000);
  }

  submitJob(name, durationMs = 10000, employeeName = 'Anonymous') {
    const job = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      employeeName,
      status: 'PENDING',
      submittedAt: Date.now(),
      duration: durationMs,
      type: 'N/A', // ON_PREM or CLOUD
    };
    this.jobs.push(job);
    return job;
  }

  getJobs() {
    return this.jobs;
  }

  getStatus() {
    return {
      onPremCapacity: this.onPremCapacity,
      activeOnPremJobs: this.activeOnPremJobs,
      activeCloudJobs: this.activeCloudJobs,
    };
  }

  async processOnPrem(job) {
    job.status = 'RUNNING_ON_PREM';
    job.type = 'ON_PREM';
    this.activeOnPremJobs++;
    
    setTimeout(() => {
      job.status = 'COMPLETED';
      this.activeOnPremJobs--;
    }, job.duration);
  }

  async processCloudBurst(job) {
    job.type = 'CLOUD';
    this.activeCloudJobs++;
    this.cloudCapacity++;

    // Simulating Cloud Provisioning
    job.status = 'PROVISIONING_CLOUD';
    await new Promise(r => setTimeout(r, 4000));
    if (job.status !== 'PROVISIONING_CLOUD') return; // Job might be cancelled? Just in case.

    // Simulating Data Transfer
    job.status = 'TRANSFERRING_DATA';
    await new Promise(r => setTimeout(r, 3000));

    // Simulating Execution in Cloud
    job.status = 'RUNNING_CLOUD';
    await new Promise(r => setTimeout(r, job.duration));

    // Simulating Teardown
    job.status = 'TEARING_DOWN_CLOUD';
    await new Promise(r => setTimeout(r, 3000));

    job.status = 'COMPLETED';
    this.activeCloudJobs--;
    this.cloudCapacity--;
  }

  tick() {
    const pendingJobs = this.jobs.filter(j => j.status === 'PENDING');
    
    pendingJobs.forEach(job => {
      // Try on-prem first
      if (this.activeOnPremJobs < this.onPremCapacity) {
        this.processOnPrem(job);
      } else {
        // Burst to cloud!
        this.processCloudBurst(job);
      }
    });
  }
}

module.exports = new HPCSimulator();
