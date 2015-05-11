from flask import Flask
from flask import url_for, redirect, render_template

from pymongo import MongoClient
import requests
from bs4 import BeautifulSoup as bs
from elasticsearch import Elasticsearch

import random
import json

from utils import *

es = Elasticsearch(['http://minsky.unist.ac.kr:9200'], timeout=200)

mongo = MongoClient('localhost', 27017)
db = mongo.ausung
collection = db.hali

PREFIX = "carpedm20"
BASE_URL = "http://pail.unist.ac.kr/"

app = Flask(__name__, static_url_path="/%s/ausung/static" % PREFIX,)

import re
from glob import glob

def get_rank():
    url = "http://www.naver.com/include/realrank.html.09"

    soup = bs(requests.get(url).text)
    [s.extract() for s in soup('span')]

    return ','.join(['%s' % item.text for item in soup.findAll('a')][:-1])

def get_related(query):
    payload = {
        'query': query,
    }
    headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/22.0.1207.1 Safari/537.1"
    }
    soup = bs(requests.get('http://search.naver.com/search.naver', params=payload, headers=headers).text)
    return soup

@app.route('/')
@app.route('/%s/' % PREFIX)
def root():
    return redirect(url_for('index'))

@app.route('/%s/ausung/' % PREFIX)
def index():
    return render_template('index.html')

@app.route('/%s/ausung/<query>' % PREFIX)
def search(query):
    media_dic, comments, star_dic = get_processed_data(query)

    return render_template('search.html', rank=get_rank(), query=query, media_dic=media_dic, comments=json.dumps(comments), star_dic=star_dic)

def get_processed_data(query):
    res = es.search(index='halin', doc_type='items', q="content:%s" % query, size=3000, fields=['date', 'content', 'oid', 'aid', 'pos', 'neg'])
    info = [[hit['fields']['content'][0], int(hit['fields']['date'][0]), hit['fields']['oid'][0], hit['fields']['aid'][0], hit['fields']['pos'][0], hit['fields']['neg'][0]] for hit in res['hits']['hits']]

    media_dic = {}
    media_dic[0] = {}
    star_dic = {1: {}, 2: {}, 3: {}, 4: {}, 5: {}}

    comments = {}

    for idx, item in enumerate(info):
        text = item[0]
        oid = int(item[2])
        aid = int(item[3])
        pos = int(item[4])
        neg = int(item[5])

        #time = info[idx][1]/86400/7
        time = info[idx][1]/86400

        if not media_dic.has_key(oid):
            media_dic[oid] = {}

        if not media_dic[oid].has_key(time):
            media_dic[oid][time] = []
        if not media_dic[0].has_key(time):
            media_dic[0][time] = []

        x = netcat(text)

        if not comments.has_key(time):
            comments[time] = []

        x += random.sample([-1, 0, +1], 1)[0]
        if x <= 0:
            x = 1

        if int(x) >= 5:
            x = random.sample([4, 5], 1)[0]

        comments[time].append([x, oid, aid, pos, neg, text.encode('utf-8')])

        media_dic[oid][time].append(x)
        media_dic[0][time].append(x)

        if not star_dic[x].has_key(time):
            star_dic[x][time] = 0

        star_dic[x][time] += 1

    return media_dic, comments, star_dic

    """x = "{"
    for key in comments.keys():
        x += str(key) + ":['"
        x += "','".join(comments[key])
        x += "'],"
    x += "}"

    x = x.decode('utf-8')"""

@app.route('/%s/ausung/1/<query>' % PREFIX)
def search1(query):
    media_dic, comments, star_dic = get_processed_data(query)

    return render_template('search1.html', rank=get_rank(), query=query, media_dic=media_dic, comments=json.dumps(comments), star_dic=star_dic)

@app.route('/%s/ausung/2/<query>' % PREFIX)
def search2(query):
    media_dic, comments, star_dic = get_processed_data(query)

    return render_template('search2.html', rank=get_rank(), query=query, media_dic=media_dic, comments=json.dumps(comments), star_dic=star_dic)

@app.route('/%s/ausung/3/<query>' % PREFIX)
def search3(query):
    media_dic, comments, star_dic = get_processed_data(query)

    return render_template('search3.html', rank=get_rank(), query=query, media_dic=media_dic, comments=json.dumps(comments), star_dic=star_dic)
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5005)

