#!/usr/bin/env python
"""
Server for video/audio messaging
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
#for fire server add videomum in path envirt.
#sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from videomum.logobject.logserver1 import LogServerOne
from videomum.usercontacts.msdb.msdbcontacts import MySqlStorage
from videomum.onlinestorage.liststorage import ListStorage


class VAMainserverOne:
    def __init__(self):
        self.myHost = '127.0.0.1'
        self.myPort = 8765
        self.onlinestorage = ListStorage()
        self.magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        self.mainsocket = socket(AF_INET, SOCK_STREAM)
        self.mainsocket.bind((self.myHost, self.myPort))
        self.mainsocket.listen(5)
        self.loger = LogServerOne()
        self.thread_lock = thread.allocate_lock()
        self.thread_count = 0

    def startserver(self):
        print('Start server')
        i = 0
        while True:
            connection, address = self.mainsocket.accept()
            i += 1
            if address:
                print('Start thread1')
                print(self.thread_count)
                self.thread_count += 1
                thread.start_new_thread(self.getalk, (connection, ))

    def getalk(self, connection):
        while True:
            data = connection.recv(1024).strip().decode('latin-1')
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
                        dataGet = connection.recv(1024)
                        dataClean = self.decode_frame(dataGet)
                        # if reload brouser, close page or send "bye"
                        if dataClean['payload'] == b'\x03\xe9':
                            break
                        data_payload = json.loads(dataClean['payload'].decode())
                        #if the user has finished work
                        if data_payload['status'] == 3 or data_payload['status'] == 8:
                            with self.thread_lock:
                                self.onlinestorage.deleteuserid(data_payload['userId'])
                            connection.close()
                            break
                        # connections established, write user id to user online storage
                        if data_payload['status'] == 1:
                            with self.thread_lock:
                                # check if there is a user in the repository online
                                self.onlinestorage.checkuserid(data_payload['userId'])
                            #send answer
                            connection.send(self.send_frame(json.dumps({"status": 10, "id": 0}).encode(), 0x1))
                            file = open(os.path.join(settings.BASE_DIR, 'media')+'\\myvideo.mp4', 'wb')
                            # file = open('my.mp4', 'wb')
                            while True:
                                dataGetw = connection.recv(100000)
                                #print(dataGetw)
                                dataCleans = self.decode_frame(dataGetw)
                                print(dataCleans['length'])
                                # the frame does not contain continuation(came all the data)
                                if dataCleans['opcode'] == 2 and dataCleans['fin'] == 1 and dataCleans['length'] < 60000:
                                    file.write(dataCleans['payload'])
                                    # connection.send(self.send_frame(dataCleans['payload'], 0x2))
                                    continue
                                #pong
                                if dataCleans['opcode'] == 9:
                                    connection.send(self.send_frame(dataCleans['payload'], 0xA))
                                    continue
                                #close connection with frame
                                if dataCleans['opcode'] == 8:
                                    print('Thread close2')
                                    connection.close()
                                    self.thread_count -= 1
                                    break

                                if dataCleans['opcode'] == 2 and dataCleans['fin'] == 0:
                                    chunk_frame = dataCleans['payload']
                                    continue

                                if dataCleans['opcode'] == 0 and dataCleans['fin'] == 1 and chunk_frame:
                                    chunk_frame += dataCleans['payload']
                                    connection.send(self.send_frame(chunk_frame, 0x2))
                                    chunk_frame = ''
                                    continue
                                #the frame does not contain continuation(came all the data)
                                if dataCleans['opcode'] == 2 and dataCleans['fin'] == 1 and dataCleans['length'] > 65536:
                                    # s1 = dataCleans['payload'][0:len(dataCleans['payload'])//2]
                                    # print(s1)
                                    # connection.send(
                                    #     self.send_frame(s1, 0x2))
                                    # connection.send(
                                    #     self.send_frame(dataCleans['payload'][len(dataCleans['payload']) // 2:], 0x2))
                                    print(dataCleans['payload'])
                                    connection.send(self.send_frame(dataCleans['payload'], 0x2))
                                    continue
                                elif dataCleans['opcode'] == 1:
                                    try:
                                        data_payloads = json.loads(dataCleans['payload'].decode())
                                        # if reload brouser, close page
                                        if data_payloads['status'] == 3:
                                            print('Thread close2')
                                            connection.close()
                                            self.thread_count -= 1
                                            break
                                        # if the user has finished work
                                        if data_payloads['status'] == 8:
                                            connection.close()
                                            self.thread_count -= 1
                                            break
                                    except (ConnectionAbortedError, UnicodeDecodeError, json.decoder.JSONDecodeError) as Error5:
                                        self.loger.set_log(Error5)
                                        continue
                            break
                    except ConnectionAbortedError as Error2:
                        self.loger.set_log(Error2)
                        print('Thread close4')
                        self.thread_count -= 1
                        break
                break
            else:
                connection.send("HTTP/1.1 400 Bad Request\r\n"
                                "Content-Type: text/plain\r\n"
                                "Connection: close\r\n"
                                "\r\n"
                                "Incorrect request")
                self.thread_count -= 1
                return
        self.thread_count -= 1
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
        #b1 = 0x80 | opcode  # FIN + opcode
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
    mainServer = VAMainserverOne()
    mainServer.startserver()