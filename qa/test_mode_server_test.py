"""HTTP availability and read-only checks; not browser geometry."""
import importlib.util, threading, unittest, urllib.error, urllib.request
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
spec=importlib.util.spec_from_file_location('testserver',Path(__file__).resolve().parents[1]/'test_mode_server.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class ServerTest(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=ThreadingHTTPServer(('127.0.0.1',0),partial(module.Handler,token='qa-token'));cls.worker=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.worker.start();cls.url='http://127.0.0.1:'+str(cls.server.server_port)
 @classmethod
 def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.worker.join()
 def test_shared_assets(self):
  paths=list(module.FILES)+['book-renderer/design-pack-01.js','book-renderer/design-pack-01.layout.js','book-renderer/layout-pagination-engine.js','book-renderer/book-engine.js','book-renderer/fonts.css','book-renderer/design-pack-01.css','assets/fonts/SignThatS.otf']+[str(p.relative_to(module.ROOT)) for p in(module.ROOT/'book-renderer/fonts').glob('*.woff2')]
  for path in paths:
   with self.subTest(path=path),urllib.request.urlopen(self.url+'/qa-token/'+path) as response:self.assertEqual(response.status,200);self.assertEqual(response.headers['Cache-Control'],'no-store');self.assertTrue(response.read())
 def test_no_project_access(self):
  for path in ['/test-mode.html','/wrong/test-mode.html','/qa-token/shell.html','/qa-token/','/qa-token/../shell.html','/qa-token/%2e%2e/shell.html']:
   with self.subTest(path=path),self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(self.url+path)
   self.assertEqual(error.exception.code,404)
 def test_no_write_endpoint(self):
  with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(urllib.request.Request(self.url+'/qa-token/test-mode.html',data=b'project',method='POST'))
  self.assertEqual(error.exception.code,501)
if __name__=='__main__':unittest.main()
