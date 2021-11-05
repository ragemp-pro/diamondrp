#!/usr/bin/python3

# pip install pylint

import json
import wx
# -*- coding: utf-8 -*-
# pip3 install PyMySQL
import pymysql
import numpy as np
class Mywin(wx.Frame):
    def __init__(self, parent, title):
        with open('src/server/config/mysql.json') as json_file:
            data = json.load(json_file)["test"]
            self.db_name = data["database"]
            # self.db = _mysql.connect(host=data["host"],port=3300, user=data["db_user"], passwd=data["password"], db=data["database"])
            self.db = pymysql.connect(host=data["host"],port=3300, user=data["db_user"], passwd=data["password"], db=data["database"])
            super(Mywin, self).__init__(parent, title=title, size=(846, 450))

            panel = wx.Panel(self)
            vbox = wx.BoxSizer(wx.VERTICAL)

            hbox1 = wx.BoxSizer(wx.HORIZONTAL)
            l1 = wx.StaticText(panel, -1, "Название таблици")

            hbox1.Add(l1, 1, wx.EXPAND | wx.ALIGN_LEFT | wx.ALL, 5)
            self.t1 = wx.TextCtrl(panel)

            hbox1.Add(self.t1, 1, wx.EXPAND | wx.ALIGN_LEFT | wx.ALL, 5)
            self.t1.Bind(wx.EVT_TEXT, self.OnKeyTyped)


            self.t4 = wx.Button(panel, label="Сгенерировать данные")

            self.t4.Bind(wx.EVT_BUTTON, self.OnClicked)

            hbox1.Add(self.t4, 1, wx.EXPAND | wx.ALIGN_LEFT | wx.ALL, 5)


            self.t4 = wx.Button(panel, label="Очистить поле")

            self.t4.Bind(wx.EVT_BUTTON, self.OnClickedClear)

            hbox1.Add(self.t4, 1, wx.EXPAND | wx.ALIGN_LEFT | wx.ALL, 5)

            vbox.Add(hbox1)

            
            # vbox.Add(hbox4)

            hbox3 = wx.BoxSizer(wx.HORIZONTAL)
            l3 = wx.StaticText(panel, -1, "Результат")

            hbox3.Add(l3, 1, wx.EXPAND | wx.ALIGN_LEFT | wx.ALL, 5)
            self.t3 = wx.TextCtrl(panel, size=(700, 300), style=wx.TE_MULTILINE | wx.TE_READONLY)

            hbox3.Add(self.t3, 1, wx.EXPAND | wx.ALIGN_LEFT | wx.ALL, 5)
            vbox.Add(hbox3)
            self.t3.Bind(wx.EVT_TEXT_ENTER, self.OnEnterPressed)


            
            
            panel.SetSizer(vbox)

            self.Centre()
            self.Show()
            self.Fit()

    def OnClickedClear(self, event):
        self.t3.SetValue("")
    def OnClicked(self, event):
        cur = self.db.cursor()
        cur.execute("SELECT COLUMN_KEY, EXTRA, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" +
                    self.db_name+"' AND TABLE_NAME = '"+self.tablename+"'")

        rows = cur.fetchall()
        self.t3.SetValue("")
        self.t3.WriteText("""@Table({modelName: \""""+self.tablename+""""})
export class """+self.tablename+"""Entity extends Model<"""+self.tablename+"""Entity> {""")
        for w in rows:
            # print(row)

            
            typesq = "REPLACE_NEED";
            typescript_name = "REPLACE_NEED";
            add_param = []
            index = 0;
            COLUMN_KEY = w[0]
            EXTRA = w[1]
            IS_NULLABLE = w[2]
            COLUMN_TYPE = w[4]
            COLUMN_NAME = w[5]
            primary = False
            if COLUMN_KEY == "PRI":
                primary = True
                add_param += ["primaryKey: true"]
                index = index + 1
            if EXTRA.find("auto_increment") != -1:
                add_param += ["autoIncrement: true"]
                index = index + 1
            if IS_NULLABLE == "NO":
                add_param += ["allowNull: false"]
                index = index + 1
            else:
                if not primary:
                    add_param += ["allowNull: true"]
                    index = index + 1
                    add_param += ["defaultValue: null"]
            index = index + 1
            if COLUMN_TYPE.find("varchar") == 0:
                typesq = 'Sequelize.STRING('+COLUMN_TYPE.replace("varchar(", '').replace(')', '')+')'
                typescript_name = "string"
                if IS_NULLABLE == "NO" and not primary:
                    add_param += ["defaultValue: \"\""]
            if COLUMN_TYPE.find("text") == 0:
                typesq = 'Sequelize.TEXT'
                typescript_name = "string"
            if COLUMN_TYPE.find("int") == 0:
                typesq = 'Sequelize.INTEGER({ length:'+COLUMN_TYPE.replace("int(", '').replace(')', '')+'})'
                typescript_name = "number"
                if IS_NULLABLE == "NO" and not primary:
                    add_param += ["defaultValue: 0"]
            if COLUMN_TYPE.find("bigint") == 0:
                typesq = 'Sequelize.BIGINT({ length:'+COLUMN_TYPE.replace("bigint(", '').replace(')', '')+'})'
                typescript_name = "number"
            if COLUMN_TYPE.find("tinyint") == 0:
                typesq = 'Sequelize.INTEGER('+COLUMN_TYPE.replace("tinyint(", '').replace(')', '')+')'
                typescript_name = "number"
                if IS_NULLABLE == "NO" and not primary:
                    add_param += ["defaultValue: 0"]
            if COLUMN_TYPE.upper().find("FLOAT") == 0:
                typesq = 'Sequelize.FLOAT'
                typescript_name = "number"
                if IS_NULLABLE == "NO" and not primary:
                    add_param += ["defaultValue: 0"]

            text = """
        @Column({ type: """+typesq+""", """+(", ".join(add_param))+"""})
        """+COLUMN_NAME+""": """+typescript_name+""";"""
            self.t3.WriteText(text)
        # req = self.db.query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '"+self.db_name+"' AND TABLE_NAME = '"+self.tablename+"'")
        # print(req)
        self.t3.WriteText("""
    }""")


    def OnKeyTyped(self, event):
        self.tablename = event.GetString()

    def OnEnterPressed(self, event):
        print( "Enter pressed")

    def OnMaxLen(self, event):
        print( "Maximum length reached")


app = wx.App()
Mywin(None,  'Sequelize Model Generator')
app.MainLoop()
