#-*- coding: utf-8 -*-
import re
import socket

def clean(s):
    s = s.encode('utf-8')
    try:
        return " ".join(re.findall(r'[가-힣\w]+', s, flags=re.UNICODE|re.LOCALE)).decode('utf-8').lower()
    except:
        #print "Error : %s" % s
        return False

def netcat(content, hostname='localhost', port=26542):
    try:
        content = '|f ' + clean(content).encode('utf-8')
    except:
        return 3
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((hostname, port))
    s.sendall(content)
    s.shutdown(socket.SHUT_WR)
    while 1:
        data = s.recv(1024)
        if data == "":
            break
        return int(data[0])
