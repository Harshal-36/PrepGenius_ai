import pdfplumber
import whisper
import subprocess

# Load model once
model = whisper.load_model("base")


# 📄 PDF → TEXT
def extract_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


# 🎙️ AUDIO → TEXT
def audio_to_text(file_path):
    result = model.transcribe(file_path)
    return result["text"]


# 🎥 VIDEO → AUDIO → TEXT
def video_to_text(file_path):
    audio_path = file_path + ".wav"

    subprocess.call([
        "ffmpeg", "-i", file_path, audio_path
    ])

    return audio_to_text(audio_path)