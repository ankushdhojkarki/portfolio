from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact, name='contact'),
    path('api/quote/', views.random_quote, name='random_quote'),
    path('api/projects/', views.project_list, name='projectlist_api'),
    path('api/skill/', views.skill_list, name='skilllist_api'),
]
