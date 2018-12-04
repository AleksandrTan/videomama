"""
Abstract class of access to the repository of users contacts
"""

from abc import ABCMeta, abstractmethod


class SuperContactsStorage(metaclass=ABCMeta):

    # returns a list of tuples containing an (id, contact name) user contacts
    @abstractmethod
    def get_all_contacts(self, userid: int)->list:
        pass

    @abstractmethod
    def add_contact(self, id_contact: int)->None:
        pass

    @abstractmethod
    def delete_contact(self, id_contact: int)->None:
        pass