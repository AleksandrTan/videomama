"""
Abstract class of access to the repository of rooms for communications storage
Return dict
"""

from abc import ABCMeta, abstractmethod


class SuperStorage(metaclass=ABCMeta):
    #Check if there is a room in the repository on the communications storage, if not - add
    @abstractmethod
    def checkroom(self, id_main: int, id_sub: int)->None:
        pass

    @abstractmethod
    def add_room(self, id_main: int, id_sub: int) -> None:
        pass

    @abstractmethod
    def delete_room(self, id_main: int, id_sub: int)->None:
        pass

    #change the state of the discovery flag; if flag==False - communication is not possible, else - OK
    @abstractmethod
    def change_flag(self, id_main: int, id_sub: int, flag: bool)->None:
        pass

    @abstractmethod
    def get_flag(self, id_main: int, id_sub: int) -> bool:
        pass

    #Returns a repository
    @abstractmethod
    def get_storage(self) -> iter:
        pass