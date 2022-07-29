# -*- coding: utf-8 -*-

"""
    tuna_vpix
    --------------

    tuna_vpix 용 flask application

    :copyright: (c) 2017 by wizice.
    :license: MIT LICENSE 2.0, see license for more details.
"""
from __future__ import with_statement
VERSION = (1, 1)
__version__ = '.'.join(map(str, VERSION[0:2]))
__description__ = 'Smart viewer '
__author__ = 'Yun Ryung Guk'
__author_email__ = 'yunjordon@gmail.com'
__homepage__ = 'http://tuna_vpix.wizice.com'
__license__ = 'BSD'


import os
from datetime import timedelta
from flask import Flask, render_template, request, url_for, g

from flask import current_app, session, redirect, Response, jsonify
from flask import stream_with_context, abort, flash, send_from_directory, make_response
from functools import wraps
#from werkzeug import check_password_hash, generate_password_hash, secure_filename
#from wtforms import Form, TextField, PasswordField, HiddenField, validators

import requests
import urllib
import datetime
import time
import re
import shutil
import codecs
import base64
import sys
import traceback
import json
import subprocess
import pickle
import zipfile
import pdb
import tarfile
import random
import copy

from jinja2             import Template
from app_logger         import Log

app = Flask(__name__)

LOG = Log

# 환경설정
app.config.from_pyfile('tuna_vpix.cfg' , silent=True)

#Log
log_level           = app.config['LOG_LEVEL']
log_file_path       = app.config['LOG_FILE_PATH']
log_root_path       = os.path.join(app.root_path, log_file_path)
Log.init(logger_name='tuna_vpix', log_level = log_level, log_filepath = log_root_path  )
Log.debug( "LOG_FILE_PATH=%s"% log_root_path )
#print_settings(app.config.iteritems())

#---------------------------
re_remove_ptn = re.compile(u"([\u318d\u00B7\u2024\uFF65\u2027\u2219\u30FB]|[^.0-9가-힣a-zA-Z])")

DATABASE            = app.config['DATABASE']
STATIC_PATH         = app.config['STATIC_PATH']
    
