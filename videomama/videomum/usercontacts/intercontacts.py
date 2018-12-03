"""
Abstract class of access to the repository of users contacts
Return a list of tuples containing an (id, contact name)
"""

from abc import ABCMeta, abstractmethod


class SuperContactsStorage(metaclass=ABCMeta):

    def __init__(self):
        self.data = list()

    # returns a list of tuples containing an (id, contact name)
    @abstractmethod
    def get_all_contacts(self, userid: int)->list:
        pass

    @abstractmethod
    def add_contact(self, id_contact: int)->None:
        pass

    @abstractmethod
    def delete_contact(self, id_contact: int)->None:
        pass

    def get_storage(self):
        return self.data