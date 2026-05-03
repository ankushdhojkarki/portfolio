from django.db import models

# Create your models here.
class Project(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    image = models.ImageField(upload_to='project_images/')
    github_link = models.URLField(blank=True, null=True)
    live_link = models.URLField(blank=True, null=True)
    in_progress = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Skill(models.Model):
    name = models.CharField(max_length=100)
    icon_url = models.URLField()
    order = models.PositiveBigIntegerField(default=0)

    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.created_at.strftime('%Y-%m-%d %I:%M %p')}"
    
    class Meta:
        ordering = ['-created_at']

class Quote(models.Model):
    text = models.TextField()
    author = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'"{self.text[:50]}..." - {self.author}'