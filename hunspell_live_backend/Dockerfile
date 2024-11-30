FROM python:3.9

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code

RUN apt-get update && apt-get install -y \
    build-essential \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Create directory for dictionary config
RUN mkdir -p /code/dicts_config

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

# Add gunicorn to requirements
RUN pip install gunicorn

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
