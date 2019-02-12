"""
Access to the repository of users socket objects who are online based on dict
"""

from videomum.sockonlinestorage.interstorage import SuperStorage

class DictStorage(SuperStorage):

    def __init__(self):
        self.storage = dict()

    # Check if there is a user ID in the repository on the onlinestorage, if not - add
    def checkuserid(self, userid: int, sock_obj: object)->None:
        if not userid in self.storage:
            self.adduserid(userid, sock_obj)


    def adduserid(self, userid: int, sock_obj: object) -> None:
        self.storage[userid] = (userid, sock_obj)


    def deleteuserid(self, userid: int) -> None:
        del self.storage[userid]

    # get user data
    def getusersdata(self, userid: int) -> tuple:
        try:
            return self.storage[userid]
        except KeyError:
            return False,

    # Returns a repository of users on the network as an iterable object containing the user id
    def get_storage(self) -> iter:
        return self.storage

    def __str__(self):
        return repr(self.storage)