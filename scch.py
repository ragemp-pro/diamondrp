######## NEED TO INSTALL
# pip install requests
# pip3 install PyMySQL
############ IMPORT ZONE ############
import pymysql
import time
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
import requests
import json
############# CONFIG ##############
rucaptcha_key = "b5f378f3739e77a03fa5cd8e0b6f95eb"
email = "kmpepovbcbzfhqauuy@awdrt.net"
login = "DiamondQwerty"
password = "gsadgsrAD454g54edgr65hg"



def getCapthaKey(key):
    r = requests.get(url="https://rucaptcha.com/in.php?key="+rucaptcha_key+"&method=userrecaptcha&googlekey="+key+"&pageurl=https://signin.rockstargames.com/signin/user-form?cid=socialclub")
    print(r.text)
    id_request = r.text.split('|')[1]
    end = False
    result_text = ""
    while not end:
        time.sleep(5)
        q = requests.get(url="https://rucaptcha.com/res.php?key="+rucaptcha_key+"&action=get&id="+id_request)
        if q.text != "CAPCHA_NOT_READY":
            end = True
            result_text = q.text.split('|')[1]
    return result_text


def checkIsNotLogin():
    if "AuthModal__message_" in driver.page_source:
        return authorize()
    else:
        return True


def authorize():
    driver.get('https://signin.rockstargames.com/signin/user-form?cid=socialclub')
    time.sleep(1)
    elem = driver.find_element_by_class_name("UI__Button-socialclub__primary")
    elem.click()
    time.sleep(2)
    elem = driver.find_element_by_name("email")
    elem.send_keys(email)
    elem = driver.find_element_by_name("password")
    elem.send_keys(password)
    elem = driver.find_element_by_class_name("loginform__submit")
    time.sleep(2)
    elem.click()
    time.sleep(2)
    frame = driver.find_element_by_xpath(
        "//iframe[@title='recaptcha challenge']")
    string = frame.get_attribute('src')
    key = string.split('&k=')[1]
    driver.execute_script(
        "document.getElementById('g-recaptcha-response').style.display = 'block';")
    driver.execute_script(
        "document.getElementById('g-recaptcha-response').innerHTML = '"+getCapthaKey(key)+"';")
    driver.execute_script("___grecaptcha_cfg.clients[0].R.R.callback();")
    time.sleep(10)
    return True


def getPageNotExist(login):
    if checkIsNotLogin():
        driver.get('https://ru.socialclub.rockstargames.com/member/'+login+'/')
        time.sleep(3)
        ex = False
        count = 1
        while ex == False:
            if count > 3:
                ex = True
            else:
                if "UI__Alert__text" in driver.page_source:
                    time.sleep(10)
                    count = count + 1
                    driver.get('https://ru.socialclub.rockstargames.com/member/'+login+'/')
                    time.sleep(5)
                else:
                    ex = True

        return "MemberNotFound__bar_" in driver.page_source

with open('src/server/config/mysql.json') as json_file:
    data = json.load(json_file)["test"]
    db = pymysql.connect(host=data["host"], port=3300, user=data["db_user"], passwd=data["password"], db=data["database"])
    driver = webdriver.Firefox()
    while True:
        # getPageNotExist("1962o8sBYdcx")
        cur = db.cursor()
        cur.execute("SELECT id, name FROM users ORDER BY `id` DESC LIMIT 30")
        rows = cur.fetchall()
        for w in rows:
            exist = not getPageNotExist(w[1])
            print(str(w[0])+" -> "+str(exist))
        
        time.sleep(3)


input()
