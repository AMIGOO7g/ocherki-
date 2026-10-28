"""Read-only TEST MODE launcher. It never accepts or persists test content."""
import argparse
import secrets
import socket
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
FILES = frozenset(('test-mode.html', 'test-mode.css', 'test-mode.js', 'test-mode-state.js', 'test-mode-runner.html', 'test-mode-runner.js'))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, token, **kwargs):
        self.token = token
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path):
        name = unquote(urlsplit(path).path)
        prefix = '/' + self.token + '/'
        if not name.startswith(prefix):
            return str(ROOT / '__not_available__')
        relative = name.removeprefix(prefix)
        target = (ROOT / relative).resolve()
        allowed = relative in FILES or relative.startswith('book-renderer/') and target.suffix in ('.js', '.css', '.woff2') or relative == 'assets/fonts/SignThatS.otf'
        if not allowed or not target.is_relative_to(ROOT) or not target.is_file():
            return str(ROOT / '__not_available__')
        return str(target)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        super().end_headers()

    def log_message(self, *args):
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8851)
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    token = secrets.token_urlsafe(16)
    server = ThreadingHTTPServer(('0.0.0.0', args.port), partial(Handler, token=token))
    local = f'http://127.0.0.1:{args.port}/{token}/test-mode.html'
    print('TEST MODE — компьютер и телефон в одной сети Wi-Fi.', flush=True)
    print('На компьютере: ' + local, flush=True)
    try:
        addresses = sorted({item[4][0] for item in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)} - {'127.0.0.1'})
    except OSError:
        addresses = []
    for address in addresses:
        print(f'На телефоне: http://{address}:{args.port}/{token}/test-mode.html', flush=True)
    if not addresses:
        print('Замените 127.0.0.1 в ссылке на локальный IP компьютера из ipconfig.', flush=True)
    print('Оставьте это окно открытым. Для остановки — Ctrl+C.', flush=True)
    if not args.no_open:
        webbrowser.open(local)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
