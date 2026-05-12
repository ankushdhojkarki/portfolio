from django.shortcuts import render
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
import json
import logging
import random
from core import settings
from .models import Project, Skill, ContactMessage, Quote
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import ProjectSerializer, SkillSerializer
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

# Create your views here.
@ensure_csrf_cookie
def home(request):
    projects = Project.objects.all().order_by('-date_created')
    skills = Skill.objects.all()
    context = {
        'projects': projects,
        'skills': skills,
    }
    return render(request, 'index.html', context)

@require_POST
def contact(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not all([name, email, message]):
            return JsonResponse({'success': False, 'error': 'All fields are required.'}, status=400)


        ContactMessage.objects.create(name=name, email=email, message=message)

        send_mail(
            subject = f'New message from {name}',
            message = f'Email: {email}\n\n{message}',
            from_email= settings.DEFAULT_FROM_EMAIL,
            recipient_list= ['ankushdhojkarki@gmail.com'],
        )
        return JsonResponse({'success': True})

    except Exception as e:
        logger.exception(e)
        return JsonResponse({'success': False, 'error': 'Something went wrong.'}, status=500)

def random_quote(request):
    quotes = list(Quote.objects.filter(is_active=True))
    if quotes:
        q = random.choice(quotes)
        return JsonResponse({'text': q.text, 'author': q.author})
    return JsonResponse({'text': 'Let the beauty of what you love be what you do.', 'author': 'Rumi'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_list(request):
    projects = Project.objects.all()
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def skill_list(request):
    skills = Skill.objects.all()
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)