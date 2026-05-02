from django.shortcuts import render
from .models import Project

# Create your views here.
def home(request):
    projects = Project.objects.all().order_by('-date_created')
    context = {
        'projects': projects
    }
    return render(request, 'index.html', context)
