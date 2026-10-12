"""Render faithful book pages. pip install pypdfium2 Pillow"""
import argparse,json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image

def convert(source, output, width=1200, zoom_width=2400):
    output=Path(output); folder=output/'assets'/'2026'; folder.mkdir(parents=True,exist_ok=True)
    cache_path=output.parent/'.conversion-state.json'
    source=Path(source).resolve(); stat=source.stat()
    signature={'source':str(source),'size':stat.st_size,'mtime_ns':stat.st_mtime_ns,'width':width,'zoom_width':zoom_width}
    try: cache=json.loads(cache_path.read_text(encoding='utf-8'))
    except (FileNotFoundError,json.JSONDecodeError): cache={}
    completed=set(cache.get('completed',[])) if cache.get('signature')==signature else set()
    def save_state():
        temp=cache_path.with_suffix('.tmp')
        temp.write_text(json.dumps({'signature':signature,'completed':sorted(completed)}),encoding='utf-8')
        temp.replace(cache_path)
    def save_webp(image,target,quality):
        temp=target.with_suffix('.tmp.webp')
        image.save(temp,'WEBP',quality=quality,method=4)
        temp.replace(target)
    save_state()
    doc=pdfium.PdfDocument(str(source)); pages=[]
    base_width=doc[0].get_width()
    for source_index in range(len(doc)):
        page=doc[source_index]; w,h=page.get_size(); parts=round(w/base_width)
        if parts not in (1,2): raise ValueError(f'Unexpected spread width at PDF page {source_index+1}')
        start_number=len(pages)+1
        complete=source_index in completed
        for part in range(parts):
            stem=f'page-{start_number+part:02d}'
            for suffix,expected_width in [('.webp',width),('-large.webp',zoom_width),('-thumb.webp',400)]:
                target=folder/(stem+suffix)
                try:
                    with Image.open(target) as existing:
                        if abs(existing.width-expected_width)>1: complete=False
                except (FileNotFoundError,OSError): complete=False
        full=None if complete else page.render(scale=zoom_width/(w/parts)).to_pil().convert('RGB')
        for part in range(parts):
            number=len(pages)+1; stem=f'page-{number:02d}'
            if full is not None:
                # Shared integer boundaries preserve every pixel of the spread.
                crop=full.crop((round(part*full.width/parts),0,round((part+1)*full.width/parts),full.height))
                high=folder/(stem+'-large.webp'); save_webp(crop,high,94)
                normal=crop.resize((width,round(width*h/(w/parts))),Image.Resampling.LANCZOS)
                save_webp(normal,folder/(stem+'.webp'),90)
                thumb=normal.resize((400,round(400*h/(w/parts))),Image.Resampling.LANCZOS)
                save_webp(thumb,folder/(stem+'-thumb.webp'),82)
            else:
                normal=Image.open(folder/(stem+'.webp'))
            pages.append({'number':number,'pdfPage':source_index+1,'side':('single' if parts==1 else ['left','right'][part]),'src':f'assets/2026/{stem}.webp','large':f'assets/2026/{stem}-large.webp','thumb':f'assets/2026/{stem}-thumb.webp','width':normal.width,'height':normal.height})
        completed.add(source_index); save_state()
        print(f'PDF {source_index+1}/{len(doc)} -> {len(pages)} book pages',flush=True)
        page.close()
    manifest={'edition':'2026','title':'Arquitetura e Interiores','author':'Murílio Gonçalves','pdfPages':len(doc),'pageCount':len(pages),'aspectRatio':base_width/doc[0].get_height(),'pages':pages}
    (output/'book.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    doc.close()
    print('Conversion complete',flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf',type=Path); parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'dist')
    parser.add_argument('--width',type=int,default=1200); parser.add_argument('--zoom-width',type=int,default=2400)
    args=parser.parse_args()
    if args.width<400 or args.zoom_width<args.width: parser.error('Require zoom-width >= width >= 400')
    convert(args.pdf,args.output,args.width,args.zoom_width)
