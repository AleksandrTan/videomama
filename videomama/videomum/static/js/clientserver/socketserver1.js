/**
 * Created by user on 05.02.2019.
 */
(function(){
    //-----------variables for audio content-----------------------//
    let flag = 0;
    let storage = [];
    let recorder;
    let mediaStream;
    //let mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    let mimeCodecVideo = 'video/webm;codecs="vp8, opus"';
    let mimeTypesVideo = 'video/webm';
    let is_video = false;
    let is_audio = true;
    let mimeCodecAudio = 'audio/webm;codecs="opus"';
    let mimeTypesAudio = 'audio/webm';
    let sourceBuffer;
    let mediaSource;
    let replay;
    let parent_div = document.getElementById('parent_div');
    let parent_div1 = document.getElementById('parent_div1');
    let startButton = document.getElementById('audio_call');
    let stopButton = document.getElementById('stop_audio');

    if (!'MediaSource' in window && !MediaSource.isTypeSupported(mimeCodec)) {
            alert('Unsupported MIME type or codec: ', mimeCodecVideo);
    }

    //---------------------Socket----------------------------//

    function getSocketConnect(){
        let myHost = '127.0.0.1';
        let myPort = 50007;
        let connection = new WebSocket("ws://"+myHost+":"+myPort);
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
    sockConnect.onerror = function(error) {
       console.log("Error " + error.message);
    };
    //-----------------------------------------Audio section--------------------------------------------------//
    function getVideoStream() {
            navigator.mediaDevices.getUserMedia({
                audio: is_audio,
                video: is_video
            })
            .then(function (stream) {
                mediaStream = stream;
                mediaSource = new MediaSource();
                replay = (is_video)?document.createElement('video'):document.createElement('audio');
                replay.setAttribute('controls', 'controls');
                replay.src = window.URL.createObjectURL(mediaSource);
                replay.load();
                replay.play();
                parent_div.appendChild(replay);
                mediaSource.addEventListener('sourceopen', function () {
                    if (stream){
                        sourceBuffer = (is_video)?mediaSource.addSourceBuffer(mimeCodecVideo)
                            :mediaSource.addSourceBuffer(mimeCodecAudio);
                        getRecorder();
                        setTimeout(function () {
                            recorder.start(100);
                        }, 1000);
                        //recorder.start(100);
                    }

                });
                //myvideo = document.createElement('video');
                //myvideo.srcObject = stream;
                //parent_div1.appendChild(myvideo);
                //myvideo.play();
            })
            .catch(function(err) {
                console.log(err);
            });
        }

    function getRecorder() {
            let mimeTypes = (is_video)?mimeTypesVideo:mimeTypesAudio;
            let options = { mimeType: mimeTypes, audioBitsPerSecond: 128000 };
            recorder = new MediaRecorder(mediaStream, options);
            recorder.ondataavailable = videoDataHandler;
            recorder.addEventListener('stop', function () {
                mediaSource.endOfStream();
                mediaSource.removeSourceBuffer(sourceBuffer);
                mediaSource = '';
                sourceBuffer = '';
                mediaStream = '';
                replay.remove();
                flag = 0;
                storage = [];
            });
        }

    function videoDataHandler(event) {
            if (recorder.state == 'recording'){
                let fileReader = new FileReader();
                fileReader.readAsArrayBuffer(event.data);
                fileReader.onload = function() {
                    s = fileReader.result;
                    console.log(s);
                    sockConnect.send(s);
                    if (sourceBuffer.updating || storage.length > 0){
                        k = storage.pop();
                        console.log(k);
                        try{
                            sourceBuffer.appendBuffer(k);
                        }
                        catch (m){
                            console.log(m);
                        }
                        //sourceBuffer.appendBuffer(storage.pop());
                    }

                };
            }
        }

    startButton.addEventListener('click', function (e) {
        if (dataconnect.activTouchId && dataconnect.activTouchId in dataconnect.usersOnline){
            $('#subscribe_id_call').text(dataconnect.activTouchName);
            $('#myModalAudioCalling').modal();
            flag = 2;
            sockConnect.send(prepareDataAV(11, dataconnect.userId, dataconnect.activTouchId, dataconnect.userName));
        }
        else {
            $('#myModal').modal();
            return false;
        }
            //getVideoStream();
        });

    stopButton.addEventListener('click', function (e) {
            flag = 0;
            //recorder.stop();
        });

    //-----------------------------------------Message section--------------------------------------------------//
    //make contact active
    $('#onlineList').on('click', 'p', function () {
        if (this.id == dataconnect.activTouchId){
            return false;
        }
        $('#inTouch').text(this.getAttribute('name'));
        dataconnect.activTouchName = this.getAttribute('name');
        dataconnect.activTouchId = this.id;
        $('#dataGet').text('');
        //get messages from contact
        $('#hellopreloader_preload').css({'display':'block', 'opacity': '0.5'});
        sockConnect.send(prepareData(7, dataconnect.userId, dataconnect.activTouchId));
    });
    //Send with button
    $('#sendButton').on('click', function () {
       sendMessage()
    });
    //Send with "Enter" key
    $('html').keydown(function(e){
      if (e.keyCode == 13) {
            sendMessage()
        }
    });
    ///--------------------------------------Services functions---------------------------///
    //Prepare data for message request
    function prepareDataMessage(status, idUser, subId=0, message='', userName='') {
        return '{"status":'+status+', "from_id":'+idUser+', "whom_id":'+subId+',' +
               ' "text_message":"'+message+'", "from_name":"'+userName+'"}'
    }
    //send message
    function sendMessage() {
        let sendText =  $('#dataSend').val().replace(/"/g, "'");
        if (dataconnect.activTouchId && sendText){
            let getText = $('#dataGet').text();
            sockConnect.send(prepareDataMessage(2, dataconnect.userId, dataconnect.activTouchId, sendText, dataconnect.userName));
            $('#dataGet').text(getText + currentTime() + ' ' + dataconnect.userName + ':' +sendText + '\n');
            $('#dataSend').val('');
        }
        else {
            $('#myModal').modal();
            return false;
        }
    }
    //current time
    function currentTime(){
        let Data = new Date();
        let Hour = Data.getHours();
        let Minutes = Data.getMinutes();
        let Seconds = Data.getSeconds();
        return ''+Hour+':'+Minutes+':'+Seconds;
    }
    //Prepare data for service request
    function prepareData(status, idUser, idContact=0) {
        return '{"status":'+status+', "userId":'+idUser+', "idContact":'+idContact+'}';
    }
    //Prepare data to confirm the reading of the message
    function prepareDataConfirm(status, idUser, idContact=0, id_message=0) {
        return '{"status":'+status+', "whom_id":'+idUser+', "from_id":'+idContact+', "id_message":'+id_message+'}';
    }
    //Prepare data for audio/video request
    function prepareDataAV(status, idUser, idContact=0, nameUser) {
        return '{"status":'+status+', "userId":'+idUser+', "idContact":'+idContact+', "nameUser":"'+nameUser+'"}';
    }
    //Show message from active(number from not active contact)
    function showMessage(answer) {
        let text = $('#dataGet').text();
            //if isset message(messages)
            if (answer.messages_contact){
                let new_messages = '';
                for (let key in answer.messages_contact){
                    if (dataconnect.activTouchId == answer.messages_contact[key]['from_id'] ){
                        new_messages = new_messages + answer.messages_contact[key]['time_create'] + ' '
                            +  answer.messages_contact[key]['from_name'] + ' : ' +
                            answer.messages_contact[key]['text_message'] + '\n';
                        //send confirm
                        sockConnect.send(prepareDataConfirm(22, dataconnect.userId, answer.messages_contact[key]['from_id'],
                        key));
                    }
                    else {
                        let count_mes = $("#" + answer.messages_contact[key]['from_id'] + "").find("span").text();
                        console.log(count_mes);
                        if (count_mes != ''){
                            $("#" + answer.messages_contact[key]['from_id'] + "").find("span").text( parseInt(count_mes) + 1);
                        }
                        else {
                            $("#" + answer.messages_contact[key]['from_id'] + "").find("span").text(1);
                        }
                    }
                }
                $('#dataGet').text(text + new_messages);
            }
    }
    //Show messages from activate contact(status - 7)
    function showMesActivate(answer) {
       $('#dataGet').text('');
            //if isset message(messages)
       if (answer.messages_contact){
            let new_messages = '';
            for (let key in answer.messages_contact){
                new_messages = new_messages  + answer.messages_contact[key]['time_create'] + ' '
                    + answer.messages_contact[key]['from_name'] + ' : ' + answer.messages_contact[key]['text_message'] + '\n'
            }
            $('#dataGet').text(new_messages);
            $('#hellopreloader_preload').css({'display':'none', 'opacity': '0.5'});
            $("#" + answer.subId + "").find("span").text('');
       }
    }
    //Show messages from active contact(status - 8)
    function showMesActive(answer) {
       let isset_text = $('#dataGet').text();
            //if isset message(messages)
       if (answer.messages_contact){
            let new_messages = '';
            for (let key in answer.messages_contact){
                new_messages = new_messages  + answer.messages_contact[key]['time_create'] + ' '
                    + answer.messages_contact[key]['from_name'] + ' : ' + answer.messages_contact[key]['text_message'] + '\n'
            }
            $('#dataGet').text(isset_text + new_messages);
       }
    }
    //Show history messages
    function showHistory(answer) {
        let isset_text = $('#dataGet').text();
            //if isset message(messages)
       if (answer.message_history){
            let new_messages = '';
            for (let key in answer.message_history){
                new_messages = new_messages  + answer.message_history[key]['time_create'] + ' '
                    + answer.message_history[key]['from_name'] + ' : ' + answer.message_history[key]['text_message'] + '\n'
            }
            $('#dataGet').text(isset_text + new_messages);
           $("#" + answer.subId + "").find("span").text('');
       }
    }
    //Parse list users online
    function parseOnline(usersOnline = {}, allContacts = {}, isset_messages = {}) {
        let parentList = $('#onlineList');
        //if user have contacts
        if (!$.isEmptyObject(allContacts)){
            dataconnect.usersContacts = allContacts;
            parentList.empty();
            for(let key in allContacts){
                parentList.append('<p id="'+key+'" name="'+allContacts[key]+'"><button type="button" class="btn btn-xs btn-danger" ' +
                                  'data-id-online="'+key+'">'+allContacts[key]+'</button><span style="color:black;"></span></p>');
            }
        }
        else {
            dataconnect.usersOnline = {};
            dataconnect.usersContacts = {};
            dataconnect.activTouchName = '';
            dataconnect.activTouchId = 0;
            parentList.empty();
            parentList.append('<p>There are no subscribers in the network</p>');
            return false;
        }
        //if user contacts online
        if (!$.isEmptyObject(usersOnline)){
            dataconnect.usersOnline = usersOnline;
            for(let key in usersOnline){
                if($("#" + key + "")){
                    $('#'+key+'').find("button").removeClass('btn-danger').addClass('btn-success');
                }
            }
        }
        //if user have some messages
        if (!$.isEmptyObject(isset_messages)){
            for(let key in isset_messages){
                if(isset_messages[key]['mes_count'] != 0 && key != dataconnect.activTouchId){
                    $('#'+key+'').find("span").text(isset_messages[key]['mes_count']);
                }
            }
        }
    }
    //Parse list users online every 10 seconds(status - 6)
    function parseOnlineTimer(usersOnline = {}, allContacts = {}, isset_messages = {}) {
        //if the user's contacts are not displayed yet
        // (for example, the user had no contacts and he established a new contact)
        if ($.isEmptyObject(dataconnect.usersContacts)){
            parseOnline(usersOnline, allContacts, isset_messages);
            return;
        }
        //check displayed contacts (someone added, someone removed)
        if (!$.isEmptyObject(allContacts)){
            //delete remove contacts
            for(let key in dataconnect.usersContacts){
                if(key in allContacts){
                    continue;
                }
                else {
                    delete dataconnect.usersContacts[key];
                    $("#"+key+"").remove();
                }
            }
            //add contacts
            let parentList = $('#onlineList');
            for (let key in allContacts){
                if (key in dataconnect.usersContacts){
                    continue;
                }
                else {
                    dataconnect.usersContacts[key] = allContacts[key];
                    parentList.append('<p id="'+key+'" name="'+allContacts[key]+'"><button type="button" class="btn btn-xs btn-danger" ' +
                                      'data-id-online="'+key+'">'+allContacts[key]+'</button></p>');
                }
            }
        }
        //check online status
        dataconnect.usersOnline = usersOnline;
        for(let key in allContacts){
            if(key in usersOnline){
                $('#'+key+'').find("button").removeClass('btn-danger').addClass('btn-success');
            }
            else {
                $('#'+key+'').find("button").removeClass('btn-success').addClass('btn-danger');
            }
        }
        //if user have some messages
        if (!$.isEmptyObject(isset_messages)){
            for(let key in isset_messages){
                if(isset_messages[key]['mes_count'] != 0 && key != dataconnect.activTouchId ){
                    $('#'+key+'').find("span").text(isset_messages[key]['mes_count']);
                }
            }
        }
    }

    ////-------------------------------Periodic requests--------------------------------///
    //Check users online every 10 seconds(status - 6)
     setInterval(function () {
         if (sockConnect.readyState == 1 && flag == 0) {
             sockConnect.send(prepareData(6, dataconnect.userId));
         }
     }, 10000);
    //Check messages from active contact every 5 seconds(status  - 8)
     //setInterval(function () {
     //    if (sockConnect.readyState == 1 && dataconnect.activTouchId) {
     //        sockConnect.send(prepareData(8, dataconnect.userId, dataconnect.activTouchId));
     //    }
    // }, 5000);

    ////---------------------------------Get Server response------------------------------------///
    //Get server response
    sockConnect.onmessage = function(event) {
        let answer = JSON.parse(event.data);
        console.log(answer);
        //Get message
        if(answer.status == 2){
            showMessage(answer);
        }
        //Get users online after establishing connection with servers
        else if((answer.status == 4) || (answer.status == 5)){
            parseOnline(answer.online, answer.allcontacts, answer.isset_messages);
        }
        //Get users online every 10 seconds
        else if (answer.status == 6){
            parseOnlineTimer(answer.online, answer.allcontacts, answer.isset_messages);
            console.log(answer.online);
        }
        else if (answer.status == 7){
            console.log(answer);
            if (!$.isEmptyObject(answer.message_history)){
                showHistory(answer);
            }
            else {
                showMesActivate(answer);
            }
            //showMesActivate(answer);
            //showHistory(answer);
            $('#hellopreloader_preload').css({'display':'none', 'opacity': '0.5'});
        }
        //Incoming call from the subscriber
        else if (answer.status == 12){
            if (answer.userId == dataconnect.activTouchId){
                $('#subscribe_id_caller').text(answer.nameUser);
                $('#myModalAudioCallee').modal();
                flag = 2;
            }
        }

        //else if (answer.status == 8){
        //    showMesActive(answer);
        //}
    };

    //-----------------------------------------Message section--------------------------------------------------//

    ///////////------------------------Close connections-------------------------------------///
    //Close connect with button(status - 3)
    $('#closeButton').on('click', function () {
        delete dataconnect.usersOnline[dataconnect.userId];
        dataconnect.activTouchName = '';
        dataconnect.activTouchId = 0;
        $('#onlineList').empty();
        $('#dataGet').text('');
        sockConnect.send(prepareData(3, dataconnect.userId));
        sockConnect.close();
    });
    //Close brouser or page
    window.onbeforeunload = function () {
        delete dataconnect.usersOnline[dataconnect.userId];
        dataconnect.activTouchName = '';
        dataconnect.activTouchId = 0;
        $('#onlineList').empty();
        $('#dataGet').text('');
        sockConnect.send(prepareData(3, dataconnect.userId));
        sockConnect.close();
    };
    sockConnect.onclose = function(event) {
        if (this.readyState == 2 || this.readyState == 3) {
            $('#serverStatus').text('Server is not available...').css('color', 'red');
            console.log("Соединение Закрыто корректно...");
            dataconnect.usersOnline = {};
            dataconnect.serverStatus = 0;
            dataconnect.activTouchName = '';
            dataconnect.activTouchId = 0;
            $('#onlineList').empty();
            $('#dataGet').text('');
            $('#closeButton').hide();
        }
    };
})();