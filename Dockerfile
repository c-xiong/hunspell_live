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

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 8000

CMD sh -c 'if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then \
    /wait-for-it.sh $POSTGRES_HOST:$POSTGRES_PORT -t 60 -- \
    python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    gunicorn --bind 0.0.0.0:$PORT --timeout 120 core.wsgi:application; \
    else \
    python manage.py runserver 0.0.0.0:8000; \
    fi'