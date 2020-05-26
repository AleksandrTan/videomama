from socket import *
import hashlib
import base64
import struct
import array


class Mainserver:

    def __init__(self):
        self.myHost = '127.0.0.1'
        self.myPort = 50007
        self.magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        self.mainsocket = socket(AF_INET, SOCK_STREAM)
        self.mainsocket.bind((self.myHost, self.myPort))
        self.mainsocket.listen(5)

    def startserver(self):
        while True:
            print('Start server')
            connection, address = self.mainsocket.accept()
            if address:
                self.getalk(connection)

    def getalk(self, connection):
        while True:
            data = connection.recv(1024).strip().decode('latin-1')
            if not data: break
            print(data)
            headers = data.split("\r\n")
            if (
                    "Connection: Upgrade" in data or "Connection: keep-alive, Upgrade" in data) and "Upgrade: websocket" in data:
                # getting the websocket key out
                for h in headers:
                    if "Sec-WebSocket-Key" in h:
                        key = h.split(" ")[1]
                        # let's shake hands shall we?
                self.handshake(key, connection)
                while True:
                    payload = self.decode_frame(bytearray(connection.recv(1024).strip()))
                    print(len(payload))
                    try:
                        decoded_payload = payload.decode('utf-8')
                        self.send_frame(payload, connection)
                        if decoded_payload == 'bye':
                            break
                    except UnicodeDecodeError:
                        break
                self.stopserver(connection)
            else:
                connection.send("HTTP/1.1 400 Bad Request\r\n" + \
                                "Content-Type: text/plain\r\n" + \
                                "Connection: close\r\n" + \
                                "\r\n" + \
                                "Incorrect request")
        self.stopserver(connection)

    def handshake(self, key, connection):
        # calculating response as per protocol RFC
        resp_key = base64.b64encode(hashlib.sha1((key + self.magicString).encode()).digest())
        data_send = "HTTP/1.1 101 Switching Protocols\r\n" + \
                    "Upgrade: websocket\r\n" + \
                    "Connection: Upgrade\r\n" + \
                    "Sec-WebSocket-Accept: %s\r\n\r\n" % (resp_key.decode())
        connection.send(data_send.encode())

    def decode_frame(self, frame):
        opcode_and_fin = frame[0]
        # assuming it's masked, hence removing the mask bit(MSB) to get len. also assuming len is <125
        payload_len = frame[1] - 128

        mask = frame[2:6]
        encrypted_payload = frame[6: 6 + payload_len]

        payload = bytearray([encrypted_payload[i] ^ mask[i % 4] for i in range(payload_len)])

        return payload

    def send_frame(self, payload, connection):
        # setting fin to 1 and opcpde to 0x1
        frame = [129]
        # adding len. no masking hence not doing +128
        frame += [len(payload)]
        # adding payload
        frame_to_send = bytearray(frame) + payload

        connection.send(frame_to_send)

    def stopserver(self, connection):
        print('Close')
        connection.close()
        self.startserver()


if __name__ == '__main__':
    mainServer = Mainserver()
    mainServer.startserver()