class Query():
    def __init__(self):
        self.gDB                = None 
        self.re_remove_ptn      = re.compile(u"([\u318d\u00B7\u2024\uFF65\u2027\u2219\u30FB]|[^.0-9가-힣a-zA-Z])")
        self.Log                = None
        self.error              = ""

    def dateformat(self, inStr):
        """ fisrtdate 와 closedate 가  날짜 형식이 아니면 yyyy-mm-dd 형태로 변경함 """
        new_str = inStr.replace("-", "").replace(".", "")
        new_str = new_str.strip()
        if len(new_str)==0:
            return ""
        if len(new_str) ==4 :
            new_str += "0101"
        if len(new_str) ==6 :
            new_str += "01"
        new_str = "%s-%s-%s"%(new_str[:4], new_str[4:6], new_str[6:8] )
        return new_str

    def user(self, json_data):
        """유저정보확인 """
        json_key = [ "userid", "password" ]
        data = [ json_data.get( k, "" ) for k in json_key ]
        stmt = u"""select * from MANAGER where LOGIN_ID = %s and PASSWORD= password(%s) and ifnull( DATE_DELETED, '') = '' """
        userinfo = self.gDB.query( stmt, data, one=True )
        self.error = self.gDB.error
        return userinfo

    def code_group(self, json_data):
        """code group 정보확인 """
        json_key = [ "GROUP_NAME" ]
        data    = [ json_data.get( k, "" ) for k in json_key ]
        stmt = u"""select distinct GROUP_NAME V, GROUP_NAME T from WZ_CONFIG where ifnull(DATE_DELETED, '') = '' and BUSINESS_ID = %s """
        data    = [ g.user.get("BUSINESS_ID") ]
        for key in json_key:
            val = json_data.get( key, "" )
            #if self.Log:self.Log.debug( "key=%s val=%s"%( key, val ) )
            if val:
                if key == "GROUP_NAME":
                    stmt    += " AND GROUP_NAME like %s "
                    data.append( "%" + val + "%" )
        stmt        = stmt + u""" order by GROUP_NAME """
        #rowNum      = json_data.get("rowNum", 1000)
        #stmt        = stmt + " limit %s "%( rowNum)
        if self.Log:self.Log.debug( "stmt=%s data=%s"%( stmt, data ) )
        rows = self.gDB.query( stmt, data, one=False )
        self.error = self.gDB.error
        if self.gDB.error:
            rows = []
            if self.Log:self.Log.error( "query code_group error:%s \nstmt=%s\ndata=%s"%( self.gDB.error, stmt, data ))
        #if self.Log:self.Log.debug( "query code_group debug rows=%s\nstmt=%s\ndata=%s"%( rows, stmt, data ))
        return rows

    def code(self, json_data):
        """code정보확인 """
        json_key = [ "GROUP_NAME", "CODE_NAME", "FROM_MDATE", "TO_MDATE" ]
        data    = [ json_data.get( k, "" ) for k in json_key ]
        stmt = u"""select * from WZ_CONFIG where ifnull(DATE_DELETED, '') = '' and BUSINESS_ID = %s """
        data    = [ g.user.get("BUSINESS_ID") ]
        for key in json_key:
            val = json_data.get( key, "" )
            #if self.Log:self.Log.debug( "key=%s val=%s"%( key, val ) )
            if val:
                if key == "GROUP_NAME":
                    stmt    += " AND GROUP_NAME like %s "
                    data.append( "%" + val + "%" )
                if key == "CODE_NAME":
                    stmt    += " AND CODE_NAME like %s "
                    data.append( "%" + val + "%" )
                if key == "FROM_MDATE":
                    stmt    += " AND DATE_MODIFIED >= STR_TO_DATE( %s, '%m/%d/%Y') "
                    data.append( val )
                if key == "TO_MDATE":
                    stmt    += " AND DATE_MODIFIED <= STR_TO_DATE( %s, '%m/%d/%Y') "
                    data.append( val )
        stmt        = stmt + u""" order by GROUP_NAME, VIEW_SEQ """
        rowNum      = json_data.get("rowNum", 50)
        stmt        = stmt + " limit %s "%( rowNum)
        if self.Log:self.Log.debug( "stmt=%s data=%s"%( stmt, data ) )
        rows = self.gDB.query( stmt, data, one=False )
        self.error = self.gDB.error
        if self.gDB.error:
            rows = []
            if self.Log:self.Log.error( "query code error:%s \nstmt=%s\ndata=%s"%( self.gDB.error, stmt, data ))
        #if self.Log:self.Log.debug( "query code debug rows=%s\nstmt=%s\ndata=%s"%( rows, stmt, data ))
        return rows

    def code_edit(self, json_data):
        """code edit """
        pid     = json_data.get("id", "") 
        if not pid:
            pid = json_data.get("WZ_CONFIG_ID", "")
        poper   = json_data.get("oper") 
        if ( poper.find("edit")>=0 and pid ) :
            json_key = [ "GROUP_NAME", "VIEW_SEQ", "CODE_NAME", "VIEW_NAME" ]
            stmt = u"""update WZ_CONFIG set MODIFIED_BY = %s """
            data    = [ g.user.get("MANAGER_ID") ]
            for key in json_key:
                val = json_data.get( key, "" )
                if val:
                    stmt    += " , " + key + " = %s "
                    data.append( val )
            stmt    += " WHERE BUSINESS_ID = %s "
            data.append( (g.user).get("BUSINESS_ID", 0) )
            stmt    += "   AND WZ_CONFIG_ID = %s "
            data.append( json_data.get( "id" , 0 ) )
            i_upd   = self.gDB.query( stmt, data, one=True )
            self.error = self.gDB.error
            if self.gDB.error:
                rows = [ False , self.gDB.error, 0 ]
                if self.Log:self.Log.error( "query code error:%s \nstmt=%s\ndata=%s"%( self.gDB.error, stmt, data ))
            else:
                rows = [ True , "OK", i_upd ]
        else:
            rows = [ False , "Invalid Call for edit", pid ]
        return rows

    def code_add(self, json_data):
        """code add  """
        pid     = json_data.get("id") 
        poper   = json_data.get("oper") 
        if ( poper.find("add")>=0  ) :
            json_key = [ "GROUP_NAME", "VIEW_SEQ", "CODE_NAME", "VIEW_NAME" ]
            stmt = u"""INSERT INTO WZ_CONFIG ( BUSINESS_ID
                        , GROUP_NAME, VIEW_SEQ, CODE_NAME, VIEW_NAME
                        , DATE_CREATED, CREATED_BY, MODIFIED_BY )
                  values ( %s,  %s, %s, %s, %s
                        , now(), %s, %s ) """
            data    = [ (g.user).get("BUSINESS_ID", 0) ]
            user_seq    = g.user.get("MANAGER_ID") 
            for key in json_key:
                val = json_data.get( key, "" )
                val = (val).strip() if type(val) in [ str ] else val
                data.append( val )
            data.append( user_seq )     #-- created_by
            data.append( user_seq )     #-- modified_by
            i_ins   = self.gDB.query( stmt, data, one=True, commit=True )
            self.error = self.gDB.error
            if self.gDB.error:
                rows = [ False , self.gDB.error, 0 ]
                if self.Log:self.Log.error( "insert code error:%s \nstmt=%s\ndata=%s"%( self.gDB.error, stmt, data ))
            else:
                if self.Log:self.Log.debug( "insert code inserted \nstmt=%s\ndata=%s"%( stmt, data ))
                stmt        = u"""select * from WZ_CONFIG where WZ_CONFIG_ID = %s """
                sel_row     = self.gDB.query( stmt, [ i_ins ], one=True )
                if self.gDB.error:
                    rows = [ False , self.gDB.error, {} ]
                    if self.Log:self.Log.error( "select after insert code error:%s \nstmt=%s\ndata=%s"%( self.gDB.error, stmt, i_ins ))
                else:
                    rows = [ True , "OK", sel_row ]
        else:
            rows = [ False , "Invalid Call for insert", {} ]
        return rows

    def code_delete(self, json_data):
        """code delete """
        pid     = json_data.get("id") 
        poper   = json_data.get("oper") 
        i_dels  = []
        if ( poper.find("del")>=0 and pid ) :
            pids    =   [ pid ]
            if ( pid.find(",")>=0 ):
                pids=   pid.split(",") 
            for pid in pids:
                stmt = u"""delete from WZ_CONFIG where WZ_CONFIG_ID = %s """
                data    = [ pid ]
                i_del   = self.gDB.query( stmt, data, one=True )
                self.error = self.gDB.error
                if self.gDB.error:
                    rows = [ False , self.gDB.error, 0 ]
                    if self.Log:self.Log.error( "delete code error:%s \nstmt=%s\ndata=%s"%( self.gDB.error, stmt, data ))
                    break
                else:
                    i_dels.append ( i_del )
            rows = [ True , "OK", i_dels ]
        else:
            rows = [ False , "Invalid Call for delete", i_dels ]
        return rows

