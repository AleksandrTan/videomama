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
let sockConnect = getSocketConnect();

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
//make contact active
$('#onlineList').on('click', 'p', function () {
    $('#inTouch').text(this.getAttribute('name'));
    dataconnect.activTouchName = this.getAttribute('name');
    dataconnect.activTouchId = this.id;
    //get messages from contact
    if (this.lastChild.innerHTML != ''){
        $('#hellopreloader_preload').css({'display':'block', 'opacity': '0.5'});
        sockConnect.send(prepareData(7, dataconnect.userId, dataconnect.activTouchId));
    }
});
//Prepare data for message request
function prepareDataMessage(status, idUser, subId=0, message='', userName='') {
    return '{"status":'+status+', "userId":'+idUser+', "subId":'+subId+',' +
           ' "message":"'+message+'", "userName":"'+userName+'"}'
}

function sendMessage() {
    let sendText = $('#dataSend').val();
    if (!sendText){
        return
    }
    let getText = $('#dataGet').text();
    if (dataconnect.activTouchId){
        sockConnect.send(prepareDataMessage(2, dataconnect.userId, dataconnect.activTouchId, sendText, dataconnect.userName));
        $('#dataGet').text(getText + '\n' + dataconnect.userName + ':' +sendText + '\n');
        $('#dataSend').val('');
    }
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

//Get answer on server
sockConnect.onmessage = function(event) {
    let answer = JSON.parse(event.data);
    console.log(answer);
    //Get message
    if(answer.status == 2){
        let text = $('#dataGet').text();
        //if isset message(messages)
        if (answer.message){
            let new_messages = '';
            for (let key in answer.message){
                if (dataconnect.activTouchId == answer.message[key]['from_id'] ){
                    new_messages = new_messages  + '\n' + answer.message[key]['from_name'] + ' : ' + answer.message[key]['text_message'] + '\n'
                }
            }
            $('#dataGet').text(text + new_messages);
        }
    }
    //Get users online after establishing connection with servers
    else if((answer.status == 4) || (answer.status == 5)){
        parseOnline(answer.online, answer.allcontacts, answer.isset_messages);
    }
    //Get users online every 10 seconds
    else if (answer.status == 6){
        parseOnlineTimer(answer.online, answer.allcontacts, answer.isset_messages);
    }
    else if (answer.status == 7){
        showMesActivate(answer);
    }
};

//Prepare data for service request
function prepareData(status, idUser, idContact=0) {
    return '{"status":'+status+', "userId":'+idUser+', "idContact":'+idContact+'}';
}
//Show messages from activate contact(status - 7)
function showMesActivate(answer) {
   $('#dataGet').text('');
        //if isset message(messages)
   if (answer.messages_contact){
        let new_messages = '';
        for (let key in answer.messages_contact){
            new_messages = new_messages  + '\n' +answer.messages_contact[key]['from_name'] + ' : ' + answer.messages_contact[key]['text_message'] + '\n'
        }
        $('#dataGet').text(new_messages);
        $('#hellopreloader_preload').css({'display':'none', 'opacity': '0.5'});
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

//Check users online every 10 seconds
setInterval(function () {
    sockConnect.send(prepareData(6, dataconnect.userId));
}, 10000);

//Parse list users online every 10 seconds
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
    console.log(dataconnect.usersOnline);
}

//Close connect with button
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