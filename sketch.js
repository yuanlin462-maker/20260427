let capture;
let handPose;
let hands = [];

function preload() {
  // 載入 handPose 模型
  handPose = ml5.handPose();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏預設的 HTML 影片元件，改在畫布上繪製
  capture.hide();

  // 開始偵測手部
  handPose.detectStart(capture, gotHands);
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  // 檢查攝影機影像是否已載入
  if (capture.width === 0) {
    return; 
  }
  
  // 計算顯示影像的寬高（視窗寬高的 50%）
  let videoW = windowWidth * 0.5;
  let videoH = windowHeight * 0.5;
  
  // 計算置中座標
  let x = (width - videoW) / 2;
  let y = (height - videoH) / 2;
  
  // 使用 push/pop 來進行鏡像翻轉，讓操作更直覺
  push();
  translate(width, 0);
  scale(-1, 1);

  // 在畫布上繪製影像
  image(capture, x, y, videoW, videoH);

  // 繪製手部連線
  if (hands.length > 0) {
    drawLines(hands, x, y, videoW, videoH);
  }
  pop();
}

function gotHands(results) {
  hands = results;
}

function drawLines(hands, offsetX, offsetY, vW, vH) {
  stroke(255, 0, 0); // 設定線條顏色為紅色
  strokeWeight(3);   // 設定線條粗細

  // 定義需要串連的點位編號
  const connections = [
    [0, 1, 2, 3, 4],    // 大拇指
    [5, 6, 7, 8],       // 食指
    [9, 10, 11, 12],    // 中指
    [13, 14, 15, 16],   // 無名指
    [17, 18, 19, 20]    // 小指
  ];

  for (let hand of hands) {
    for (let points of connections) {
      for (let i = 0; i < points.length - 1; i++) {
        let p1 = hand.keypoints[points[i]];
        let p2 = hand.keypoints[points[i + 1]];

        // 將偵測座標轉換為畫布上的置中座標
        let x1 = map(p1.x, 0, capture.width, offsetX, offsetX + vW);
        let y1 = map(p1.y, 0, capture.height, offsetY, offsetY + vH);
        let x2 = map(p2.x, 0, capture.width, offsetX, offsetX + vW);
        let y2 = map(p2.y, 0, capture.height, offsetY, offsetY + vH);

        line(x1, y1, x2, y2);
      }
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}