#------------------------------------------

gQuery              = Query()
gQuery.Log          = Log
#----- 

Log.debug("App started....")

def request_params(req, url=""):
    params = request_form_args_params(req, ["timeStamp", "_"] )                        
    #
    Log.debug("request_params:%s"%(str(params) if str(params)<1000 else "total len=%s truncate until 1000 :%s"%( len(params), str(params)[:1000] )))
    return params

def request_form_args_params(req, except_keys=[]):
    """ form 또는 args 로 넘어온 파라미터를 모두 합치고 euckr 로 바꾼다. list 형태로 넘어온 것도 처리  """
    paramsF={}
    paramsA={}
    paramsJ={}
    if req.form:
        paramsF = { k:req.form.getlist(k) for k in req.form.keys() if k not in except_keys }
    if req.args:
        paramsA = { k:req.args.getlist(k) for k in req.args.keys() if k not in except_keys }
    paramsJ     = req.get_json(silent=True)
    #--- merge
    for k, v in paramsA.iteritems():
        if v:
            paramsF[k] = v
    if paramsJ:
        paramsF.update( paramsJ )
    #Log.debug("request_form_args_params:%s"%(paramsF))
    for k, v in paramsF.iteritems():
        if isinstance(v, list):
            if len(set(v))==1:
                paramsF[k] = v[0]
        else:
            paramsF[k] = self.euckr(v)
    return paramsF

