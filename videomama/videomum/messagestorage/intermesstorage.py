""""
Abstract class of access to the repository of users messages
"""

from abc import ABCMeta, abstractmethod


class SuperMesStorage(metaclass=ABCMeta):

    def __init__(self):
        self.storage = dict()

    @abstractmethod
    def get_messages(self, userid: int)->dict:
        pass

    @abstractmethod
    def save_message(self, userid: int, message: str, subuser: int)->None:
        pass

    @abstractmethod
    def delete_message(self, userid: int)->None:
        pass

    @abstractmethod
    def count_message(self, userid: int)->int:
        pass

    @abstractmethod
    def get_storage(self) -> dict:
        return self.storage