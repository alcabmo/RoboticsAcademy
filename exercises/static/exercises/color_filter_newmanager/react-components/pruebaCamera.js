import React, { useEffect, useRef } from 'react';
import SpecificColorFilter from './SpecificColorFilter';

const UseCamera = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.log(err));
        }
    }, []);

    return <VideoComponent ref={videoRef} />;
};

export default UseCamera;
