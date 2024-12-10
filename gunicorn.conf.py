# gunicorn.conf.py
import os
import multiprocessing

# Number of workers based on CPU cores
workers = multiprocessing.cpu_count() * 2 + 1
bind = "0.0.0.0:8080"
timeout = 120
# Add these recommended settings
worker_class = "gthread"
threads = 2
max_requests = 1000
max_requests_jitter = 50
keepalive = 5