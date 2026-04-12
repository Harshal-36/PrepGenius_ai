from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UploadedFile
from .serializers import FileUploadSerializer
from .utils import extract_pdf, audio_to_text, video_to_text
from .models import UploadedFile
from .models import ChatHistory
from .utils import call_grok
import os

@api_view(['GET'])
def test_api(request):
    return Response({"message": "PrepGenius AI backend working 🚀"})


from .utils import extract_pdf, audio_to_text, video_to_text

@api_view(['POST'])
def upload_file(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file provided"}, status=400)

    obj = UploadedFile.objects.create(
        file=file,
        file_type=file.name.split('.')[-1]
    )

    file_path = obj.file.path

    # Extract text
    if file.name.endswith('.pdf'):
        text = extract_pdf(file_path)

    elif file.name.endswith(('.mp3', '.wav')):
        text = audio_to_text(file_path)

    elif file.name.endswith('.mp4'):
        text = video_to_text(file_path)

    else:
        return Response({"error": "Unsupported file type"})

    obj.extracted_text = text
    obj.save()

    return Response({
        "message": "File processed successfully",
        "preview": text[:300]
    })

@api_view(['POST'])
def ask_question(request):
    file_id = request.data.get('file_id')
    question = request.data.get('question')

    file = UploadedFile.objects.get(id=file_id)

    context = file.extracted_text

    prompt = f"""
    You are an AI tutor.

    Content:
    {context}

    Question:
    {question}
    """

    result = call_grok(prompt)

    answer = result.get("choices", [{}])[0].get("message", {}).get("content", "")

    # 🔥 SAVE CHAT
    ChatHistory.objects.create(
        file=file,
        question=question,
        answer=answer
    )

    return Response({
        "question": question,
        "answer": answer
    })


@api_view(['GET'])
def get_chat_history(request, file_id):
    chats = ChatHistory.objects.filter(file_id=file_id).order_by('-created_at')

    data = []
    for chat in chats:
        data.append({
            "question": chat.question,
            "answer": chat.answer,
            "time": chat.created_at
        })

    return Response(data)