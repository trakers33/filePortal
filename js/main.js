/**
 * Created by guillaumerebmann on 5/7/15.
 */

var app = {other:{},you:{},peer:{}};

// OTHER
app.other.onClick = function(){
    $(".others .avatar").on('click',function(){
      // $(this).closest(".others").find("input").click();
      var id = $(this).closest(".others").find(".user-info").data('id');
        console.log(id);
        app.peer.connect(id);
    })
}

app.other.init = function(){
    app.other.onClick();
}

// YOU

// PEER
app.peer.init = function(){
    app.peer.peer = new Peer($('.you').find(".user-info").data("id"), {key: 'f46nmd3bq5eo2yb9',debug:3});
    app.peer.connections = {};
}


app.peer.connect = function(id){
    console.log("Connection to "+id);
    var conn = app.peer.peer.connect(id);
    app.peer.connections[id] = conn;
    conn.on('open', function(){
        conn.send('hi!');
        alert("Hi sent to "+id);
    });
}

app.peer.receive = function(){
    console.log("Reception activated")
    app.peer.peer.on('connection', function(conn) {
        conn.on('data', function(data){
            // Will print 'hi!'
            console.log(data);
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