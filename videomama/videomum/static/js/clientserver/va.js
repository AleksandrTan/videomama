/**
 * Created by user on 17.12.2018.
 */
(function () {
    function getSocketConnect() {
        let myHost = '127.0.0.1';
        let myPort = 50008;
        let connection = new WebSocket("ws://" + myHost + ":" + myPort);
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
})();