#!/usr/bin/env python3
"""Read-only public-source audit. No content/credential values are printed.
Default: tracked + unignored candidate files. --history: unique reachable Git blobs.
"""
import argparse
import json
from pathlib import Path
import subprocess
from privacy_gate import inspect_bytes

root=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--history',action='store_true');p.add_argument('--report',type=Path);args=p.parse_args()
counts={'blobs':0,'archives':0,'bytes':0};issues=[]
def check(name,data):
    counts['blobs']+=1;counts['bytes']+=len(data)
    if name.endswith('.zip'):counts['archives']+=1
    try:inspect_bytes(name,data)
    except (ValueError,RuntimeError) as error:issues.append({'path':name,'finding':str(error)})
if args.history:
    objects=subprocess.check_output(['git','rev-list','--objects','--all'],cwd=root,text=True).splitlines()
    proc=subprocess.Popen(['git','cat-file','--batch'],cwd=root,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
    try:
        for line in objects:
            if ' ' not in line:continue
            oid,name=line.split(' ',1);proc.stdin.write((oid+'\n').encode());proc.stdin.flush()
            metadata=proc.stdout.readline().decode().strip().split()
            if len(metadata)!=3:raise RuntimeError('Unreadable Git object')
            size=int(metadata[2]);data=proc.stdout.read(size)
            if len(data)!=size or proc.stdout.read(1)!=b'\n':raise RuntimeError('Truncated Git object')
            if metadata[1]=='blob':check(name,data)
    finally:
        proc.stdin.close();proc.wait()
else:
    names=subprocess.check_output(['git','ls-files','-z','--cached','--others','--exclude-standard'],cwd=root).split(b'\0')
    for raw in sorted(set(names)):
        if not raw:continue
        name=raw.decode();path=root/name
        if path.is_symlink():issues.append({'path':name,'finding':'Symlink requires review'});continue
        if path.exists():check(name,path.read_bytes())
report={'scope':'reachable Git history' if args.history else 'tracked and unignored candidate files','counts':counts,'issues':issues,'limits':'Credential/path patterns only; cannot classify personal names, proprietary prose or image pixels.'}
if args.report:
    args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
raise SystemExit(1 if issues else 0)
