from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import UploadedFile
from .serializers import FileUploadSerializer
from .utils import extract_pdf, audio_to_text, video_to_text
from .models import UploadedFile
from .models import ChatHistory
from .utils import call_grok
import os
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User


@api_view(['GET'])
def test_api(request):
    return Response({"message": "PrepGenius AI backend working 🚀"})


@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password
    )

    return Response({"message": "User created successfully"})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def ask_question(request):
    file_id = request.data.get('file_id')
    question = request.data.get('question', "")
    mode = request.data.get('mode', 'qa')  # default = question answering

    try:
        file = UploadedFile.objects.get(id=file_id)
    except UploadedFile.DoesNotExist:
        return Response({"error": "File not found"}, status=404)

    context = file.extracted_text

    if not context:
        return Response({"error": "No extracted text found for this file"}, status=400)

    # 🔥 Dynamic Prompt Based on Mode
    if mode == "notes":
        prompt = f"""
        Create short and clear notes from the content below.

        Use headings and bullet points.

        Content:
        {context}
        """

    elif mode == "mcq":
        prompt = f"""
        Generate 5 multiple choice questions (MCQs) from the content below.

        Each question should have:
        - 4 options
        - 1 correct answer

        Content:
        {context}
        """

    elif mode == "flashcards":
        prompt = f"""
        Create flashcards from the content below.

        Format:
        Question:
        Answer:

        Content:
        {context}
        """

    elif mode == "interview":
        prompt = f"""
        You are an expert interviewer.

        Generate 5 interview questions based on the content below.

        Content:
        {context}
        """

    else:  # Default Q&A
        prompt = f"""
        You are an AI tutor.

        Answer the question based only on the content below.

        Content:
        {context}

        Question:
        {question}
        """

    # 🔥 Call AI
    result = call_groq(prompt)

    answer = result.get("choices", [{}])[0].get("message", {}).get("content", "")

    # 🔥 Save Chat History
    ChatHistory.objects.create(
        file=file,
        question=question if question else mode,
        answer=answer
    )

    return Response({
        "mode": mode,
        "question": question,
        "answer": answer
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
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