from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UploadedFile
from .serializers import FileUploadSerializer
from .utils import extract_pdf, audio_to_text, video_to_text

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