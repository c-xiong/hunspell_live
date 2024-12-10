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

# 移除 COPY .env 命令
COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

# 修改 CMD 命令，并修正 wsgi 路径
CMD sh -c 'if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then \
    gunicorn --bind 0.0.0.0:$PORT core.wsgi:application; \
    else \
    python manage.py runserver 0.0.0.0:8000; \
    fi'