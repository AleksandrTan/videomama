"""
Access to the repository of user messages based on the MySQL database
"""

from videomum.messagestorage.intermesstorage import SuperMesStorage
from videomum.usercontacts.msdb.models import Messages


class MSMessagtStorage(SuperMesStorage):

    def get_messages(self, whom_id: int) -> dict:
        messages = {m['id']: m for m in Messages.select().where((Messages.whom_id == whom_id)
                                                                & (Messages.status_receiving == 0)).dicts()}
        #self.update_messages(whom_id)
        return messages

    def update_messages(self, whom_id: int)->None:
        messages = Messages.select().where((Messages.whom_id == whom_id) & (Messages.status_receiving == 0))
        for mes in messages:
            mes.status_receiving = 1
            mes.save()

    def save_message(self, whom_id: int, text_message: str, from_id: int, from_name: str) -> None:
        message = Messages.create(whom_id=whom_id, text_message=text_message, from_id=from_id, from_name=from_name)
        message.save()

    def delete_message(self, whom_id: int) -> None:
        pass

    def count_message(self, whom_id: int) -> int:
        pass

    def get_other_messages(self, whom_id: int)->dict:
        pass

if __name__ == "__main__":
    data = MSMessagtStorage()
    data.save_message(2, 'Hello!!!', 1, 'AlexTan')
    data.get_messages(2)