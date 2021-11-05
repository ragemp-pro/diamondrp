# Import the necessary packages
from consolemenu import *
from consolemenu.items import *

import os
import io

import git
repo = git.Repo("./")
commit = str(repo.head.commit.summary)+" ("+str(repo.head.commit.author)+")"

bcolors = {
    "HEADER": '\033[95m',
    "OKBLUE": '\033[94m',
    "OKGREEN": '\033[92m',
    "WARNING": '\033[93m',
    "FAIL": '\033[91m',
    "ENDC": '\033[0m',
    "BOLD": '\033[1m',
    "UNDERLINE": '\033[4m',
}

def write_log(str, color = ""):
  result_log = """"""
  global bcolors
  if color != "":
    str = bcolors[color]+str+bcolors["ENDC"]
  print(str)
  return True




def checkConfigs(inps = True):
  with io.open('./conf.json', encoding='utf-8') as file:
      res = ""
      for line in file:
          if u'"announce" : true' in line or u'"announce": true' in line:
              res = (line)
      if res == "":
        write_log("ВНИМАНИЕ!!! Система не обнаружила что данный конфиг продакшн сервера", "FAIL")
        checkCnf = False
      else:
        write_log("Конфиг настроен правильно", "OKGREEN")
      with io.open('./src/server/config/mysql.json') as file:
        res = ""
        for line in file:
            if "51.91.67.190" in line:
                res = (line)
        if res == "":
          checkMySQL = False
          write_log("ВНИМАНИЕ!!! MySQL Конфиг настроен не верно", "FAIL")
        else:
          write_log("Конфиг MySQL настроен правильно", "OKGREEN")  
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

def gitpull(inps = True):
  os.system('git pull')
  os.system('chmod +x server') # Права доступа на всякий случай.
  write_log("Если не удалось запулить - выполните вручную для сохранения параметров авторизации")
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

def runproduction(inps = True):
  os.system('npm run production')
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

def runinstall(inps = True):
  os.system('npm i')
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

def globalupdate(inps = True):
  gitpull(False)
  runinstall(False)
  runproduction(False)
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

def copyconf(inps = True):
  os.system('rm ./conf.json')
  os.system('rm ./src/server/config/mysql.json')
  os.system('cp ../configs/conf.json ./')
  os.system('cp ../configs/mysql.json ./src/server/config/')
  write_log("Файлы конфигурации скопированы", "OKGREEN")
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

def doall(inps = True):
  globalupdate(False)
  copyconf(False)
  if inps:
    input("Нажмите чтобы вернутся назад")
  return True

menu = ConsoleMenu("DiamondRP Updater", "Последний коммит: "+commit)
menu.append_item(FunctionItem("Проверка конфигов", checkConfigs))
menu.append_item(FunctionItem("GIT pull", gitpull))
menu.append_item(FunctionItem("npm i", runinstall))
menu.append_item(FunctionItem("npm run production", runproduction))
menu.append_item(FunctionItem("Глобальная заливка обновы", globalupdate))
menu.append_item(FunctionItem("Скопировать конфиги с корня", copyconf))
menu.append_item(FunctionItem("Выполнить всё, что надо", doall))



menu.show()
