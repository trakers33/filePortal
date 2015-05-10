/**
 * Created by guillaumerebmann on 5/7/15.
 */

var app = {other:{},peer:null,trade:{}};

// OTHER
app.other.onClick = function(){
    $(".others .avatar img").on('click',function(){
        var object = $(this).closest(".others");
        var id = object.find(".user-info").data('id');
        if(!app.trade[id]){

            object.find("input").click();
        }else{
            console.log(app.trade[id]);
            console.log("Sorry we can't re-open a peer connection with %d because it's already in share mode",id);
        }

    })
}
// Event when a file is selected and ready to be share
app.initInput = function(){
    var eventFile = new Event('fileSelected');
    $('body').on('fileSelected','.fileSelector',function(e,data){
        console.log(e); // Event
        console.log(data); // EventData
        app.sender(data);
    });
}

app.other.init = function(callback){
    app.other.onClick();
    $('body').on("change",'.fileSelector',function(){
        var object = $(this).closest(".others");
        var id = object.find(".user-info").data('id');
        var file = $(this)[0].files[0];
        object.find('.fileSelector').trigger("fileSelected",{id:id,file:file});
        console.log("Id: %d fileName: %s fileSize %d",id,file.name,file.size);


    });

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

    app.initInput();
    app.peer = new Peer($('.you').find(".user-info").data("id"), {host: 'fileportal.herokuapp.com',debug:3});
    return callback();
}



// Sender
app.sender = function(data){
    var peer = app.peer;
    var id = data.id;
    var conn = peer.connect(id);
    var file = data.file; // File information
    app.trade[id] = true;

    _close = function(){
        delete app.trade[id];
        conn.send({action:"close",type:"sender"});
        conn.close();
    }
    _init = function(name,size){
        console.log("SEND: INIT");
        conn.send({action:"init",data:{name:name,size:size},type:"sender"});
    }
    _accept = function(e){
        if(e == "yes"){
            console.log("SEND: fileSending");
            conn.send({message:"sent the file",action:"fileSending",data:file,type:"sender"});
        }else{
            console.log("SEND: NOTHING because not accepted");
            _close();
        }


    }


    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
            if(data.action == "accept"){
                console.log("RECEIVED: accept");
                _accept(data.message);
            }else if(data.action == "receivedFile"){
                console.log("RECEIVED: receivedFile");
                _close();
            }else if(data.action == "close"){
                console.log("RECEIVED: close")
                _close();
            }
        });

        // Send message
        _init(file.name,file.size);

    });

}

app.receiver = function(conn){
    var peer = app.peer;
    var conn = conn;
    var id = conn.peer;
    var fileName = null;
    var fileSize = null;
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

    _computeFile = function(file){
        // Do all the stuff for the file
        console.log("SEND: file received")

        var dataView = new Uint8Array(file);
        var dataBlob = new Blob([dataView]);
        console.log(file.name);
        console.log(dataBlob);
        saveAs(dataBlob, fileName);
        conn.send({action:"receivedFile",type:"receiver"})
    }

    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
            if(data.action == "init"){
                console.log("RECEIVED: init")
                fileName = data.data.name;
                fileSize = data.data.size;
                    _accept();
            }else if(data.action == "fileSending"){
                console.log("RECEIVED: fileSending")
                _computeFile(data.data);
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