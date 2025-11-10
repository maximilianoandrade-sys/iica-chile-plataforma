import time
from typing import Optional
import requests
from bs4 import BeautifulSoup


def fetch_html(url: str, timeout: int = 20, retries: int = 2, headers: Optional[dict] = None) -> Optional[str]:
    effective_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        **(headers or {}),
    }
    last_exc = None
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, timeout=timeout, headers=effective_headers)
            if resp.status_code == 200:
                return resp.text
        except Exception as exc:
            last_exc = exc
            time.sleep(1.0)
    return None


def parse_with_bs4(html: str) -> BeautifulSoup:
    """
    Parsea HTML usando BeautifulSoup.
    Usa html.parser por defecto (compatible con Render y otros servicios).
    """
    return BeautifulSoup(html, "html.parser")


