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
