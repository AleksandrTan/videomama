"""
Access to the repository of users who are online based on list
"""
from videomum.onlinestorage import interstorage


class ListStorage(interstorage.SuperStorage):

    def checkuserid(self, userid: int) -> bool:
        return True if userid in self.storage else False

    def adduserid(self, userid: int) -> None:
        self.storage.append(userid)

    def deleteuserid(self, userid: int) -> None:
        self.storage.remove(userid)

    # get user and subscriber data
    def getusersdata(self, userid: int, subid: int) -> tuple:
        pass

    def get_storage(self)->list:
        return self.storage

    def __str__(self):
        return repr(self.storage)