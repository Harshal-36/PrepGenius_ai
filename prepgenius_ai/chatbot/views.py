from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UploadedFile
from .serializers import FileUploadSerializer
from .utils import extract_pdf, audio_to_text, video_to_text
from .models import UploadedFile
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

    try:
        file = UploadedFile.objects.get(id=file_id)
    except UploadedFile.DoesNotExist:
        return Response({"error": "File not found"}, status=404)

    context = file.extracted_text[:4000]

    prompt = f"""
    You are an AI tutor.

    Based only on the content below, answer the question.

    Content:
    {context}

    Question:
    {question}

    Answer clearly.
    """

    result = call_grok(prompt)
    print(result)
    print("API KEY:", os.getenv("GROK_API_KEY"))
    print("EXTRACTED TEXT:", file.extracted_text)


    answer = result.get("choices", [{}])[0].get("message", {}).get("content", "")

    return Response({
        "question": question,
        "answer": answer
    })