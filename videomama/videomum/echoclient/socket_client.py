import socketio

sio = socketio.Client()


@sio.event
def connect():
    print('connection established', sio.sid)
    # sio.emit('my_message', {'response': 'my response'})


@sio.event
def disconnect():
    print('disconnected from server')


@sio.event
def pong_from_server(data):
    print('pong_from_server1000', data)


sio.connect('http://localhost:5000')
sio.wait()