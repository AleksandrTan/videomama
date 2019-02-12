"""
Access to the repository of rooms for communications storage based on dict
"""

from videomum.roomsstorage.interstorage import SuperStorage

class DictStorageRooms(SuperStorage):

    def __init__(self):
        self.storage = dict()

    def checkroom(self, id_main: int, id_sub: int) -> None:
        if not (id_main, id_sub) in self.storage:
            self.add_room(id_main, id_sub)

    def add_room(self, id_main: int, id_sub: int) -> None:
        self.storage[(id_main, id_sub)] = (id_main, id_sub, False)

    def delete_room(self, id_main: int, id_sub: int) -> None:
        del self.storage[(id_main, id_sub)]

    def change_flag(self, id_main: int, id_sub: int, flag: bool) -> None:
        self.storage[(id_main, id_sub)][2] = flag

    def get_flag(self, id_main: int, id_sub: int) -> bool:
        return self.storage[(id_main, id_sub)][2]

    def get_storage(self) -> iter:
        pass

    def __str__(self):
        return repr(self.storage)