@app.errorhandler(404)
def not_found(error):
    Log.error("404 error=[%s]"%(error))
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    if isinstance( error, str):
        Log.error("500 error=[%s]"%(utf8(error)))
    return render_template('500.html', err_msg=error), 500
    
@app.before_request
def before_request():
    """ 로그인 유저인지 확인 """
    g.user = None
    if "user" in session:
        g.user              = session['user']
        if  str(g.user).find("ERROR") >=0 :
            g.user  = None
        else:
            #Log.debug("before_request User %s "%(g.user) )
            Log.debug("before_request User %s "%(g.user.get("LOGIN_ID", "") ) )

"""
def login():
    #--- 로그인 
    param = gUtil.request_params(request)
    userid= param.get("userid", "" )
    userpwd= param.get("password", "" )
    if not userid or not userpwd:
        return render_template("login-sungjin.html")
    
    #--- user 정보확인
    json_data = { "userid": userid, "password":userpwd }
    userinfo = gQuery.user(json_data)
    Log.debug("userinfo:%s"%(userinfo))
    if gQuery.error:
        userinfo    = {}
    #--- user 정보확인
    if userinfo:
        Log.debug("User login id[%s]"%(userid))
        session["user"] = userinfo
        if userinfo.get("ROLE").find("ADMIN")>=0:
            return redirect( url_for("fn_codelist"))
    else:
        return render_template("login-sungjin.html")
    return redirect( url_for("fn_codelist"))
"""

@app.route('/vpix_exam')
def fn_vpis_canvas():
    return render_template('vpix_canvas.html')

#도형의 넓이 구하기
@app.route('/vpix_exam', methods=['GET', 'POST'])
def fn_figure_area():

    n = int(sys.stdin.readline())
    point = []
    for _ in range(n):
        a, b = map(int, sys.stdin.readline().split())
        point.append([a, b])
    xold, yold = point.pop(0)
    point.append([xold, yold])  # 시작점을 선택해준 뒤, 시작점을 다시 맨 뒤에 추가해준다.
    area = 0
    while point:
        nx, ny = point.pop(0)
        area += (yold + ny) * (nx - xold) / 2  # 사다리꼴의 넓이 추가
        xold, yold = nx, ny
    print("%.1f" % abs(area))


                                                                        
#@app.route('/login', methods = ['POST', 'GET'])
#def login():
#   if request.method == 'POST':
#      user = request.form['myName']
#      return redirect(url_for('success', name = user))
#   else:
#      user = request.args.get('myName')
#      return redirect(url_for('success', name = user))

#if __name__ == '__main__':
#   app.run(debug = True)


@app.route('/logout')
def logout():
    """ 로그아웃 """
    if "user" in session:
        session.pop('user')
    g.user = None
    return render_template('tuna_vpix.html')


def Application():
    return app

if __name__ == "__main__":
    #print_settings(app.config.iteritems())
    app.run(host='0.0.0.0', port=8082, debug=True)
