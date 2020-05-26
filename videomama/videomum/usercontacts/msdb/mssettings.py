from peewee import *

user = 'rumych1@localhost'
password = '12345678'
db_name = 'videomama'

dbhandle = MySQLDatabase(
    db_name, user=user,
    password=password,
    host='127.0.0.1'
)
