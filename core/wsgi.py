"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Run collectstatic on startup (Vercel serverless)
from django.core.management import call_command
try:
    call_command('collectstatic', '--noinput', '--clear')
except Exception as e:
    print(f"collectstatic failed: {e}")

application = get_wsgi_application()
