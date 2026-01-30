from django.urls import path
from . import views

urlpatterns = [
    path('', views.time_display, name='time_display'),
]