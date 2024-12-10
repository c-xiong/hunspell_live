# gunicorn.conf.py
import os

workers = 4
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
timeout = 120