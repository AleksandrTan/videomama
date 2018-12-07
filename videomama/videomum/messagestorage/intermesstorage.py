""""
Abstract class of access to the repository of users messages
"""

from abc import ABCMeta, abstractmethod


class SuperMesStorage(metaclass=ABCMeta):

    @abstractmethod
    def get_messages(self, whom_id: int)->dict:
        pass

    @abstractmethod
    def save_message(self, whom_id: int, text_message: str, from_id: int, from_name: str)->None:
        pass

    @abstractmethod
    def delete_message(self, whom_id: int)->None:
        pass

    @abstractmethod
    def count_message(self, whom_id: int)->int:
        pass