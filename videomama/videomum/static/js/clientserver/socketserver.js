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
        $('#dataGet').text(text + '\n' + answer.subName + ' : ' + answer.message[1] + '\n');
    }
    //Get users online after establishing connection with servers
    else if((answer.status == 4) || (answer.status == 5)){
        parseOnline(answer.online, answer.allcontacts);
    }
    //Get users online every 10 seconds
    else if (answer.status == 6){
        parseOnlineTimer(answer.online, answer.allcontacts);
    }
};

//Prepare data for sending
function prepareData(status, idUser, idSub=0, message) {
    return '{"status":'+status+', "userId":'+idUser+', "subId":'+dataconnect.activTouchId+',' +
           ' "mes":"'+message+'", "subName":"'+dataconnect.activTouchName+'"}'
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
function parseOnline(usersOnline = {}, allContacts = {}) {
    let parentList = $('#onlineList');
    if (!$.isEmptyObject(allContacts)){
        dataconnect.usersContacts = allContacts;
        parentList.empty();
        for(let key in allContacts){
            parentList.append('<p id="'+key+'"><button type="button" class="btn btn-xs btn-danger" ' +
                              'data-id-omline="'+key+'">'+allContacts[key]+'</button></p>');
        }
    }
    else {
        dataconnect.usersOnline = {};
        dataconnect.usersContacts = {};
        parentList.empty();
        parentList.append('<p>There are no subscribers in the network</p>');
        return false;
    }
    if (!$.isEmptyObject(usersOnline)){
        dataconnect.usersOnline = usersOnline;
        for(let key in usersOnline){
            if($("#" + key + "")){
                $('#'+key+'').find("button").removeClass('btn-danger').addClass('btn-success');
            }
        }
    }
}

//Check users online every 10 seconds
setInterval(function () {
    sockConnect.send(prepareData(6, dataconnect.userId, 0, 'Get users online'));
}, 10000);

//Parse list users online every 10 seconds
function parseOnlineTimer(usersOnline = {}, allContacts = {}) {
    //if the user's contacts are not displayed yet
    // (for example, the user had no contacts and he established a new contact)
    if ($.isEmptyObject(dataconnect.usersContacts)){
        parseOnline(usersOnline, allContacts);
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
                parentList.append('<p id="'+key+'"><button type="button" class="btn btn-xs btn-danger" ' +
                                  'data-id-omline="'+key+'">'+allContacts[key]+'</button></p>');
            }
        }
    }
    //check online status
    dataconnect.usersOnline = usersOnline;
    for(let key in allContacts){
        if(key in usersOnline){
            $('#'+key+'').find("button").removeClass('btn-danger').addClass('btn-success');;
        }
        else {
            $('#'+key+'').find("button").removeClass('btn-success').addClass('btn-danger');
        }
    }
    console.log(dataconnect.usersOnline);
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
        $('#onlineList').empty();
        $('#closeButton').hide();
    }
};
})();