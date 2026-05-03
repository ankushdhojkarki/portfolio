from django.shortcuts import render
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from .models import Project, Skill, ContactMessage

# Create your views here.
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
    data = json.loads(request.body)

    name = data['name']
    email = data['email']
    message = data['message']

    ContactMessage.objects.create(name=name, email=email, message=message)

    send_mail(
        subject = f'New message from {name}',
        message = f'Email: {email}\n\n{message}',
        from_email= email,
        recipient_list= ['ankushdhojkarki@gmail.com'],
    )

    return JsonResponse({'success': True})