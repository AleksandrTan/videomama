/**
 * Created by AlexTan on 26.11.2018.
 */

(function(){
function getSocketConnect(){
    let myHost = '127.0.0.1';
    let myPort = 50007;
    return new WebSocket("ws://"+myHost+":"+myPort);
}
//Create socket
sockConnect = getSocketConnect();

sockConnect.onopen = function(ws) {
    console.log("Соединение открыто...");
    if(this.readyState == 1){
        //send user id after establishing connection
        setTimeout(function () {
            sockConnect.send(prepareData(1, dataconnect.userId, 0, 'Hello'));
            $('#serverStatus').text('Server connected...').css('color', 'green');
            dataconnect.serverStatus = 1;
            $('#closeButton').show();
        }, 1000);
    }
};
//Get answer on server
sockConnect.onmessage = function(event) {
    let answer = JSON.parse(event.data);
    //Get message
    if(answer.status == 2){
        let text = $('#dataGet').text();
        $('#dataGet').text(text + '\n' + 'Server:' + answer.message[1] + '\n');
    }
    //Get users online after establishing connection with servers
    else if((answer.status == 4) || (answer.status == 5)){
        parseOnline(answer.message);
    }
    else if (answer.status == 6){
        parseOnlineTimer(answer.message);
    }
};

//Prepare data for sending
function prepareData(status, idUser, idSub=0, message) {
    return '{"status":'+status+', "userId":'+idUser+', "subId":'+idSub+', "mes":"'+message+'"}'
}

function sendMessage() {
    let sendText = $('#dataSend').val();
    if (!sendText){
        return
    }
    let getText = $('#dataGet').text();
    sockConnect.send(prepareData(2, dataconnect.userId, 0, sendText));
    $('#dataGet').text(getText + '\n' + dataconnect.userName + ':' +sendText + '\n');
    $('#dataSend').val('');
}
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

//Parse list users online
function parseOnline(usersData = {}) {
    let parentList = $('#onlineList');
    if (!$.isEmptyObject(usersData)){
        dataconnect.usersOnline = usersData;
        parentList.empty();
        for(let key in usersData){
            parentList.append('<p><button type="button" class="btn btn-xs btn-primary" data-id-omline="'+key+'">'+usersData[key]+'</button></p>');
        }
        console.log(dataconnect.usersOnline, 0);
    }
    else {
        dataconnect.usersOnline = {};
        parentList.empty();
        parentList.append('<p>There are no subscribers in the network</p>');
        console.log(dataconnect.usersOnline, 9);
    }
}

//Check users online every 5 seconds
setInterval(function () {
    sockConnect.send(prepareData(6, dataconnect.userId, 0, 'Get users online'));
}, 5000);

//Parse list users online every 5 seconds
function parseOnlineTimer(usersData = {}) {
    let parentList = $('#onlineList');
    if ($.isEmptyObject(dataconnect.usersOnline)){
        dataconnect.usersOnline = usersData;
        parentList.empty();
        for(let key in usersData){
            parentList.append('<p id="'+key+'"><button type="button" class="btn btn-xs btn-primary" data-id-omline="'+key+'">'+usersData[key]+'</button></p>');
        }
        return;
    }
    if (!$.isEmptyObject(usersData)){
        console.log(usersData, 1);
        //delete ofline users
        for(let key in dataconnect.usersOnline){
            if (key in usersData){
                continue;
            }
            else {
                delete dataconnect.usersOnline[key];
                $("#"+key+"").remove();
            }
        }
        //add online users
        for(let key in usersData){
            if (key in dataconnect.usersOnline){
                continue;
            }
            else {
                dataconnect.usersOnline[key] = usersData[key];
                parentList.append('<p id="'+key+'"><button type="button" class="btn btn-xs btn-primary" data-id-omline="'+key+'">'+usersData[key]+'</button></p>');
            }
        }
        console.log(dataconnect.usersOnline, 2);
    }
    else {
        parentList.empty();
        parentList.append('<p>There are no subscribers in the network</p>');
        console.log(dataconnect.usersOnline, 3);
    }
}

//Close connect with button
$('#closeButton').on('click', function () {
    delete dataconnect.usersOnline[dataconnect.userId];
    $('#onlineList').empty();
    sockConnect.send(prepareData(3, dataconnect.userId, 0, 'byeoooo'));
    sockConnect.close();
});
//Close brouser or page
window.onbeforeunload = function () {
    delete dataconnect.usersOnline[dataconnect.userId];
    $('#onlineList').empty();
    sockConnect.send(prepareData(3, dataconnect.userId, 0, 'byeoooo'));
    sockConnect.close();
};

sockConnect.onclose = function(event) {
    if (this.readyState == 2 || this.readyState == 3) {
        $('#serverStatus').text('Server is not available...').css('color', 'red');
        console.log("Соединение Закрыто корректно...");
        dataconnect.serverStatus = 0;
        $('#closeButton').hide();
    }
};
})();