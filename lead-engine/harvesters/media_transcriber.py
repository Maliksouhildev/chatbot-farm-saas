# =============================================================================
# Lead Engine Media Transcriber & Multimodal Intelligence
# Handles Groq Whisper Free-Tier Voice Note Transcription (<500ms latency)
# and Google Gemini 1.5/2.0 Flash Multimodal Analysis (Videos, Images, PDFs)
# Direct HTTP/REST via httpx - ZERO heavy dependencies, 100% async
# =============================================================================

import os
import io
import base64
import logging
from typing import Dict, Any, Optional, Union

import httpx

from config import settings

logger = logging.getLogger("media_transcriber")
logger.setLevel(logging.INFO)

GROQ_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions"


class MediaTranscriber:
    """
    Multimodal engine for voice notes and video/footage understanding.
    Powers hands-free mobile Telegram commands and intelligent media routing.
    """

    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        self.openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        self.gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")

    async def transcribe_voice_note(
        self,
        audio_input: Union[str, bytes],
        filename: str = "voice_note.ogg",
    ) -> Dict[str, Any]:
        """
        Transcribes voice notes using Groq's high-speed Whisper Large v3 Turbo (<500ms).
        Falls back to OpenAI Whisper or deterministic simulation mode.
        """
        # Read raw bytes
        if isinstance(audio_input, str):
            if not os.path.exists(audio_input):
                return {
                    "text": "",
                    "language": "en",
                    "status": "error",
                    "error": f"Audio file not found: {audio_input}",
                }
            with open(audio_input, "rb") as f:
                audio_bytes = f.read()
            filename = os.path.basename(audio_input)
        else:
            audio_bytes = audio_input

        # 1. Try Groq Free-Tier Whisper Large V3 Turbo
        if self.groq_key:
            try:
                headers = {"Authorization": f"Bearer {self.groq_key}"}
                files = {"file": (filename, audio_bytes, "audio/ogg")}
                data = {
                    "model": "whisper-large-v3-turbo",
                    "response_format": "verbose_json",
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        GROQ_TRANSCRIPTION_URL,
                        headers=headers,
                        files=files,
                        data=data,
                    )
                    if resp.status_code == 200:
                        payload = resp.json()
                        text = payload.get("text", "").strip()
                        lang = payload.get("language", "ar")
                        logger.info(f"Groq Whisper transcribed voice note successfully ({len(text)} chars).")
                        return {
                            "text": text,
                            "language": lang,
                            "engine": "groq_whisper_turbo",
                            "status": "success",
                        }
                    else:
                        logger.warning(f"Groq API error {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error during Groq Whisper transcription: {e}")

        # 2. Try OpenAI Whisper if Groq failed or unconfigured
        if self.openai_key and self.openai_key.startswith("sk-"):
            try:
                headers = {"Authorization": f"Bearer {self.openai_key}"}
                files = {"file": (filename, audio_bytes, "audio/ogg")}
                data = {"model": "whisper-1"}
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        OPENAI_TRANSCRIPTION_URL,
                        headers=headers,
                        files=files,
                        data=data,
                    )
                    if resp.status_code == 200:
                        payload = resp.json()
                        text = payload.get("text", "").strip()
                        return {
                            "text": text,
                            "language": "ar",
                            "engine": "openai_whisper",
                            "status": "success",
                        }
                    else:
                        logger.warning(f"OpenAI Whisper error {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error during OpenAI Whisper transcription: {e}")

        # 3. Fallback Heuristic / Offline Test Mode
        logger.info("Transcriber running in fallback/test simulation mode.")
        sample_transcript = "Je cherche des boutiques de parfums partout en Algérie pour automatiser leurs commandes WhatsApp"
        return {
            "text": sample_transcript,
            "language": "fr",
            "engine": "offline_fallback_simulation",
            "status": "simulated",
            "note": "Configure GROQ_API_KEY in .env for live whisper-large-v3-turbo transcription.",
        }

    async def analyze_multimodal_media(
        self,
        media_input: Union[str, bytes],
        mime_type: str = "video/mp4",
        prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyzes video footage, images, or documents via Google Gemini 1.5/2.0 Flash REST API.
        Extracts project scope, demo contents, or client requirements.
        """
        if isinstance(media_input, str):
            if not os.path.exists(media_input):
                return {
                    "summary": f"Media file not found: {media_input}",
                    "status": "error",
                }
            with open(media_input, "rb") as f:
                media_bytes = f.read()
        else:
            media_bytes = media_input

        system_instruction = (
            "You are a multimodal AI assistant for Malik Souhil's B2B automation agency in Algeria. "
            "Analyze the provided video footage, image, or document. "
            "Identify what the media demonstrates (e.g. e-commerce product preview, CRM demo, Yalidine tracking test, or client objection). "
            "Provide: 1) Brief summary, 2) Technical/operational highlights, 3) Recommended message in Algerian Darija Arabizi or French to forward to the client."
        )

        effective_prompt = prompt or "Analyze this footage or document and generate a client-facing explanation."

        # 1. Try Gemini Flash if key is configured
        if self.gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                b64_data = base64.b64encode(media_bytes).decode("utf-8")

                payload = {
                    "systemInstruction": {"parts": [{"text": system_instruction}]},
                    "contents": [
                        {
                            "parts": [
                                {"text": effective_prompt},
                                {
                                    "inlineData": {
                                        "mimeType": mime_type,
                                        "data": b64_data,
                                    }
                                },
                            ]
                        }
                    ],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800},
                }

                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "summary": text,
                            "mime_type": mime_type,
                            "engine": "gemini-1.5-flash",
                            "status": "success",
                        }
                    else:
                        logger.warning(f"Gemini API returned {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Gemini multimodal analysis error: {e}")

        # 2. Resilient Fallback Simulator
        return {
            "summary": "Demo video received: Demonstrates 24/7 WhatsApp AI Bot with automated Yalidine waybill generation for e-commerce.",
            "mime_type": mime_type,
            "engine": "offline_fallback_simulation",
            "suggested_client_pitch_darija": "Salam khouya! Chouf la vidéo hadi, fiha démo ta3 le bot kifach yconfirmé les commandes direct f Yalidine bla ma tkatbo b yedkom.",
            "status": "simulated",
            "note": "Configure GEMINI_API_KEY in .env for live multimodal video & vision analysis.",
        }


media_transcriber = MediaTranscriber()
