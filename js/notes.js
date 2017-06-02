$(function() {
  // Returns an random integer, positive or negative
  // between the given value
  function randInt(min, max, positive) {
    let num;
    if (positive === false) {
      num = Math.floor(Math.random() * max) - min;
      num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
    } else {
      num = Math.floor(Math.random() * max) + min;
    }

    return num;

  }

  var $score = $(".real-guitar-hero__score");
  var NOTES = ["Q", "W", "E", "R", "T", "Y"];
  var NOTE_CODES = {
    81: "Q",
    87: "W",
    69: "E",
    82: "R",
    84: "T",
    89: "Y"
  }

  //canvas variables
  var canvas = document.getElementById("game-canvas");
  var ctx = canvas.getContext("2d");

  // game variables
  var startingScore = 50;
  var continueAnimating = false;
  var score;

  // block variables
  var blockWidth = canvas.width;
  var blockHeight = 50;
  var block = {
      x: 0,
      y: canvas.height - blockHeight,
      width: blockWidth,
      height: blockHeight
  }

  // rock variables
  var rockWidth = 50;
  var rockHeight = 50;
  var totalRocks = 2;
  var rockDistance = canvas.height / totalRocks;
  var rocks = [];
  for (var i = 0; i < totalRocks; i++) {
    addRock(i);
  }

  // particles options
  const particlesPerExplosion = 25;
  const particlesMinSpeed     = 5;
  const particlesMaxSpeed     = 10;
  const particlesMinSize      = 2;
  const particlesMaxSize      = 4;
  const explosions            = [];

  // Draw explosion(s)
  // https://stackoverflow.com/questions/43498923/html5-canvas-particle-explosion
  function drawExplosion() {
    if (explosions.length === 0) {
      return;
    }

    for (let i = 0; i < explosions.length; i++) {

      const explosion = explosions[i];
      const particles = explosion.particles;

      if (particles.length === 0) {
        explosions.splice(i, 1);
        return;
      }

      const particlesAfterRemoval = particles.slice();
      for (let ii = 0; ii < particles.length; ii++) {

        const particle = particles[ii];

        // Check particle size
        // If 0, remove
        if (particle.size <= 0) {
          particlesAfterRemoval.splice(ii, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
        ctx.closePath();
        ctx.fillStyle = 'rgb(' + particle.r + ',' + particle.g + ',' + particle.b + ')';
        ctx.fill();

        // Update
        particle.x += particle.xv;
        particle.y += particle.yv;
        particle.size -= .1;
      }

      explosion.particles = particlesAfterRemoval;
    }
  }

  // Explosion
  function explosion(x, y, correctAnswer) {
    this.particles = [];

    for (let i = 0; i < particlesPerExplosion; i++) {
      this.particles.push(
        new particle(x, y, correctAnswer)
      );
    }
  }

  // Particle
  function particle(x, y, correctAnswer) {
    this.x    = x;
    this.y    = y;
    this.xv   = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.yv   = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.size = randInt(particlesMinSize, particlesMaxSize, true);

    if(correctAnswer) {
      this.r    = randInt(78, 98);
      this.g    = 221;
      this.b    = randInt(134, 154);
    } else {
      this.r    = 237;
      this.g    = randInt(27, 47);
      this.b    = randInt(68, 88);
    }
  }

  function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function addRock(rockIndex) {
    var note = pickRandom(NOTES);
    var rock = {
      width: rockWidth,
      height: rockHeight,
      note: note,
      speed: 3
    }
    resetRock(rock, rockIndex);
    rocks.push(rock);
  }

  function resetRock(rock, rockIndex) {
    rock.x = Math.random() * (canvas.width - rockWidth);
    rock.y = -rockIndex * rockDistance
    rock.note = pickRandom(NOTES);
  }

  document.onkeydown = function (event) {
    var rockIndex = rocks.findIndex(function(r) {
      return r.y >= canvas.height - blockHeight - rockHeight;
    });

    if(rockIndex === -1) {
      return;
    }

    var rock = rocks[rockIndex];

    if(!isColliding(block, rock)) {
      return;
    }

    var key = NOTE_CODES[event.keyCode];
    var correctAnswer = key === rock.note;

    if(correctAnswer) {
      score += 10;
    } else {
      score -= 10;
    }

    explosions.push(
      new explosion(rock.x, rock.y, correctAnswer)
    );

    var currentY = rock.y;
    resetRock(rock, 0);
    rock.y -= canvas.height - currentY - rockHeight;
  }

  function animate() {
    if (continueAnimating) {
      requestAnimationFrame(animate);
    }

    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];

      rock.y += rock.speed;

      if (rock.y > canvas.height) {
        score -= 10;

        explosions.push(
          new explosion(rock.x, canvas.height - 5, false)
        );

        resetRock(rock, 0);
        rock.y -= rockHeight;
      }
    }

    drawAll();
  }

  function isColliding(a, b) {
    return !(
      b.x > a.x + a.width ||
        b.x + b.width < a.x ||
        b.y > a.y + a.height ||
        b.y + b.height < a.y
    );
  }

  function drawAll() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background
    ctx.fillStyle = "ivory";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw the block
    ctx.fillStyle = "skyblue";
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.strokeStyle = "lightgray";
    ctx.strokeRect(block.x, block.y, block.width, block.height);

    // draw all rocks
    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];
      ctx.fillStyle = "#FFA100";
      ctx.fillRect(rock.x, rock.y, rock.width, rock.height);

      ctx.font = "18px Times New Roman";
      ctx.fillStyle = "#FFF";
      ctx.fillText(rock.note, rock.x + 25, rock.y + 25);
    }

    $score.text(score);

    drawExplosion();
  }

  $(".start-game").on("click", function () {
    score = startingScore
    block.x = 0;

    for (var i = 0; i < rocks.length; i++) {
      resetRock(rocks[i], i);
    }

    if(!continueAnimating) {
      continueAnimating = true;
      animate();
    };
  });
});
