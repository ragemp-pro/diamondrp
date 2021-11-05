import sys
f = open("../configs/mysql.json", "w")
f.write("""{
  "test": {
    "host": "127.0.0.1",
    "db_user": "gta5_user",
    "password": \""""+sys.argv[1]+"""",
    "database": "gta5db"
  }
}""")
f.close()
s = open("../configs/conf.json", "w")
s.write("""{
  "announce" : false,
  "maxplayers" : 1000,
  "name": "Diamond RolePlay | X2 | NEW GOV  [voice][roleplay]",
  "gamemode" : "roleplay",
  "stream-distance" : 180.0,
  "port": 22005,
  "csharp": true,
  "voice-chat": true,
  "voice-chat-sample-rate": 48000,
  "language": "ru",
  "url": "https://gta-5.ru",
  "enable-nodejs": true,
  "broadcast-threads": 8,
  "encryption": true,
  "limit-time-of-connections-per-ip": 500,
  "enable-http-security": true,
  "allow-cef-debugging": false
 }""")
s.close()
