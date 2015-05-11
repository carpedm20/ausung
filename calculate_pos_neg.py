#-*- coding: utf-8 -*-
import re
import socket

from elasticsearch import Elasticsearch

def clean(s):
    s = s.encode('utf-8')
    try:
        return " ".join(re.findall(r'[가-힣\w]+', s, flags=re.UNICODE|re.LOCALE)).decode('utf-8').lower()
    except:
        #print "Error : %s" % s
        return False

def netcat(hostname, port, content):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((hostname, port))
    s.sendall(content)
    s.shutdown(socket.SHUT_WR)
    while 1:
        data = s.recv(1024)
        if data == "":
            break
        return int(data[0])

es = Elasticsearch(['http://minsky.unist.ac.kr:9200'], timeout=200)
#res = es.search(index='halinn', doc_type='items', q="title:아이유", size=2235)
print "===="
q = "세월호"

res = es.search(index='halin', doc_type='items', q="content:%s" % q, size=299, from_=10000)
print "===="

score = 0
truecount = 0
for item in res['hits']['hits']:
    try:
        sss = clean(item['_source']['content']).encode('utf-8')
        xxx = netcat('localhost', 26542, '|f ' + clean(item['_source']['content'][0]).encode('utf-8'))
        score += int(xxx)

        print xxx, sss
        truecount += 1
    except:
        continue
print score
print truecount

print score/float(truecount)

"""
res = es.search(index='halinn', doc_type='items', fields=['id'], q="title:아이유", size=100000000)

ids = [hit['fields']['id'][0] for hit in res['hits']['hits']]
results = [(str(id)[:-10].zfill(3),str(id)[-10:]) for id in ids]

from timeout import timeout

@timeout(3)
def update(item):
    try:
        doc = '{"doc": {"score": %s}}' % netcat('localhost', 26542, '|f ' + clean(item['fields']['content'][0]).encode('utf-8'))
        es.update(index='halin', doc_type='items', id=item['_id'], body=doc)
    except:
        pass
#90528024
#90000000
max_ = 90000000
size = 1000
for i in xrange(68, 1000):
    print i
    res = es.search(index='halin', doc_type='items', fields=['id','content'], size=size, from_=max_/size*i+1)

    for item in res['hits']['hits']:
        print i, item['fields']['content'][0]

        try:
            update(item)
        except:
            print "timeout"
"""

'''res = es.search(index='halin', doc_type='items', fields=['id'], body="""
{
    "match": {
        "aid": {
            "query": 1962
        }
    }
}""")
    "script_fields" : {
        "tid" : {
            "script" : "doc['aid'].value + doc['oid'].value"
        }
    }
}""")
'''
