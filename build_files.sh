#!/bin/bash
DATABASE_URL=sqlite:///dummy.db /uv/python/versions/cpython-3.12.13-linux-x86_64-gnu/bin/python manage.py collectstatic --noinput --clear