import * as React from "react";
import PropTypes from "prop-types";
import { drawImage} from "./helpers/showImagesColorFilter";


function SpecificColorFilter(props) {
  const [image, setImage] = React.useState(null)
  React.useEffect(() => {
    console.log("TestShowScreen subscribing to ['update'] events");
    const callback = (message) => {
      if(message.data.update.image){
        console.log('image')
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
      <canvas id="gui_canvas"></canvas>
    </div>
  );
}

SpecificRescuePeople.propTypes = {
  circuit: PropTypes.string,
};

export default SpecificColorFilter
