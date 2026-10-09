#!/usr/bin/env python3
"""Conservative release gate, not a PII detector. Never print matched values.
Fictional fixtures are scanned too. Pixel content requires human review.
"""
import argparse
import io
from pathlib import Path, PurePosixPath
import re
import zipfile

PRIVATE_PARTS = {'.env', '.git', 'private', 'private-data', 'organization-packs', 'local-packs', 'case-data', 'storage-dumps', 'attachments', 'artifacts', 'checkpoints', 'node_modules', '.tools', '__pycache__', 'test-artifacts'}
PRIVATE_SUFFIXES = {'.gather', '.har', '.sqlite', '.sqlite3', '.db', '.pem', '.key', '.p12', '.pfx', '.mp4', '.mov'}
SECRETS = [
 ('private key', re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')),
 ('GitHub credential', re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b')),
 ('AWS access key', re.compile(rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b')),
 ('Slack credential', re.compile(rb'\bxox[baprs]-[A-Za-z0-9-]{20,}\b')),
 ('assigned secret', re.compile(rb'''(?i)["']?(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)["']?\s*[:=]\s*["']([A-Za-z0-9+/=_-]{24,})["']''')),
]

def inspect_bytes(name, data, depth=0):
    parts = PurePosixPath(name.replace('\\', '/')).parts
    lower = [p.lower() for p in parts]
    if not parts or name.startswith(('/', '\\')) or '..' in parts:
        raise ValueError('Unsafe archive path: ' + name)
    if any(p in PRIVATE_PARTS or p.startswith('.env.') for p in lower) or Path(lower[-1]).suffix in PRIVATE_SUFFIXES:
        raise ValueError('Private file type/path: ' + name)
    if lower[-1] in {'cookies.json','cookies.txt','storage-state.json','page-source.html','intake.txt','intake.json'}:
        raise ValueError('Private data file: ' + name)
    for label, pattern in SECRETS:
        if pattern.search(data): raise ValueError(label + ' pattern in ' + name + ' (value withheld)')
    if lower[-1].endswith('.zip'):
        if depth>=3: raise ValueError('Archive nesting limit: ' + name)
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            infos=archive.infolist()
            if len(infos)>10000 or sum(i.file_size for i in infos)>200*1024*1024: raise ValueError('Archive scan limit: '+name)
            if len({i.filename for i in infos})!=len(infos): raise ValueError('Duplicate archive entries: '+name)
            for info in infos:
                if info.is_dir(): continue
                if (info.external_attr>>16)&0o170000==0o120000: raise ValueError('Archive symlink: '+name)
                inspect_bytes(info.filename,archive.read(info),depth+1)

def check_files(root, paths):
    for path in paths:
        if path.is_symlink() or any(p.is_symlink() for p in path.parents if p!=root.parent): raise ValueError('Symlink in package: '+str(path.relative_to(root)))
        inspect_bytes(path.relative_to(root).as_posix(),path.read_bytes())
    return len(paths)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('path',type=Path);args=p.parse_args();root=args.path.resolve()
    try:
        if root.is_file():inspect_bytes(root.name,root.read_bytes());count=1
        else:count=check_files(root,[x for x in root.rglob('*') if x.is_file()])
        print(f'Privacy gate passed: {count} files; pattern/path checks only. Review text and images before publication.')
    except (ValueError,zipfile.BadZipFile) as error:raise SystemExit(str(error))
