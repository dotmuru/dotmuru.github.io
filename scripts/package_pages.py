"""Empacota somente arquivos explicitamente destinados à publicação e ao projeto."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
output = root / 'release'
output.mkdir(exist_ok=True)

def files_in(directory):
    for file in sorted(directory.rglob('*')):
        if file.is_symlink():
            raise RuntimeError(f'Link simbólico não permitido: {file}')
        if file.is_file() and '__pycache__' not in file.parts and not file.name.endswith('.log'):
            yield file

def write_zip(name, entries):
    entries = list(entries)
    target = output / name
    temporary = target.with_suffix('.zip.tmp')
    with zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for file, archive_path in entries:
            archive.write(file, archive_path.as_posix())
    with zipfile.ZipFile(temporary) as archive:
        assert archive.testzip() is None
        for file, archive_path in entries:
            assert archive.read(archive_path.as_posix()) == file.read_bytes()
    temporary.replace(target)
    print(f'{name}: {len(entries)} arquivos; {target.stat().st_size / 1024 / 1024:.1f} MiB; verificado')

public_entries = [(f, f.relative_to(root / 'dist')) for f in files_in(root / 'dist')]
assert any(str(p) == 'index.html' for _, p in public_entries)
assert any(str(p) == '.nojekyll' for _, p in public_entries)
write_zip('portfolio-site.zip', public_entries)

project_entries = []
for directory in ['.github', 'dist', 'scripts', 'theme', 'tools']:
    project_entries.extend((f, f.relative_to(root)) for f in files_in(root / directory))
for name in ['.gitignore', 'package.json', 'README.md', 'ANALISE.md', 'VALIDACAO.md', 'PERSONALIZACAO.md', 'PUBLICACAO.md']:
    project_entries.append((root / name, Path(name)))
write_zip('portfolio-github.zip', project_entries)
