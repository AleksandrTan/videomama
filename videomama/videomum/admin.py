from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Contacts, Messages

class ContactsInline(admin.StackedInline):
    model = Contacts
    can_delete = True
    verbose_name_plural = 'Contacts'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    inlines = (ContactsInline, )

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

#admin.site.register(Contacts)
admin.site.register(Messages)

