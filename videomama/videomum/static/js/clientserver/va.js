/**
 * Created by user on 17.12.2018.
 */
(function () {
//////----------- Socket section------------------------------------////
    let connectionv;
    let flag = 0;
    let recorder;
    let mediaStream;
    let fileReader = new FileReader();
    let sourceBuffer;
    let mediaSource = new MediaSource();
    let replay = document.getElementById('blobs-video');
    let startButton = document.getElementById('record');
    let stopButton = document.getElementById('stop');
    let queue = [];
    let local_storage = [];
    replay.src = window.URL.createObjectURL(mediaSource);
    replay.addEventListener('error',function(e){ console.error(e); });
    //console.log(queue);
    function getSocketConnectv() {
        let myHost = '127.0.0.1';
        let myPort = 50009;
        connectionv = new WebSocket("ws://" + myHost + ":" + myPort);
        connectionv.binaryType = 'arraybuffer';
        return connectionv;
    }
//Create socket object
    let sockConnectV = getSocketConnectv();
    sockConnectV.onerror = function(error) {
     console.log("Error " + error.message);
    };
//open connection
    sockConnectV.onopen = function(ws) {
        //console.log("Соединение открыто...");
        if(this.readyState == 1){
            //send user id after establishing connection
            setTimeout(function () {
                sockConnectV.send(prepareData(1, 1));
                //console.log("req");
            }, 1000);
        }
    };
    sockConnectV.onmessage = function(event) {
          if (flag == 0){
              let answer = JSON.parse(event.data);
            //Get message
              if(answer.status == 10){
                  //console.log(event.data);
                  flag = 1;
              }
          }
          else {
             queue.unshift(event.data);
          }
    };
    //Prepare data for service request
    function prepareData(status, idUser, idContact=0) {
        return '{"status":'+status+', "userId":'+idUser+', "idContact":'+idContact+'}';
    }
//////----------- Media section------------------------------------////

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
            getRecorder();
        })
        .catch(function(err) {
            console.log(err);
        });
    }

    function getRecorder() {
        let options = { mimeType: 'video/webm',
                        //audioBitsPerSecond: 128000
                      };
        recorder = new MediaRecorder(mediaStream, options);
        recorder.ondataavailable = videoDataHandler;
    }

    function videoDataHandler(event) {
        fileReader = new FileReader();
        fileReader.readAsArrayBuffer(event.data);
        fileReader.onload = function() {
            connectionv.send(fileReader.result);
            //console.log(fileReader.result);
            if (sourceBuffer.updating || queue.length > 0){
                sourceBuffer.appendBuffer(queue.pop());
            }
        };
    }

    startButton.addEventListener('click', function (e) {
        //replay.play();
        if (mediaSource.activeSourceBuffers.length == 0){
            replay.play();
            sourceBuffer = mediaSource.addSourceBuffer('video/webm;codecs="vp8, opus"');
        }
        recorder.start(100);
    });
    stopButton.addEventListener('click', function (e) {
        recorder.stop();
        replay.pause();
        mediaSource.endOfStream();
        setTimeout(function(){
            if(mediaSource.activeSourceBuffers.length == 1){
                mediaSource.removeSourceBuffer(sourceBuffer);
                replay.src = '';
                //replay.src = window.URL.revokeObjectURL(mediaSource);
                replay.src = window.URL.createObjectURL(mediaSource);
                queue = [];
            }
        },
            1000);
    });
    getVideoStream();
    //Close brouser or page
        window.onbeforeunload = function () {
            sockConnectV.send(prepareData(3, 1));
            sockConnectV.close();
        };
})();