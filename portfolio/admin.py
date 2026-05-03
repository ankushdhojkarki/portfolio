from django.contrib import admin
from .models import Project, Skill

# Register your models here.
admin.site.register([Project, Skill])
