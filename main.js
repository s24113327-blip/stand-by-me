const GAME_WIDTH = 800, GAME_HEIGHT = 600;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: 0x1b1b2f,
  scene: { preload, create, update }
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image('bottle', 'https://i.imgur.com/8fKQy3t.png'); // You can replace later
  this.load.image('ring', 'https://i.imgur.com/jIn5KaU.png');   // You can replace later
}

function create() {
  const scene = this;
  scene.score = 0;

  const bottle = scene.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2 + 80, 'bottle');
  bottle.setScale(1.7);
  bottle.neck = { x: bottle.x, y: bottle.y - 40 };

  const ring = scene.add.sprite(150, 150, 'ring').setInteractive({ draggable: true });
  ring.setScale(1.3);

  const ropeLine = scene.add.graphics();
  ropeLine.lineStyle(4, 0xcccccc, 1);

  ring.isGrabbed = false;
  ring.startY = ring.y;
  ring.prevY = ring.y;
  ring.liftedSinceOverlap = 0;

  scene.input.setDraggable(ring);

  scene.input.on('dragstart', function(pointer, gameObject) {
    gameObject.isGrabbed = true;
    gameObject.startY = gameObject.y;
  });

  scene.input.on('drag', function(pointer, gameObject, dragX, dragY) {
    gameObject.x = Phaser.Math.Clamp(dragX, 40, GAME_WIDTH - 40);
    gameObject.y = Phaser.Math.Clamp(dragY, 40, GAME_HEIGHT - 40);
  });

  scene.input.on('dragend', function(pointer, gameObject) {
    gameObject.isGrabbed = false;
    gameObject.liftedSinceOverlap = 0;
  });

  scene.msg = scene.add.text(10, 10, '', { font: '18px Arial', fill: '#fff' });

  function success() {
    scene.score += 1;
    document.getElementById('score').innerText = scene.score;

    scene.tweens.add({
      targets: bottle,
      y: bottle.y - 40,
      duration: 220,
      yoyo: true,
      ease: 'Power2'
    });

    scene.msg.setText('Success! 🎉');
    scene.time.delayedCall(1000, () => scene.msg.setText(''));

    scene.tweens.add({ targets: ring, x: 150, y: 150, duration: 400 });
  }

  scene.bottle = bottle;
  scene.ring = ring;
  scene.ropeLine = ropeLine;
  scene.success = success;

  document.getElementById('restartBtn').addEventListener('click', () => {
    scene.score = 0;
    document.getElementById('score').innerText = 0;
    scene.tweens.add({ targets: ring, x: 150, y: 150, duration: 300 });
    scene.msg.setText('');
  });
}

function update(time, delta) {
  const scene = this;
  const ring = scene.ring;
  const bottle = scene.bottle;
  const rope = scene.ropeLine;

  rope.clear();
  rope.lineStyle(4, 0xdddddd, 1);
  const anchorX = 150, anchorY = 20;
  rope.beginPath();
  rope.moveTo(anchorX, anchorY);
  rope.quadraticCurveTo((anchorX + ring.x)/2, (anchorY + ring.y)/2 - 40, ring.x, ring.y);
  rope.strokePath();

  const dx = ring.x - bottle.neck.x;
  const dy = ring.y - bottle.neck.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  const overlapping = dist < 50;

  if (overlapping) {
    const deltaY = ring.prevY - ring.y;
    if (deltaY > 0) ring.liftedSinceOverlap += deltaY;

    scene.msg.setText('Lift up…');

    if (ring.liftedSinceOverlap > 60) {
      scene.success();
      ring.liftedSinceOverlap = 0;
    }
  } else {
    scene.msg.setText('');
    ring.liftedSinceOverlap = 0;
  }

  ring.prevY = ring.y;
}
