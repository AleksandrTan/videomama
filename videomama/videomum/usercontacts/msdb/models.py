from peewee import *
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