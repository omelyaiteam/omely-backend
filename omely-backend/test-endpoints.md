# OMELY Backend - Endpoints de Test

## Endpoints Disponibles

### 1. Health Check
```bash
GET https://omely-node-backend.fly.dev/health
```

### 2. PDF Summarization
```bash
POST https://omely-node-backend.fly.dev/summarize/pdf
Content-Type: multipart/form-data

file: [fichier PDF]
```

### 3. Audio Summarization (MP3)
```bash
POST https://omely-node-backend.fly.dev/summarize/audio
Content-Type: multipart/form-data

file: [fichier MP3]
```

### 4. Video Summarization (MP4)
```bash
POST https://omely-node-backend.fly.dev/summarize/video
Content-Type: multipart/form-data

file: [fichier MP4]
```

## Exemples de Test avec PowerShell

### Test PDF
```powershell
$pdfFile = "test.pdf"
$form = @{
    file = Get-Item $pdfFile
}
Invoke-RestMethod -Uri "https://omely-node-backend.fly.dev/summarize/pdf" -Method POST -Form $form
```

### Test Audio
```powershell
$audioFile = "test.mp3"
$form = @{
    file = Get-Item $audioFile
}
Invoke-RestMethod -Uri "https://omely-node-backend.fly.dev/summarize/audio" -Method POST -Form $form
```

### Test Video
```powershell
$videoFile = "test.mp4"
$form = @{
    file = Get-Item $videoFile
}
Invoke-RestMethod -Uri "https://omely-node-backend.fly.dev/summarize/video" -Method POST -Form $form
```

## Réponse Attendue

```json
{
  "status": "success",
  "summary": "Résumé généré par OpenAI...",
  "metadata": {
    "source": "pdf|audio|video",
    "filename": "nom_du_fichier",
    "extractionTime": 1234,
    "transcriptionTime": 5678,
    "summarizationTime": 9012,
    "totalProcessingTime": 15924,
    "textLength": 5000,
    "summaryLength": 500
  }
}
```

## Fonctionnalités

- ✅ **PDF** : Extraction de texte + résumé avec OpenAI
- ✅ **Audio MP3** : Transcription Whisper + résumé avec OpenAI  
- ✅ **Vidéo MP4** : Extraction audio + transcription Whisper + résumé avec OpenAI
- ✅ **Stable et fiable** : Pas de dépendances externes instables
- ✅ **Rapide** : Optimisé pour le MVP
