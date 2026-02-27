FROM python:3.11-slim

WORKDIR /app

COPY . ./backend

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
