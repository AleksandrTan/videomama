/**
 * Created by AlexTan on 26.11.2018.
 */

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
        }, 2000);
    }
};
//Get message
sockConnect.onmessage = function(event) {
    let text = $('#dataGet').text();
    let answer = JSON.parse(event.data);
    //Get message
    if(answer.status == 2){
        $('#dataGet').text(text + '\n' + 'Server:' + answer.message[1] + '\n');
    }
    //Get users online
    else if(answer.status == 4){
        alert(1000);
    }

};

//Close connect
$('#closeButton').on('click', function () {
    sockConnect.send(prepareData(3, dataconnect.userId, 0, 'byeoooo'));
    sockConnect.close();
});

sockConnect.onclose = function(event) {
    if (this.readyState == 2 || this.readyState == 3) {
        $('#serverStatus').text('Server is not available...').css('color', 'red');
        console.log("Соединение Закрыто корректно...");
        dataconnect.serverStatus = 0;
        $('#closeButton').hide();
    }
};
//Prepare data for sending
function prepareData(status, idUser, idSub=0, message) {
    return '{"status":'+status+', "userId":'+idUser+', "subId":'+idSub+', "mes":"'+message+'"}'
}

function sendData() {
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
   sendData()
});
//Send with "Enter" key
$('html').keydown(function(e){
  if (e.keyCode == 13) {
        sendData()
    }
});