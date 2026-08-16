import json,re
raw=json.load(open('data/guestcast_raw.json'))
out={}
for k,v in raw.items():
    seen=set(); lst=[]
    for c in v:
        name=re.sub(r'\s*\(.*?\)\s*','',c['c']).strip()
        if not name or name.lower() in seen: continue
        seen.add(name.lower()); lst.append([name,c['p']])
    out[k]=lst
json.dump(out,open('data/cast.json','w'),separators=(',',':'))
print(len(out),"episodes with cast")
