import json
import re
import os
import requests
from typing import Dict, Any, Optional
from app.config import settings

class GroqLLMClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
        self.primary_model = settings.PRIMARY_MODEL # gemma2-9b-it
        self.secondary_model = settings.SECONDARY_MODEL # llama-3.3-70b-versatile

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def generate(self, prompt: str, system_prompt: str = "", model: str = None, json_mode: bool = True) -> str:
        target_model = model or self.primary_model
        if not self.is_available():
            raise ValueError("Groq API Key not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": 0.1,
            "max_tokens": 2048
        }
        if json_mode and "gemma" not in target_model.lower():
            # Groq JSON mode for supported models
            payload["response_format"] = {"type": "json_object"}

        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            elif target_model != self.secondary_model:
                # Retry with secondary model
                payload["model"] = self.secondary_model
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                if res.status_code == 200:
                    return res.json()["choices"][0]["message"]["content"]
                else:
                    raise Exception(f"Groq API Error {res.status_code}: {res.text}")
            else:
                raise Exception(f"Groq API Error {res.status_code}: {res.text}")
        except Exception as e:
            raise e

def clean_json_response(text: str) -> Dict[str, Any]:
    """Helper to clean markdown code fences and parse JSON safely"""
    cleaned = re.sub(r"```json\s*", "", text)
    cleaned = re.sub(r"```\s*", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        # Fallback regex search for { ... }
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError(f"Could not parse valid JSON from text: {text[:100]}...")
