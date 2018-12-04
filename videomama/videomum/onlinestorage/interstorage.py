"""
Abstract class of access to the repository of users who are online
Return list
"""

from abc import ABCMeta, abstractmethod


class SuperStorage(metaclass=ABCMeta):
    #Check if there is a user ID in the repository on the onlinestorage, if not - add
    @abstractmethod
    def checkuserid(self, userid: int)->None:
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

    #Returns a repository of users on the network as an iterable object containing the user id
    @abstractmethod
    def get_storage(self) -> iter:
        pass