// Metrics tracking
let startTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let lastSyncTimestamp = null;

export const metrics = {
  incrementRequests: () => requestCount++,
  incrementErrors: () => errorCount++,
  updateLastSync: () => { lastSyncTimestamp = new Date().toISOString(); },
  
  getMetrics: () => ({
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    lastSync: lastSyncTimestamp,
    requestCount,
    errorCount,
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
  }),

  reset: () => {
    requestCount = 0;
    errorCount = 0;
  }
};
