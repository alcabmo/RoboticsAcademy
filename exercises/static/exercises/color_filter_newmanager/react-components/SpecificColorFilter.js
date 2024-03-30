import * as React from "react";
import PropTypes from "prop-types";
import { drawImage} from "./helpers/showImagesColorFilter";

// The stream & capture
var stream = document.getElementById('stream');


function SpecificColorFilter(props) {
  const [image, setImage] = React.useState(null)
  React.useEffect(() => {
    console.log("TestShowScreen subscribing to ['update'] events");
    const callback = (message) => { 
      if(message.data.update.image)
      {
        const image = JSON.parse(message.data.update.image)
        if(image.image)
        {
          drawImage(message.data.update)
        } 
      }
 
    };

/*   return () => {
	   // Start Streaming

	    var mediaSupport = 'mediaDevices' in navigator;

	    if( mediaSupport && null == cameraStream ) {

		navigator.mediaDevices.getUserMedia({video: true})
		.then(function(mediaStream) {

		    cameraStream = mediaStream;
		    stream.srcObject = mediaStream;
		    stream.play();
		})
		.catch(function(err) {

		    console.log("Unable to access camera: " + err);
		});
	    }
	    else {

		alert('Your browser does not support media devices.');

		return;
	    }

    };*/
   
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
      <canvas id="stream"></canvas>
      <canvas id="gui_canvas"></canvas>
    </div>
  );
}


SpecificColorFilter.propTypes = {
  circuit: PropTypes.string,
};

export default SpecificColorFilter
