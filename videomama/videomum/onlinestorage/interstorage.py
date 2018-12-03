"""
Abstract class of access to the repository of users who are online
Return list
"""

from abc import ABCMeta, abstractmethod


class SuperStorage(metaclass=ABCMeta):

    def __init__(self):
        self.storage = list()

    @abstractmethod
    def checkuserid(self, userid: int)->bool:
        pass

    @abstractmethod
    def adduserid(self, userid: int)->None:
        pass

    @abstractmethod
    def deleteuserid(self, userid: int)->None:
        pass

    #get user and subscriber data
    @abstractmethod
    def getusersdata(self, userid: int, subid: int)->tuple:
        pass

    @abstractmethod
    def get_storage(self)->list:
        return self.storage