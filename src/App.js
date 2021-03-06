import React, { useRef, useState, useEffect } from "react";

import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";

import { hiGesture } from "./Hi";

import * as tf from "@tensorflow/tfjs"
import * as fp from "fingerpose";
import thumbs_up from "./imgs/thumbs_up.png";



function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up};


  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          hiGesture
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );

          const maxConfidenceValue = Math.max.apply(null, confidence);
          const maxConfidence = confidence.indexOf(
            maxConfidenceValue
          );
        
          setEmoji(gesture.gestures[maxConfidence].name);
          
          
          if(gesture.gestures[maxConfidence].name === "hi" && maxConfidenceValue > 9){
              const feed = document.getElementById("webcam");
              feed.style.filter="grayscale(1)";
          }
          
        }
      }
    }
  };

  useEffect(()=>{runHandpose()},[]);

  return (
    <div className="App">
      
      <header className="App-header">
        <Webcam id="webcam"
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
         
        
        
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )} 
      </header> 
      
    </div>
    
  );
}

export default App;