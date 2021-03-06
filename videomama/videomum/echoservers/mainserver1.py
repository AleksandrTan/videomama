#!/usr/bin/env python
"""
Server for text messaging with instant messaging using user socket objects
"""
# import sys
# import os
from socket import *
import hashlib
import base64
import struct
import array
from base64 import b64encode
import _thread as thread
import json

#sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from videomum.usercontacts.msdb.msdbcontacts import MySqlStorage
from videomum.onlinestorage.liststorage import ListStorage
from videomum.messagestorage.mststorage.msstorageone import MSMessageStorage
from videomum.sockonlinestorage.dictstorage import DictStorage
from videomum.logobject.logserver1 import LogServerOne


class Mainserver:
    def __init__(self, onlinestorage, message_storage, socket_storage, loger):
        self.myHost = '127.0.0.1'
        self.myPort = 50007
        self.onlinestorage = onlinestorage
        self.message_storage = message_storage
        self.socket_storage = socket_storage
        self.magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        self.mainsocket = socket(AF_INET, SOCK_STREAM)
        self.mainsocket.bind((self.myHost, self.myPort))
        self.mainsocket.listen(5)
        self.loger = loger
        self.thread_lock = thread.allocate_lock()

    def startserver(self):
        print('Start server')
        i = 0
        while True:
            connection, address = self.mainsocket.accept()
            i += 1
            if address:
                print('Start thread')
                thread.start_new_thread(self.getalk, (connection, ))

    def getalk(self, connection):
        while True:
            data = connection.recv(6024).strip().decode('latin-1')
            contacts_storage = MySqlStorage()
            if not data:
                break
            headers = data.split("\r\n")
            if ("Connection: Upgrade" in data or "Connection: keep-alive, Upgrade" in data) and "Upgrade: websocket" in data:
                # getting the websocket key out
                key = ''
                for h in headers:
                    if "Sec-WebSocket-Key" in h:
                        key = h.split(" ")[1]
                        # let's shake hands shall we?
                self.handshake(key, connection)
                while True:
                    try:
                        dataGet = connection.recv(6024)
                        dataClean = self.decode_frame(dataGet)
                        # if reload brouser, close page or send "bye"
                        if dataClean['payload'] == b'\x03\xe9':
                            break
                        print(dataClean['payload'])
                        data_payload = json.loads(dataClean['payload'].decode())
                        #if the user has finished work
                        if data_payload['status'] == 3:
                            with self.thread_lock:
                                self.onlinestorage.deleteuserid(data_payload['userId'])
                                self.socket_storage.deleteuserid(data_payload['userId'])
                            connection.close()
                            break
                        # connections established, write user id to user online storage
                        if data_payload['status'] == 1:
                            with self.thread_lock:
                                # check if there is a user in the repository online
                                self.onlinestorage.checkuserid(data_payload['userId'])
                                self.socket_storage.adduserid(data_payload['userId'], connection)
                                #user data (all contacts, contacts online)
                                contacts_online = self.contacts_online(contacts_storage.get_all_contacts(data_payload['userId']),
                                                                       self.onlinestorage.get_storage(), data_payload['status'])
                                #check isset new messages(from_id, count messages)
                                contacts_online['isset_messages'] = self.message_storage.get_other_messages(data_payload['userId'])
                            #send answer
                            connection.send(self.send_frame(json.dumps(contacts_online).encode(), 0x1))
                            continue
                        # send users contacts online, check new messages
                        if data_payload['status'] == 6:
                            with self.thread_lock:
                                #user data (all contacts, contacts online)
                                contacts_online = self.contacts_online(contacts_storage.get_all_contacts(data_payload['userId']),
                                                                       self.onlinestorage.get_storage(), data_payload['status'])
                                #check isset new messages(from_id, count messages)
                                contacts_online['isset_messages'] = self.message_storage.get_other_messages(data_payload['userId'])
                            #send answer
                            connection.send(self.send_frame(json.dumps(contacts_online).encode(), 0x1))
                            continue
                        #get message (and send a reply message to addressee)
                        if data_payload['status'] == 2:
                            try:
                                with self.thread_lock:
                                    #save message
                                    self.message_storage.save_message(data_payload['whom_id'], data_payload['text_message'],
                                                                      data_payload['from_id'], data_payload['from_name'])
                                    #check if user online
                                    whom_id_socket = self.socket_storage.getusersdata(data_payload['whom_id'])
                                if whom_id_socket[0]:
                                    messages = self.message_storage.get_messages(data_payload['whom_id'],
                                                                                 data_payload['from_id'])
                                    message = {"status": 2, "messages_contact": messages,
                                               "subId": str(data_payload['whom_id'])}
                                    whom_id_socket[1].send(self.send_frame(json.dumps(message).encode(), 0x1))
                                #connection.send(self.send_frame(message.encode(), 0x1))
                                continue
                            except ConnectionAbortedError as Error1:
                                self.loger.set_log(Error1)
                                break
                        #change the status of the read message
                        if data_payload['status'] == 22:
                            with self.thread_lock:
                                # change status read message
                                self.message_storage.update_message(data_payload['whom_id'], data_payload['from_id'],
                                                                  data_payload['id_message'])
                            continue
                        # send messages from active contact
                        if data_payload['status'] == 7:
                            try:
                                with self.thread_lock:
                                    messages = self.message_storage.get_messages(data_payload['userId'],
                                                                                 data_payload['idContact'])
                                    messages_history = self.message_storage.get_history_message(data_payload['userId'],
                                                                                                data_payload['idContact'])
                                message = {"status": 7, "messages_contact": messages,
                                           "subId": str(data_payload['idContact']), 'message_history': messages_history}
                                connection.send(self.send_frame(json.dumps(message).encode(), 0x1))
                                continue
                            except ConnectionAbortedError as Error7:
                                self.loger.set_log(Error7)
                                break
                        #call request received
                        if data_payload['status'] == 11:
                            try:
                                with self.thread_lock:
                                    #check if user online
                                    whom_id_socket = self.socket_storage.getusersdata(data_payload['idContact'])
                                if whom_id_socket[0]:
                                    message = {"status": 12, "userId": int(data_payload['userId']),
                                               "nameUser": str(data_payload['nameUser'])}
                                    whom_id_socket[1].send(self.send_frame(json.dumps(message).encode(), 0x1))
                                else:
                                    message = {"status": 31}
                                    connection.send(self.send_frame(json.dumps(message).encode(), 0x1))
                                continue
                            except ConnectionAbortedError as Error1:
                                self.loger.set_log(Error1)
                                break
                    except ConnectionAbortedError as Error2:
                        self.loger.set_log(Error2)
                        break
                break
            else:
                connection.send("HTTP/1.1 400 Bad Request\r\n"
                                "Content-Type: text/plain\r\n"
                                "Connection: close\r\n"
                                "\r\n"
                                "Incorrect request")
                return
        return

    def handshake(self, key, connection):
        # calculating response as per protocol RFC
        resp_key = base64.b64encode(hashlib.sha1((key + self.magicString).encode()).digest())
        data_send = "HTTP/1.1 101 Switching Protocols\r\n" + \
                    "Upgrade: websocket\r\n" + \
                    "Connection: Upgrade\r\n" + \
                    "Sec-WebSocket-Accept: %s\r\n\r\n" % (resp_key.decode())
        connection.send(data_send.encode())

    def decode_frame(self, data):
        frame = {}
        payload_length = ''
        payload_offset = ''
        byte1, byte2 = struct.unpack_from('!BB', data)
        frame['fin'] = (byte1 >> 7) & 1
        frame['opcode'] = byte1 & 0xf
        masked = (byte2 >> 7) & 1
        frame['masked'] = masked
        mask_offset = 4 if masked else 0
        payload_hint = byte2 & 0x7f
        if payload_hint < 126:
            payload_offset = 2
            payload_length = payload_hint
        elif payload_hint == 126:
            payload_offset = 4
            payload_length = struct.unpack_from('!H', data, 2)[0]
        elif payload_hint == 127:
            payload_offset = 8
            payload_length = struct.unpack_from('!Q', data, 2)[0]
        frame['length'] = payload_length
        payload = array.array('B')
        payload.frombytes(data[payload_offset + mask_offset:])
        if masked:
            mask_bytes = struct.unpack_from('!BBBB', data, payload_offset)
            for i in range(len(payload)):
                payload[i] ^= mask_bytes[i % 4]
        frame['payload'] = payload.tobytes()
        return frame

    def send_frame(self, buf, opcode, base64=False):
        header = ''
        if base64:
            buf = b64encode(buf)
        b1 = 0x80 | (opcode & 0x0f)  # FIN + opcode
        payload_len = len(buf)
        if payload_len <= 125:
            header = struct.pack('>BB', b1, payload_len)
        elif payload_len > 125 and payload_len < 65536:
            header = struct.pack('>BBH', b1, 126, payload_len)
        elif payload_len >= 65536:
            header = struct.pack('>BBQ', b1, 127, payload_len)
        return header + buf

    def stopserver(self, connection):
        print('Close')
        connection.close()
        self.startserver()

    def contacts_online(self, user_contacts, contacts_online, status=0)->dict:
        all_contacts = {str(online[0]): online[1] for online in user_contacts}
        online = {str(online[0]): online[1] for online in user_contacts if online[0] in contacts_online}
        #Get users online every 10 seconds
        if online and status == 6:
            mes = {"status": 6, "online": online, "allcontacts": all_contacts, "id": 0}
        #Get users online after establishing connection with servers
        elif online:
            mes = {"status": 4, "online": online, "allcontacts": all_contacts, "id": 0}
        else:
            mes = {"status": 5, "online": online, "allcontacts": all_contacts, "id": 0}
        return mes


#start server
if __name__ == '__main__':
    mainServer = Mainserver(ListStorage(), MSMessageStorage(), DictStorage(), LogServerOne())
    mainServer.startserver()