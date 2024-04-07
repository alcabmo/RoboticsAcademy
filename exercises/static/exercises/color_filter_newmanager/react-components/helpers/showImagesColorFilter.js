// To decode the image string we will receive from server
function decode_utf8(s){
    return decodeURIComponent(escape(s))
}

let image = new Image();
let image_camera = new Image();
// The stream & capture
var stream = document.getElementById('stream');
// The video stream
var cameraStream = null;

export function drawImage (data){
    var canvas = document.getElementById("gui_canvas"),
    context = canvas.getContext('2d')

    // For image object
    image.onload = function(){
        update_image();
    }

    // Request Animation Frame to remove the flickers
    function update_image(){
        window.requestAnimationFrame(update_image);
        context.drawImage(image, 0, 0);
    }
            
    // Parse the Image Data
    var image_data = JSON.parse(data.image),
        source = decode_utf8(image_data.image),
        shape = image_data.shape;
    
    if(source != ""){
        image.src = "data:image/jpeg;base64," + source;
        canvas.width = shape[1];
        canvas.height = shape[0];
    }   
}

export function drawImageCamera (data){
    var canvas_camera = document.getElementById("gui_canvas_camera"),
    context_camera = canvas_camera.getContext('2d')

    // For image object
    image_camera.onload = function(){
        update_camera_image();
    }

    // Request Animation Frame to remove the flickers
    function update_camera_image(){
        window.requestAnimationFrame(update_camera_image);
        context_camera.drawImage(image_camera, 0, 0);
    }
            
    // Parse the Image Data
    var image_data = JSON.parse(data.image_camera),
        source = decode_utf8(image_data.image_camera),
        shape = image_data.shape;
    
    if(source != ""){
        image_camera.src = "data:image/jpeg;base64," + source;
        canvas_camera.width = shape[1];
        canvas_camera.height = shape[0];
    }   
}

// Start Streaming
export function startStreaming() {

console.log("startStreaming");
    var mediaSupport = 'mediaDevices' in navigator;

    if( mediaSupport && null == cameraStream ) {

        navigator.mediaDevices.getUserMedia({video: true})
        .then(function(mediaStream) {

            cameraStream = mediaStream;
            stream.srcObject = mediaStream;
            stream.play();
            console.log("stream play");
        })
        .catch(function(err) {

            console.log("Unable to access camera: " + err);
            console.log("Unable to access camera: " + err.name + ":" + err.message);
        });
    }
    else {

        alert('Your browser does not support media devices.');

        return;
    }
    //requestAnimationFrame(showImageOutput);
}
