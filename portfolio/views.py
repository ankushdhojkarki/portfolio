from django.shortcuts import render
from .models import Project, Skill

# Create your views here.
def home(request):
    projects = Project.objects.all().order_by('-date_created')
    skills = Skill.objects.all()
    context = {
        'projects': projects,
        'skills': skills,
    }
    return render(request, 'index.html', context)
