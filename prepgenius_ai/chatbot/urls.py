
from django.urls import path
from . import views


urlpatterns = [
    path('test/', views.test_api),
    path("upload/", views.upload_file),
    path("ask/", views.ask_question)
]