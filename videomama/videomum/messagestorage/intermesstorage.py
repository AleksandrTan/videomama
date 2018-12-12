""""
Abstract class of access to the repository of users messages
"""

from abc import ABCMeta, abstractmethod


class SuperMesStorage(metaclass=ABCMeta):

    @abstractmethod
    def get_messages(self, whom_id: int, from_id: int)->dict:
        pass

    @abstractmethod
    def update_messages(self, whom_id: int, from_id: int)->None:
        pass

    @abstractmethod
    def save_message(self, whom_id: int, text_message: str, from_id: int, from_name: str)->None:
        pass

    @abstractmethod
    def delete_message(self, whom_id: int)->None:
        pass

    @abstractmethod
    def count_message(self, whom_id: int)->dict:
        pass

    #count messages for the user from other contacts (id, number)
    @abstractmethod
    def get_other_messages(self, whom_id: int)->dict:
        pass

    @abstractmethod
    def get_history_message(self, user_id: int, contact_id: int)->dict:
        pass