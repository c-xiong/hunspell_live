FROM python:3.9

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code

RUN apt-get update && apt-get install -y \
    build-essential \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD sh -c 'if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then \
    python manage.py collectstatic --noinput && \
    gunicorn --bind 0.0.0.0:$PORT core.wsgi:application; \
    else \
    python manage.py runserver 0.0.0.0:8000; \
    fi'