const human = document.querySelector(".human");
const robot = document.querySelector(".robot");
const humanTitle = document.querySelector(".human-title");
const robotTitle = document.querySelector(".robot-title");

function clearHoverState() {
  human.classList.remove("is-hovered");
  robot.classList.remove("is-hovered");
  humanTitle.classList.remove("is-visible");
  robotTitle.classList.remove("is-visible");
}

document.addEventListener("pointermove", (event) => {
  const humanBounds = human.getBoundingClientRect();
  const robotBounds = robot.getBoundingClientRect();
  const overHuman = event.clientX >= humanBounds.left && event.clientX <= humanBounds.left + humanBounds.width / 2 && event.clientY >= humanBounds.top && event.clientY <= humanBounds.bottom;
  const overRobot = event.clientX >= robotBounds.left + robotBounds.width / 2 && event.clientX <= robotBounds.right && event.clientY >= robotBounds.top && event.clientY <= robotBounds.bottom;

  clearHoverState();

  if (overHuman) {
    human.classList.add("is-hovered");
    humanTitle.classList.add("is-visible");
  } else if (overRobot) {
    robot.classList.add("is-hovered");
    robotTitle.classList.add("is-visible");
  }
});

document.addEventListener("pointerleave", clearHoverState);

const neuralCanvas = document.querySelector(".neural-canvas");
const neuralContext = neuralCanvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const neuralNodes = [];
let neuralWidth = 0;
let neuralHeight = 0;

function resizeNeuralCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  neuralWidth = neuralCanvas.clientWidth;
  neuralHeight = neuralCanvas.clientHeight;
  neuralCanvas.width = neuralWidth * pixelRatio;
  neuralCanvas.height = neuralHeight * pixelRatio;
  neuralContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createNeuralNodes() {
  neuralNodes.length = 0;
  const nodeCount = Math.max(18, Math.round((neuralWidth * neuralHeight) / 42000));

  for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
    neuralNodes.push({
      x: Math.random() * neuralWidth,
      y: Math.random() * neuralHeight,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.08,
      pulse: Math.random() * Math.PI * 2,
    });
  }
}

function drawNeuralNetwork(time) {
  neuralContext.clearRect(0, 0, neuralWidth, neuralHeight);

  neuralNodes.forEach((node) => {
    if (!reducedMotion) {
      node.x += node.driftX;
      node.y += node.driftY;
      node.pulse += 0.008;

      if (node.x < -20 || node.x > neuralWidth + 20) node.driftX *= -1;
      if (node.y < -20 || node.y > neuralHeight + 20) node.driftY *= -1;
    }
  });

  neuralNodes.forEach((node, nodeIndex) => {
    neuralNodes.slice(nodeIndex + 1).forEach((otherNode) => {
      const distanceX = node.x - otherNode.x;
      const distanceY = node.y - otherNode.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const connectionRange = 170;

      if (distance < connectionRange) {
        const opacity = (1 - distance / connectionRange) * 0.72;
        neuralContext.strokeStyle = `rgba(151, 190, 246, ${opacity})`;
        neuralContext.lineWidth = 0.8;
        neuralContext.beginPath();
        neuralContext.moveTo(node.x, node.y);
        neuralContext.lineTo(otherNode.x, otherNode.y);
        neuralContext.stroke();
      }
    });

    const pulse = 1.5 + Math.sin(node.pulse + time * 0.0002) * 0.45;
    neuralContext.fillStyle = "rgba(210, 230, 255, 0.85)";
    neuralContext.beginPath();
    neuralContext.arc(node.x, node.y, pulse, 0, Math.PI * 2);
    neuralContext.fill();
  });

  if (!reducedMotion) requestAnimationFrame(drawNeuralNetwork);
}

resizeNeuralCanvas();
createNeuralNodes();
drawNeuralNetwork(0);
window.addEventListener("resize", () => {
  resizeNeuralCanvas();
  createNeuralNodes();
});
