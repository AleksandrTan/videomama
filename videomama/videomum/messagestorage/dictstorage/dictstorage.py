"""
Access to the repository of user messages based on the dict
"""
from videomum.messagestorage.intermesstorage import SuperMesStorage


class DictStorage(SuperMesStorage):

    def __init__(self):
        self.storage = dict()

    def get_messages(self, userid: int) -> dict:
        pass

    def save_message(self, userid: int, message: str, subuser: int) -> None:
        pass

    def delete_message(self, userid: int) -> None:
        pass

    def count_message(self, userid: int) -> int:
        pass