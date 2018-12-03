from peewee import *

user = 'root'
password = 'root'
db_name = 'videomama'

dbhandle = MySQLDatabase(
    db_name, user=user,
    password=password,
    host='localhost'
)