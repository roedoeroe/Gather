#!/usr/bin/env python3
"""Package the actual unpacked extension; no build service or runtime dependency."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile
import subprocess
import sys
from privacy_gate import check_files

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(__file__).resolve().parents[1])
parser.add_argument('--out', type=Path, default=Path(__file__).resolve().parents[2] / 'dist')
args = parser.parse_args()
source, out = args.source.resolve(), args.out.resolve()
if out == source or source in out.parents: raise SystemExit('Package output must be outside the source tree.')
extension = source / 'account-id-tool'
manifest = json.loads((extension / 'manifest.json').read_text())
version = manifest['version']
assert json.loads((extension / 'package.json').read_text())['version'] == version
assert manifest['manifest_version'] == 3
assert '<all_urls>' not in manifest.get('host_permissions', [])
assert 'tabs' not in manifest['permissions']
for name in [manifest['action']['default_popup'], manifest['background']['service_worker'], manifest['side_panel']['default_path'].split('?')[0]]:
    assert (extension / name).is_file(), name
subprocess.run([sys.executable, str(source / 'scripts' / 'build-profile-reader.py'), '--check'], check=True)
# Review every candidate before excluding build caches; private packs must never
# be silently added to either ZIP by a broad recursive include.
cache_parts={'.git','node_modules','.tools','test-artifacts','__pycache__'}
candidates=[p for p in source.rglob('*') if p.is_file() and not any(part in cache_parts for part in p.relative_to(source).parts)]
check_files(source, candidates)
out.mkdir(parents=True, exist_ok=True)
hashes = {str(p.relative_to(source)): hashlib.sha256(p.read_bytes()).hexdigest()
          for p in sorted(extension.rglob('*')) if p.is_file()}
(source / 'docs').mkdir(exist_ok=True)
(source / 'docs' / 'SHA256.json').write_text(json.dumps({'version': version, 'files': hashes}, indent=2) + '\n')

def write_zip(destination, paths):
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for p in sorted(paths):
            name = str(p.relative_to(source))
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, p.read_bytes())
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None
        assert json.loads(archive.read('account-id-tool/manifest.json'))['version'] == version
        for name, digest in hashes.items():
            assert hashlib.sha256(archive.read(name)).hexdigest() == digest
    return hashlib.sha256(destination.read_bytes()).hexdigest()

extension_files = [p for p in extension.rglob('*') if p.is_file()]
development_files = [p for p in source.rglob('*') if p.is_file()
                     and not any(part in {'.git', 'node_modules', '.tools', 'test-artifacts', '__pycache__'} for part in p.relative_to(source).parts)]
digests = []
for kind, files in [('extension', extension_files), ('development', development_files)]:
    dest = out / f'Gather-{version}-{kind}.zip'
    digest = write_zip(dest, files)
    digests.append(f'{digest}  {dest.name}')
    print(f'{dest} ({dest.stat().st_size:,} bytes)')
(out / f'Gather-{version}-SHA256SUMS.txt').write_text('\n'.join(digests) + '\n')
