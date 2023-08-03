const video = document.querySelector("#videoElm");

// load models for face-api
const loadFaceAPI = async () => {
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");

  // thông tin dự đoán về biểu cảm khuôn mặt trên webcam
  await faceapi.nets.faceExpressionNet.loadFromUri("./models");
};

function getCameraStream() {
  // check media supported
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
      // add stream to video src
      video.srcObject = stream;
    });
  }
}

video.addEventListener("playing", () => {
  // get canvas image from video => create canvas element in html DOM
  const canvas = faceapi.createCanvasFromMedia(video);

  document.body.append(canvas);

  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight,
  };

  setInterval(async () => {
    // detect data return from face api
    const detects = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // resize result from faceapi match with displaySize
    const resizeDetects = faceapi.resizeResults(detects, displaySize);

    // clear canvas for redrawing
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    // sử dụng dữ liệu từ face api để truyển vào thẻ canvas
    faceapi.draw.drawDetections(canvas, resizeDetects);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetects);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetects);
  }, 300);
});

// after load model => call getCameraStream to get data from camera
loadFaceAPI().then(getCameraStream);
