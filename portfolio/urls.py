from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'api/projects', views.ProjectViewSet, basename = 'project')
router.register(r'api/skills', views.SkillViewSet, basename='skill')

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact, name='contact'),
    path('api/quote/', views.random_quote, name='random_quote'),
] + router.urls
