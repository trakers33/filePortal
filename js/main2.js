/**
 * Created by guillaumerebmann on 5/7/15.
 */

var app = {other:{},peer:null,trade:{}};

// OTHER
app.other.onClick = function(){
    $(".others .avatar img").on('click',function(){
        // $(this).closest(".others").find("input").click();
        var object = $(this).closest(".others");
        app.sender(object.find(".user-info").data('id'));

    })
}

app.other.init = function(callback){
    app.other.onClick();

    $("body").on("click",".cancel",function(){
        console.log("Clicked");
        var id = $(this).closest(".others").attr("id");
        console.log(id);

    });
    $("body").on("click",".accept",function(){
        console.log("Clicked");
        var id = $(this).closest(".others").attr("id");
        console.log(id);
    });
    app.peer = new Peer($('.you').find(".user-info").data("id"), {key: '4hao8pkyrsve7b9',debug:3});
    return callback();
}

// Sender
app.sender = function(id){
    var peer = app.peer;
    var conn = peer.connect(id);
    app.trade[id] = null;

    _close = function(){
      conn.close();
    }
    _init = function(){
        console.log("SEND: INIT");
        conn.send({message:"initialisation to send a file",action:"init",type:"sender"});
    }
    _accept = function(e){
        if(e == "yes"){
            console.log("SEND: fileSending");
            conn.send({message:"sent the file",action:"fileSending",type:"sender"});
        }else{
            console.log("SEND: NOTHING because no accept");
        }


    }
    _receivedFile = function(){
        console.log("SEND: receivedFILE");
        conn.send({message:"receivedFile",action:"close",type:"sender"});
    }


    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
            if(data.action == "accept"){
                console.log("RECEIVED: accept");
                _accept(data.message);
            }else if(data.action == "receivedFile"){
                console.log("RECEIVED: receivedFile")
                _receivedFile();
            }else if(data.action == "close"){
                console.log("RECEIVED: close")
                _close();
            }
        });

        // Send message
        _init();

    });

}

app.receiver = function(conn){
    var peer = app.peer;
    var conn = conn;
    var id = conn.peer;
    app.trade[id] = null;

    _close = function(){
      conn.close();
    }

    _accept = function(){
        var obj = $("#"+id+" .peer").popover({
            title:"File Transfert",
            placement:"top",
            html:true,
            content:$('#acceptMessage').html()});
        obj.popover("show");
        console.log("ACCEPT CLICk")
        $("#"+id).on("click",".cancel",function(){
            console.log("CANCEL")
            obj.popover("destroy");
            console.log("SEND: no")
            conn.send({message:"no",action:"accept",type:"receiver"})
        });

        $("#"+id).on("click",".accept",function(){
            console.log("ACCEPT");
            obj.popover("destroy");
            console.log("SEND: yes")
            conn.send({message:"yes",action:"accept",type:"receiver"})
        });
    }

    _computeFile = function(){
        // Do all the stuff for the file
        console.log("SEND: file received")
        conn.send({message:"File received",action:"receivedFile",type:"receiver"})
    }

    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
            if(data.action == "init"){
                console.log("RECEIVED: init")
                _accept();
            }else if(data.action == "fileSending"){
                console.log("RECEIVED: fileSending")
                _computeFile();
            }else if(data.action == "close"){
                console.log("RECEIVED: close")
                _close();
            }
        });

    });
}

app.connection = function(){
    var peer = app.peer;
    peer.on('connection', function(conn) {
        console.log("CONNECTION: new")
        app.receiver(conn);

    });
}




// Execute //
jQuery(document).ready(function($)
{

    app.other.init(function(){
        app.connection();
    });



});