
from django.urls import path
from . import views


urlpatterns = [
    path('test/', views.test_api),
    path("upload/", views.upload_file),
    path("ask/", views.ask_question),
    path('history/<int:file_id>/', views.get_chat_history),
]