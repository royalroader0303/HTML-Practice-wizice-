
#-*- coding: utf-8 -*-
"""
    tuna_vpix.wsgi
    ---------------
    Apache2 mod_wsgi 연계 모듈 for  service

    :copyright: (c) 2021 by wizice.
"""
import os 

#

import sys
#-- class 를 불러오는 디렉토리 설정
#-- apache mod_wsgi 에서 참조하기 위해 sys.path 에 등록함
sys.path.insert(0,'/home/wizice/tuna_vpix')

def execfile(filepath, globals=None, locals=None):
    if globals is None:
        globals = {}
    globals.update({
        "__file__": filepath,
        "__name__": "__main__",
    })
    with open(filepath, 'rb') as file:
        exec(compile(file.read(), filepath, 'exec'), globals, locals)

#--- virtual env 
activate_this = '/home/wizice/venv/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

from tuna_vpix import Application
application = Application()      

