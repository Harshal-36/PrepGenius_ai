from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UploadedFile
from .serializers import FileUploadSerializer

@api_view(['GET'])
def test_api(request):
    return Response({"message": "PrepGenius AI backend working 🚀"})


@api_view(['POST'])
def upload_file(request):
    serializer = FileUploadSerializer(data=request.data)

    if serializer.is_valid():
        file = request.FILES.get('file')

        obj = serializer.save(
            file_type=file.name.split('.')[-1]
        )

        return Response({
            "message": "File uploaded successfully",
            "data": serializer.data
        })

    return Response(serializer.errors, status=400)