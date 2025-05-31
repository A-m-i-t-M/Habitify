import promClient from 'prom-client';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'habitify-backend'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsersGauge = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(activeUsersGauge);

// Middleware to track HTTP request metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Record the end of the request
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(method, route, statusCode)
      .observe(duration / 1000); // Convert to seconds
    
    httpRequestCounter
      .labels(method, route, statusCode)
      .inc();
  });
  
  next();
};

export { register, metricsMiddleware, activeUsersGauge };
