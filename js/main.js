/**
 * Created by guillaumerebmann on 5/7/15.
 */

var app = {other:{},you:{},peer:{},sender:{},receiver:{}};

// OTHER
app.other.onClick = function(){
    $(".others .avatar img").on('click',function(){
      // $(this).closest(".others").find("input").click();
      var object = $(this).closest(".others");
        //console.log(id);
        app.peer.connect(object);
    })
}

app.other.init = function(){
    app.other.onClick();
}

// YOU

// PEER
app.peer.init = function(){
    app.peer.peer = new Peer($('.you').find(".user-info").data("id"), {key: '4hao8pkyrsve7b9',debug:3});
    app.peer.connections = {};

    app.peer.peer.on('close', function() {
        console.log("Peer connection closed");
    });
    app.peer.peer.on('error', function(err) {
        alert("ERROR WITH THE PEER");

        app.peer.peer.disconnect();
        app.peer.peer.destroy();

        return false;
    });
}


app.peer.connect = function(object){
    var id = object.find(".user-info").data('id');
    //var file = object.find("input").files[0];
    app.sender("init",id);
}

app.sender = function(action,id){
    if(action == "init"){
        var conn = app.peer.peer.connect(id);
        app.peer.connections[id] = conn;

        conn.on('open', function(){
            conn.send({message:"init",data:{},type:"sender"});
        });
    }else if(action == "sendFile"){
        var conn = app.peer.connections[id];
        conn.on('open', function(){
            conn.send({message:"sendFile",data:{},type:"sender"});
        });
    }else if(action == "close"){
        var conn = app.peer.connections[id];
    }

}

app.receiver = function(action,id){
    if(action == "accept"){
        var conn = app.peer.peer.connect(id);
        app.peer.connections[id] = conn;

        conn.on('open', function(){
            conn.send({message:"accept",data:{},type:"receiver"});
        });
    }else if(action == "receivedFile"){
        var conn = app.peer.connections[id];
        conn.on('open', function(){
            conn.send({message:"receivedFile",data:{},type:"receiver"});
        });
    }else if(action == "close"){
        var conn = app.peer.connections[id];
    }

}


app.peer.acceptFile = function(conn,data){
   // console.log(conn);
    app.current[conn.peer] = "init";
    var obj = $("#"+conn.peer+" .peer").popover({
        title:"File Transfert",
        placement:"top",
        html:true,
        content:$('#acceptMessage').html()});
    obj.popover("show");

    $("#"+conn.peer).on("click",".cancel",function(){
        console.log("CANCEL")
        obj.popover("hide");
        app.peer.peer.disconnect();
    });

    $("#"+conn.peer).on("click",".accept",function(){
        console.log("ACCEPT");
        obj.popover("hide");
    });

}

app.peer.receive = function(){
    console.log("Reception activated");

    app.peer.peer.on('connection', function(conn) {
        conn.on('data', function(data){
            // Will print 'hi!'
           // alert("Hi received");

            if(typeof data == "object"){

                if(data.type == "sender"){
                    if(data.message == "init"){
                        // Open the dialog to accept
                        console.log("Receiver : init");
                        if(app.current[conn.peer] == null || app.current[conn.peer] == undefined)
                            app.peer.acceptFile(conn,data);
                        else
                            console.log("Multiple time the same request")
                    }else if(data.message == "send"){

                    }
                }else{
                    if(data.message == "accept"){
                       // Send the file
                    }else if(data.message == "received"){
                        // Close the connection
                    }
                }

            }else{
                console.log("No Data");
            }

            //app.peer.peer.disconnect();
        });
    });
}


// Execute //
jQuery(document).ready(function($)
{

    app.other.init();
    app.peer.init();
    app.peer.receive();



});