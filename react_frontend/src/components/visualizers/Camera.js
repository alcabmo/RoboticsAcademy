import * as React from "react";
import PropTypes from "prop-types";
import { drawImage} from "./helpers/showImagesColorFilter";

// The stream & capture
var stream = document.getElementById('stream');
// The video stream
var cameraStream = null;


function Camera(props) {
  const [image, setImage] = React.useState(null)
  React.useEffect(() => {
      var mediaSupport = 'mediaDevices' in navigator;
	console.log("camera: ");
    if( mediaSupport && null == cameraStream ) {
	console.log("cameraStream ");
        navigator.mediaDevices.getUserMedia({video: true})
        .then(function(mediaStream) {

            cameraStream = mediaStream;
            stream.srcObject = mediaStream;
            stream.play();
            	console.log("camera playyyyyyyy");
        })
        .catch(function(err) {

            console.log("Unable to access camera: " + err);
        });
    }
    else {

        alert('Your browser does not support media devices.');

        return;
    }

  }, []);



  return (
    <div style={{display: "flex",   width: "100%",
    height: "100%"}}>
      <video id="stream"></video>
    </div>
  );
}


Camera.propTypes = {

};

export default Camera
