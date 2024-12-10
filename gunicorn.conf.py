# gunicorn.conf.py
import os
import multiprocessing

# Number of workers based on CPU cores
workers = multiprocessing.cpu_count() * 2 + 1
bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
timeout = 120
# Add these recommended settings
worker_class = 'gthread'
threads = 4
max_requests = 1000
max_requests_jitter = 50
keepalive = 5