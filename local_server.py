#!/usr/bin/env python3
"""Local constructor server with direct Chromium PDF export."""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent


def browser_path() -> str | None:
    configured = os.environ.get("OCHERKI_CHROME", "").strip()
    candidates = [
        configured,
        shutil.which("chrome"), shutil.which("chromium"), shutil.which("chromium-browser"),
        shutil.which("msedge"), shutil.which("google-chrome"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    return None


class Handler(SimpleHTTPRequestHandler):
    # Text files are sent as UTF-8 explicitly, so Cyrillic in CSS and JS
    # (quotes, dashes, hints) never shows as «Â».
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
    }
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path != "/api/export-pdf":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 512 * 1024 * 1024:
                raise ValueError("Недопустимый размер задания")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            html = str(payload.get("html", ""))
            if "book-print-sheet" not in html:
                raise ValueError("В книге нет подготовленных страниц")
            browser = browser_path()
            if not browser:
                raise RuntimeError("Не найден Google Chrome или Microsoft Edge")

            with tempfile.TemporaryDirectory(prefix=".ocherki_pdf_", dir=ROOT) as tmp:
                tmp_dir = Path(tmp)
                html_path = tmp_dir / "book.html"
                pdf_path = tmp_dir / "book.pdf"
                html_path.write_text(html, encoding="utf-8")
                command = [
                    browser, "--headless=new", "--disable-gpu", "--no-sandbox",
                    "--allow-file-access-from-files", "--disable-pdf-tagging",
                    "--print-to-pdf-no-header", "--no-pdf-header-footer",
                    "--force-device-scale-factor=3.125",
                    f"--print-to-pdf={pdf_path}", html_path.as_uri(),
                ]
                result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=180)
                if result.returncode != 0 or not pdf_path.exists() or pdf_path.stat().st_size < 1000:
                    detail = result.stderr.decode("utf-8", "ignore")[-500:]
                    raise RuntimeError("Браузер не создал PDF" + (f": {detail}" if detail else ""))
                data = pdf_path.read_bytes()

            filename = str(payload.get("filename") or "family-chronicle.pdf")
            safe = "".join(ch for ch in filename if ch.isalnum() or ch in " ._-()").strip() or "family-chronicle.pdf"
            if not safe.lower().endswith(".pdf"):
                safe += ".pdf"
            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            encoded_name = quote(safe, safe="")
            self.send_header(
                "Content-Disposition",
                f'attachment; filename="family-chronicle.pdf"; filename*=UTF-8\'\'{encoded_name}',
            )
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as exc:
            data = json.dumps({"error": str(exc)}, ensure_ascii=False).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8847)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Очерки жизни: http://127.0.0.1:{args.port}/index.html", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
