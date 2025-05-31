# Habitify Monitoring Setup

This directory contains the configuration files for setting up Prometheus and Grafana monitoring for the Habitify backend.

## Overview

The monitoring stack consists of:

- **Prometheus**: For collecting and storing metrics from the backend
- **Grafana**: For visualizing metrics and creating dashboards
- **Node Exporter**: For collecting system metrics from the host machine

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your system
- Access to the Habitify backend

### Running the Monitoring Stack

1. Navigate to the monitoring directory:
   ```
   cd monitoring
   ```

2. Start the monitoring stack:
   ```
   docker-compose up -d
   ```

3. Access the services:
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (default credentials: admin/admin)

## Metrics Available

The Habitify backend exposes the following custom metrics:

- `http_request_duration_seconds`: Histogram of HTTP request durations
- `http_requests_total`: Counter of total HTTP requests
- `active_users`: Gauge showing the number of currently active users

## Grafana Dashboards

After setting up Grafana, you can import the following dashboards:

1. Node Exporter Dashboard (ID: 1860)
2. Prometheus Stats (ID: 3662)

You can also create custom dashboards to monitor:

- API endpoint performance
- User activity
- Error rates
- System resource usage

## Integration with CI/CD

The monitoring setup is integrated with GitHub Actions workflows to automate deployment and configuration updates.
