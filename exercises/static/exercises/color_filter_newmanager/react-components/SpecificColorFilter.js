import * as React from "react";
import PropTypes from "prop-types";
import { drawImage} from "./helpers/showImagesColorFilter";

// The stream & capture
var stream = document.getElementById('stream');
// The video stream
var cameraStream = null;


function SpecificColorFilter(props) {
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

    console.log("TestShowScreen subscribing to ['update'] events");
    const callback = (message) => {
      if(message.data.update.image_camera){
        const image = JSON.parse(message.data.update.image_camera)
        if(image.image_left){
          drawImageCamera(message.data.update)
        } 
      }   
      if(message.data.update.image){
        const image = JSON.parse(message.data.update.image)
        if(image.image){
          drawImage(message.data.update)
        } 
      }
 
    };

    window.RoboticsExerciseComponents.commsManager.subscribe(
      [window.RoboticsExerciseComponents.commsManager.events.UPDATE],
      callback
    );

    return () => {
      console.log("TestShowScreen unsubscribing from ['state-changed'] events");
      window.RoboticsExerciseComponents.commsManager.unsubscribe(
        [window.RoboticsExerciseComponents.commsManager.events.UPDATE],
        callback
      );
    };
  }, []);



  return (
    <div style={{display: "flex",   width: "100%",
    height: "100%"}}>
      <video id="stream"></video>
      <canvas id="gui_canvas"></canvas>
    </div>
  );
}


SpecificColorFilter.propTypes = {
  circuit: PropTypes.string,
};

export default SpecificColorFilter
