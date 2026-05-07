#!/bin/bash
PYTHONPATH=/vercel/path0/.vercel_python_packages python manage.py collectstatic --noinput --clear
PYTHONPATH=/vercel/path0/.vercel_python_packages python manage.py migrate