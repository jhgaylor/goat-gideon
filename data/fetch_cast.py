import json,time,urllib.request
eps=json.load(open('data/episodes.json'))
out={}
try: out=json.load(open('data/guestcast_raw.json'))
except: pass
for i,e in enumerate(eps):
    k=str(e['id'])
    if k in out: continue
    for attempt in range(5):
        try:
            with urllib.request.urlopen(f"https://api.tvmaze.com/episodes/{e['id']}/guestcast",timeout=20) as r:
                d=json.load(r)
            out[k]=[{"p":c['person']['name'],"c":c['character']['name']} for c in d]
            break
        except Exception as ex:
            time.sleep(3*(attempt+1))
    if i%20==0:
        json.dump(out,open('data/guestcast_raw.json','w')); print(i,flush=True)
    time.sleep(0.55)
json.dump(out,open('data/guestcast_raw.json','w')); print("done",len(out))
