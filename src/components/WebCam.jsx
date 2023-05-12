/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Webcam from "react-webcam";
import { /*CameraOptions,*/ useFaceDetection } from "react-use-face-detection";
import FaceDetection from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
// @ts-ignore
import React, { useRef, useState, useCallback } from "react";

// const width = 500;
const height = 500;

const WebcamMode = ({ setselfie, setPage }) => {
  // const webcamRef = useRef(null);

  // @ts-ignore
  const { boundingBox, isLoading, detected, facesDetected, webcamRef } = useFaceDetection({
    faceDetectionOptions: {
      model: "short",
    },
    faceDetection: new FaceDetection.FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    }),
    camera: ({ mediaSrc, onFrame }) =>
      new Camera(mediaSrc, {
        onFrame,
        // width,
        height,
      }),
  });

  // console.log(imgRef)
  const [imageSrc, setImageSrc] = useState(null);

  const capturePhoto = useCallback(() => {
    // const webcamRef = useRef<Webcam>(null);
    // if (webcamRef.current) {

    // @ts-ignore
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setselfie(imageSrc);
    // console.log(imageSrc);
    // }
  }, [webcamRef]);

  if (imageSrc)
    return (
      <>
        <img src={imageSrc} />
        <button
          // @ts-ignore
          onClick={() => setImageSrc('')}
          className="mt-4 w-full rounded-lg bg-getly py-2 disabled:opacity-40"
        >
          Retake
        </button>
        <button
          onClick={() => setPage(2)}
          className="mt-4 w-full rounded-lg bg-getly py-2 disabled:opacity-40"
        >
          Proceed
        </button>
      </>
    );

  return (
    <div>
      {/* <p>{`Loading: ${isLoading}`}</p> */}
      {isLoading && (
        <p>Ensure Your Environment is well lit and your face clearly visible</p>
      )}
      {/* <p>{`Face Detected: ${detected}`}</p> */}
      {/* <p>{`Number of faces detected: ${facesDetected}`}</p> */}
      <div
        // className="relative h-full w-full md:h-[360px]"
        style={{ width: "full", height, position: "relative" }}
      >
        {boundingBox.map((box, index) => (
          <div
            key={`${index + 1}`}
            style={{
              border: "2px solid skyblue",
              // borderRadius: "50%",
              position: "absolute",
              top: `${box.yCenter * 100}%`,
              left: `${box.xCenter * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 65}%`,
              zIndex: 1,
            }}
          />
        ))}
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          forceScreenshotSourceSize
          style={{
            height,
            // width,
            position: "absolute",
          }}
        />
      </div>
      <>
        <button
          onClick={capturePhoto}
          // disabled={isLoading || !detected || facesDetected > 1}
          className="mt-4 w-full rounded-lg bg-getly py-2 disabled:opacity-40"
        >
          Capture
        </button>
        {imageSrc && <img src={imageSrc} />}
      </>
    </div>
  );
};

export default WebcamMode;
