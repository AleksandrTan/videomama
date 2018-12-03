from socket import *


class Mainclient:
    def __init__(self):
        self.myHost = 'localhost'
        self.myPort = 50007
        self.mainsocket = socket(AF_INET, SOCK_STREAM)

    def startclient(self):
        self.mainsocket.connect((self.myHost, self.myPort))
        for i in range(5):
            self.mainsocket.send(b'Hello Mainserver!!!')
            data = self.mainsocket.recv(1024)
            print(data)
        self.stopclient()

    def stopclient(self):
        self.mainsocket.close()


if __name__ == '__main__':
    mainServer = Mainclient()
    mainServer.startclient()