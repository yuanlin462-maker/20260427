let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設的 HTML 影片元件，改在畫布上繪製
  capture.hide();
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');
  
  // 計算顯示影像的寬高（視窗寬高的 50%）
  let videoW = windowWidth * 0.5;
  let videoH = windowHeight * 0.5;
  
  // 計算置中座標
  let x = (width - videoW) / 2;
  let y = (height - videoH) / 2;
  
  // 在畫布上繪製影像
  image(capture, x, y, videoW, videoH);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}