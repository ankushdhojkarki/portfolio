from django.contrib import admin
from .models import Project, Skill, ContactMessage

# Register your models here.
admin.site.register([Project, Skill, ContactMessage])
