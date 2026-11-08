# =============================================================================
# Unit Tests: Media Transcriber & Multimodal Intelligence
# =============================================================================

import os
import sys
import asyncio
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from media_transcriber import media_transcriber


def test_transcribe_voice_note_fallback():
    """Verifies that voice note transcription handles audio bytes and returns valid transcript."""
    sample_bytes = b"OggS\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00mock_audio_content"
    result = asyncio.run(media_transcriber.transcribe_voice_note(sample_bytes, filename="voice.ogg"))

    assert result is not None
    assert "text" in result
    assert len(result["text"]) > 0
    assert result["status"] in ["success", "simulated"]
    assert "language" in result


def test_transcribe_voice_note_nonexistent_file():
    """Verifies error handling when a non-existent file path is provided."""
    result = asyncio.run(media_transcriber.transcribe_voice_note("non_existent_audio_file_12345.ogg"))
    assert result["status"] == "error"
    assert "not found" in result["error"].lower()


def test_analyze_multimodal_media_fallback():
    """Verifies that multimodal analysis processes video/image bytes and outputs structured summary."""
    sample_video_bytes = b"\x00\x00\x00\x18ftypmp42mock_mp4_content"
    result = asyncio.run(media_transcriber.analyze_multimodal_media(
        sample_video_bytes,
        mime_type="video/mp4",
        prompt="Explain this CRM and Yalidine demo video to the client",
    ))

    assert result is not None
    assert "summary" in result
    assert result["status"] in ["success", "simulated"]
    assert "mime_type" in result
    assert result["mime_type"] == "video/mp4"


def test_analyze_multimodal_empty_input():
    """Verifies handling of empty byte payload."""
    result = asyncio.run(media_transcriber.analyze_multimodal_media(b"", mime_type="image/jpeg"))
    assert result is not None
    assert "summary" in result
