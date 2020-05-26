"""
Access to the repository of user contacts based on the database(MySql)
"""

from videomum.usercontacts.intercontacts import SuperContactsStorage
from videomum.usercontacts.msdb.models import Contacts, User


class MySqlStorage(SuperContactsStorage):

    #returns a list of tuples containing an (id, contact name)
    def get_all_contacts(self, userid: int) -> list:
        data = list()
        for contact in Contacts.select().join(User).where((User.id == userid) & (Contacts.is_ban == 0)):
           data.append((contact.contact_id, contact.contact_name))
        return data

    def add_contact(self, id_contact: int) -> None:
        pass

    def delete_contact(self, id_contact: int) -> None:
        pass


if __name__ == '__main__':
    data = MySqlStorage()
    print(data.get_all_contacts(1))
