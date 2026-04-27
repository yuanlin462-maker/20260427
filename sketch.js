let capture;
let handPose;
let hands = [];
let bubbles = []; // 儲存水泡的陣列

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
    
    // 在指尖產生水泡 (4, 8, 12, 16, 20 為指尖)
    for (let hand of hands) {
      let fingerTips = [4, 8, 12, 16, 20];
      for (let tipIndex of fingerTips) {
        let tip = hand.keypoints[tipIndex];
        let bx = map(tip.x, 0, capture.width, x, x + videoW);
        let by = map(tip.y, 0, capture.height, y, y + videoH);
        // 每一幀都有機率產生新水泡，形成成串效果
        if (frameCount % 2 === 0) {
          bubbles.push(new Bubble(bx, by));
        }
      }
    }
  }
  
  // 更新並繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1); // 水泡破掉（移除）
    }
  }

  // 檢查是否偵測到資料，若無則顯示提示（文字要處理鏡像問題）
  if (hands.length === 0) {
    drawStatus(x, y, videoW, videoH);
  }
  pop();

  // 在全螢幕中間顯示學號與姓名
  fill(0); 
  noStroke();
  textSize(40); 
  textAlign(CENTER, CENTER);
  text("414730XXX黃O瑄", width / 2, height / 2);
}

function gotHands(results) {
  hands = results;
}

function drawStatus(x, y, w, h) {
  push();
  scale(-1, 1); // 抵消整體的鏡像，讓文字正向顯示
  fill(255, 0, 0);
  noStroke();
  textAlign(CENTER);
  textSize(20);
  // 因為整體畫布被 translate(width, 0) 且 scale(-1, 1)，
  // 這裡的文字座標需要稍微計算以顯示在畫面中間
  text("等待攝影機或未偵測到手部...", -(width/2), height - 30);
  pop();
}

function drawLines(hands, offsetX, offsetY, vW, vH) {
  // 定義需要串連的點位編號
  const connections = [
    [0, 1, 2, 3, 4],    // 大拇指
    [5, 6, 7, 8],       // 食指
    [9, 10, 11, 12],    // 中指
    [13, 14, 15, 16],   // 無名指
    [17, 18, 19, 20]    // 小指
  ];

  for (let hand of hands) {
    // 1. 先畫出所有關鍵點 (點點)
    for (let keypoint of hand.keypoints) {
      let px = map(keypoint.x, 0, capture.width, offsetX, offsetX + vW);
      let py = map(keypoint.y, 0, capture.height, offsetY, offsetY + vH);
      fill(0, 255, 0); // 點位設定為綠色
      noStroke();
      circle(px, py, 10);
    }

    // 2. 再畫出連線 (線條)
    stroke(255, 0, 0); // 線條設定為紅色
    strokeWeight(3);
    noFill();
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

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(5, 12);     // 隨機大小
    this.speed = random(2, 5);  // 上升速度
    this.alpha = 255;           // 透明度
    this.vx = random(-1, 1);    // 左右微幅晃動
  }

  update() {
    this.y -= this.speed;       // 往上升
    this.x += this.vx;          // 左右飄動
    this.alpha -= 3;            // 逐漸變淡（模擬破掉的過程）
  }

  display() {
    stroke(255, this.alpha);
    strokeWeight(1);
    fill(255, this.alpha * 0.3); // 半透明填充
    circle(this.x, this.y, this.r * 2);
  }

  isFinished() {
    // 當透明度降為 0 或超出畫面頂端時判定為破掉
    return this.alpha <= 0 || this.y < 0;
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}