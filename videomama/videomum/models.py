from django.db import models
from django.contrib.auth.models import User


class ManageContacts(models.Manager):
    pass


class Contacts(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    contact_id = models.IntegerField()
    contact_name = models.CharField(max_length=50)
    is_ban = models.BooleanField(default=False)
    date_create = models.DateTimeField(auto_now_add=True)
    objects = ManageContacts()


class ManageMessages(models.Manager):
    pass


class Messages(models.Model):
    whom_id = models.IntegerField(default=0)
    from_id = models.IntegerField(default=0)
    from_name = models.CharField(max_length=100)
    text_message = models.TextField(default='')
    # False - not received, True - received
    status_receiving = models.BooleanField(default=False)
    time_create = models.TimeField(auto_now_add=True)
    date_create = models.DateTimeField(auto_now_add=True)
    objects = ManageMessages()
