/**
 * Created by user on 17.12.2018.
 */
(function () {
//////----------- Socket section------------------------------------////
    let connection;
    function getSocketConnect() {
        let myHost = '127.0.0.1';
        let myPort = 50008;
        connection = new WebSocket("ws://" + myHost + ":" + myPort);
        connection.binaryType = 'arraybuffer';
        return connection;
    }
//Create socket object
    let sockConnect = getSocketConnect();
//open connection
    sockConnect.onopen = function(ws) {
        console.log("Соединение открыто...");
        if(this.readyState == 1){
            //send user id after establishing connection
            setTimeout(function () {
                sockConnect.send(prepareData(1, dataconnect.userId));
                $('#serverStatus').text('Server connected...').css('color', 'green');
                dataconnect.serverStatus = 1;
                $('#closeButton').show();
            }, 1000);
        }
    };
    sockConnect.onmessage = function(event) {
        let answer = JSON.parse(event.data);
        //Get message
        if(answer.status == 10){
            console.log(event.data);
        }
    };

    //Prepare data for service request
    function prepareData(status, idUser, idContact=0) {
        return '{"status":'+status+', "userId":'+idUser+', "idContact":'+idContact+'}';
    }
//////----------- Media section------------------------------------////

    let recorder;
    let mediaStream;
    let fileReader = new FileReader();
    let sourceBuffer;
    let mediaSource = new MediaSource();
    let replay = document.getElementById('blobs-video');
    let startButton = document.getElementById('record');
    let stopButton = document.getElementById('stop');

    function uas(str) {
        alert(navigator.userAgent);
        return navigator.userAgent.indexOf(str) == 0;
    }
//Take videostream user
    function getVideoStream() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        .then(function (stream) {
            mediaStream = stream;
            //let a = document.getElementById('video');
            //a.srcObject = stream;
            //document.getElementById('blobs-video').srcObject =mediaStream;
            replay.src = window.URL.createObjectURL(mediaSource);
            replay.play();
            getRecorder();
        })
        .catch(function(err) {
          console.log(err);
        });
    }

    function getRecorder() {
        let options = { mimeType: 'video/webm', audioBitsPerSecond: 128000 };
        recorder = new MediaRecorder(mediaStream, options);
        recorder.ondataavailable = videoDataHandler;
    }

    function videoDataHandler(event) {
        //let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(event.data);
        fileReader.onload = function() {
            sourceBuffer.appendBuffer(fileReader.result);
            //connection.send(fileReader.result);
        };
    }

    startButton.addEventListener('click', function (e) {
        getVideoStream();
        setTimeout(function () {
            recorder.start(5000);
        }, 1000);
        //if (mediaSource.activeSourceBuffers.length == 0){
        //    sourceBuffer = mediaSource.addSourceBuffer('video/webm;codecs="vp8, opus"');
        //}
        //recorder.start(5000);
    });
    stopButton.addEventListener('click', function (e) {
        recorder.stop();
        mediaSource.endOfStream();
        setTimeout(function(){
            if(mediaSource.activeSourceBuffers.length == 1){
                mediaSource.removeSourceBuffer(sourceBuffer);
                replay.src = '';
                replay.src = window.URL.createObjectURL(mediaSource);
            }
        },
            1000);
    });
    //getVideoStream();
    //getWebSocket();
})();