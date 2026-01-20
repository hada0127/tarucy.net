if (window.navigator.userAgent.match(/MSIE|Internet Explorer|Trident/i)) {
    // IE!!
	window.open("microsoft-edge:" + window.location.href);
    window.location = 'https://support.microsoft.com/ko-kr/office/%ec%97%b0%ea%b2%b0%ed%95%98%eb%a0%a4%eb%8a%94-%ec%9b%b9-%ec%82%ac%ec%9d%b4%ed%8a%b8%ea%b0%80-internet-explorer%ec%97%90%ec%84%9c-%ec%9e%91%eb%8f%99%ed%95%98%ec%a7%80-%ec%95%8a%ec%8a%b5%eb%8b%88%eb%8b%a4-8f5fc675-cd47-414c-9535-12821ddfc554?ui=ko-kr&rs=ko-kr&ad=kr';
}

document.addEventListener("DOMContentLoaded", function(){
/**
  background
*/
	const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let hue = 0;
  let angle = 0;

  function draw() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;


  // noise
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const value = Math.floor(Math.random() * 256); // 랜덤한 픽셀 값을 생성
      imageData.data[index] = value; // Red 채널
      imageData.data[index + 1] = value; // Green 채널
      imageData.data[index + 2] = value; // Blue 채널
      imageData.data[index + 3] = 100; // Alpha 채널 (불투명)
    }
  }

  ctx.putImageData(imageData, 0, 0);
  ctx.globalAlpha = 0.75;

  // gradient
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.save();
  const gra = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  gra.addColorStop(0, `hsl(${hue}, 40%, 40%)`);
  gra.addColorStop(1, '#ff095f');
  ctx.fillStyle = gra;
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.fillRect(canvas.width * -1.5, canvas.height * -1.5, canvas.width*3, canvas.height*3);
  hue += 0.5;
  angle += 0.005;

  requestAnimationFrame(draw);
}
  draw();
});
