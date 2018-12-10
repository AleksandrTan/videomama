"""
Access to the repository of user messages based on the MySQL database
"""
from peewee import fn
from videomum.messagestorage.intermesstorage import SuperMesStorage
from videomum.usercontacts.msdb.models import Messages


class MSMessagtStorage(SuperMesStorage):

    def get_messages(self, whom_id: int, from_id: int) -> dict:
        messages = {m['id']: m for m in Messages.select().where((Messages.whom_id == whom_id)
                                                                & (Messages.status_receiving == 0)
                                                                & (Messages.from_id == from_id)
                                                                ).dicts()}
        self.update_messages(whom_id, from_id)
        return messages

    def update_messages(self, whom_id: int, from_id: int)->None:
        messages = Messages.select().where((Messages.whom_id == whom_id) & (Messages.status_receiving == 0)
                                           & (Messages.from_id == from_id))
        for mes in messages:
            mes.status_receiving = 1
            mes.save()

    def save_message(self, whom_id: int, text_message: str, from_id: int, from_name: str) -> None:
        message = Messages.create(whom_id=whom_id, text_message=text_message, from_id=from_id, from_name=from_name)
        message.save()

    def delete_message(self, whom_id: int) -> None:
        pass

    def count_message(self, whom_id: int) -> dict:
        pass

    def get_other_messages(self, whom_id: int)->dict:
        return {m['from_id']: m for m in Messages.select(fn.COUNT(Messages.id).alias('mes_count'), Messages.from_id).
            where((Messages.whom_id == whom_id) & (Messages.status_receiving == 0)).group_by(Messages.from_id).dicts()}

if __name__ == "__main__":
    data = MSMessagtStorage()
    #data.save_message(1, 'Hello!!!', 3, 'Ylia2018')
    #data.get_messages(2)
    data.update_messages(1, 3)
    #print(data.get_other_messages(1))