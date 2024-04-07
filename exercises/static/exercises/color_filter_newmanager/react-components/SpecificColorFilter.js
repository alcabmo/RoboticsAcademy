import * as React from "react";
import PropTypes from "prop-types";
import {drawImage, startStreaming} from "./helpers/showImagesColorFilter";
import {UseCamera} from "./pruebaCamera";
// The stream & capture
//var stream = document.getElementById('stream');


function SpecificColorFilter(props) {
  const [image, setImage] = React.useState(null)
  React.useEffect(() => {
    console.log("TestShowScreen subscribing to ['update'] events");
    // Start Streaming
    //startStreaming()
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

   /*return () => {
        
   // Start Streaming
    startStreaming()
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
    <video ref={ref} width="720" height="540" autoPlay></video>
    <canvas id="gui_canvas"></canvas>
    </div>
  );
}


SpecificColorFilter.propTypes = {
  circuit: PropTypes.string,
};

setTimeout(function(){
    console.log("START LAUNCHER");
    //startStreaming();
    UseCamera();
    //declare_webrtcframe();
}, 15000);

export default SpecificColorFilter
