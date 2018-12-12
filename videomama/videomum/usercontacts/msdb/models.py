from peewee import *
import datetime
import time
from .mssettings import dbhandle


class User(Model):
    class Meta:
        database = dbhandle
        db_table = "auth_user"

    id = PrimaryKeyField(null=False)
    username = CharField()


class Contacts(Model):
    class Meta:
        database = dbhandle
        db_table = "videomum_contacts"

    id = PrimaryKeyField(null=False)
    user = ForeignKeyField(User, backref='favorites')
    contact_id = IntegerField()
    contact_name = CharField(max_length=50)
    is_ban = BooleanField(default=False)
    date_create = DateTimeField()


class TimeFieldMy(TimeField):
    def python_value(self, value):
        return value.__str__()


class DateTimeFieldMy(DateTimeField):
    def python_value(self, value):
        return value.__str__()


class Messages(Model):
    class Meta:
        database = dbhandle
        db_table = "videomum_messages"

    id = PrimaryKeyField(null=False)
    whom_id = IntegerField(default=0)
    from_id = IntegerField(default=0)
    from_name = CharField(max_length=100)
    text_message = TextField(default='')
    # False - not received, True - received
    status_receiving = BooleanField(default=False)
    time_create = TimeFieldMy(default=time.strftime("%H:%M:%S"), formats="%H:%M:%S")
    date_create = DateTimeFieldMy(default=datetime.datetime.now, formats="%Y-%m-%d")