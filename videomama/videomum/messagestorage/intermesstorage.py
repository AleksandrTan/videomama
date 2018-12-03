""""
Abstract class of access to the repository of users messages
"""

from abc import ABCMeta, abstractmethod


class SuperMesStorage(metaclass=ABCMeta):
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