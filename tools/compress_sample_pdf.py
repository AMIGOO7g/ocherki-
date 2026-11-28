"""Makes the downloadable sample book small (≈4 MB): every photo in the PDF is re-encoded as a JPEG of at most 820 px, quality 48.
Usage: python3 tools/compress_sample_pdf.py in.pdf out.pdf   (needs: pip install pikepdf pillow)
The PDF itself comes from: node qa/demo-book/build-demo-pdf.js 8849 in.pdf square qa/sample-book/sample-structure.js"""
import io, sys, pikepdf
from pikepdf import PdfImage
src, out = sys.argv[1], sys.argv[2]
pdf = pikepdf.open(src)
for obj in list(pdf.objects):
    if not (isinstance(obj, pikepdf.Stream) and obj.get('/Subtype') == '/Image') or obj.get('/ImageMask'):
        continue
    raw = len(obj.read_raw_bytes())
    try:
        im = PdfImage(obj).as_pil_image()
    except Exception:
        continue
    if im.mode not in ('L', 'RGB'):
        im = im.convert('L' if im.mode in ('LA', '1') else 'RGB')
    if max(im.size) > 820:
        im.thumbnail((820, 820))
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=48, optimize=True)
    if buf.tell() < raw:
        obj.write(buf.getvalue(), filter=pikepdf.Name.DCTDecode)
        obj.Width, obj.Height = im.size
        obj.ColorSpace = pikepdf.Name.DeviceGray if im.mode == 'L' else pikepdf.Name.DeviceRGB
        obj.BitsPerComponent = 8
        if '/DecodeParms' in obj:
            del obj['/DecodeParms']
pdf.save(out, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
