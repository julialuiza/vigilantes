(function () {
  const FPS = 1;

  const focoState = {
    BURNING: 0,
    OK: 1,
    BURNT: 2,
  };

  const tipoFogo = {
    CAVEIRA: 0,
    FOCO: 1,
  };

  const gameDimensions = [1243, 960];
  const focoDimensions = [100, 130];
  const caveiraDimensions = [120, 136];
  const devatacaoDimensions = [250, 250];

  let reserva;
  let focos;
  let vidas;
  let pause;
  let gameover;
  let pontos;
  let skullTimer;
  let interval;
  let speedModifier;
  let generalTimer;
  let speed;
  let reset;

  function init() {
    document.body.innerHTML = '';
    focos = [];
    speed = 2500;
    speedModifier = 0.9;
    vidas = 5;
    pontos = 0;
    timer = 0;
    generalTimer;
    gameover = false;
    pause = true;
    reset = false;
    skullTimer = Math.floor(5 + Math.random() * 15);
    reserva = new Reserva();

    updateLives();
    interval = setInterval(update, speed);
  }

  class Reserva {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'reserva';
      this.element.style.width = `${gameDimensions[0]}px`;
      this.element.style.height = `${gameDimensions[1]}px`;
      document.body.appendChild(this.element);

      this.pontuacao = document.createElement('h2');
      let pontos_str = pontos.toString(10).padStart(5, 0);
      this.pontuacao.innerHTML = pontos_str;
      this.pontuacao.className = 'pontuacao';
      document.body.appendChild(this.pontuacao);
    }
  }

  class FocoIncendio {
    constructor(tipo) {
      this.timer = 0;
      this.tipo = tipo;
      this.visibleTimer = Math.floor(1 + Math.random() * 4);
      this.burntTimer = this.visibleTimer + 2;
    }

    startFire() {
      let left, top;
      this.state = focoState.BURNING;
      this.element = document.createElement('div');
      let dimensions;
      if (this.tipo === tipoFogo.FOCO) {
        this.element.className = 'foco-incendio';
        dimensions = focoDimensions;
      } else {
        this.element.className = 'caveira';
        dimensions = caveiraDimensions;
      }
      this.element.style.width = `${dimensions[0]}px`;
      this.element.style.height = `${dimensions[1]}px`;

      left = Math.floor(Math.random() * (gameDimensions[0] - dimensions[0]));
      // Verifica os locais com água no cenário
      if (left > 680) {
        top =
          210 +
          Math.floor(Math.random() * (gameDimensions[1] - dimensions[1] - 210));
      } else if (left < 260) {
        top = Math.floor(
          Math.random() * (gameDimensions[1] - dimensions[1] - 553),
        );
      } else {
        top = Math.floor(
          Math.floor(Math.random() * (gameDimensions[1] - dimensions[1])),
        );
      }
      this.element.style.left = `${left}px`;
      this.element.style.top = `${top}px`;
      this.element.addEventListener('click', this.saveTree.bind(this));
      reserva.element.appendChild(this.element);
    }

    stopFire() {
      if (this.state === focoState.BURNING) {
        this.state = focoState.BURNT;
        this.element.style.width = `${devatacaoDimensions[0]}px`;
        this.element.style.height = `${devatacaoDimensions[1]}px`;
        this.element.className = 'devastacao';
        if (this.tipo == tipoFogo.FOCO) vidas -= 1;
        else vidas -= 2;
        updateLives();
      }
    }
    updateTimer() {
      this.timer += 1;
    }

    checkVisibleTimer() {
      if (this.timer == this.visibleTimer) return true;
      else return false;
    }

    checkBurntTimer() {
      if (this.timer == this.burntTimer) return true;
      else return false;
    }

    saveTree() {
      if (this.state === focoState.BURNING) {
        this.state = focoState.OK;
        this.element.style.display = 'none';
        pontos += 10;
        let pontos_str = pontos.toString(10).padStart(5, 0);
        reserva.pontuacao.innerHTML = pontos_str;
      }
    }
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 's') {
      if (reset == true) init();
      gameover = false;
      pause = false;
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'p') pause = pause === false ? true : false;
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'r') {
      location.reload();
    }
  });

  function update() {
    if (!pause) {
      timer += 1;
      generalTimer += 1;

      // Modifica a velocidade do jogo depois de 60 ticks
      if (generalTimer % 60 === 0) {
        clearInterval(interval);
        speed = speed * speedModifier;
        setInterval(update, speed);
      }
      // Verifica se deve spawnar uma caveira ou um foco normal
      if (timer == skullTimer) {
        skullTimer = Math.floor(5 + Math.random() * 15);
        timer = 0;
        new_foco = new FocoIncendio(tipoFogo.CAVEIRA);
      } else new_foco = new FocoIncendio(tipoFogo.FOCO);

      // Adiciona o novo foco ao vetor de focos e realiza o tick
      // que verifica se devem pegar fogo ou apagar.
      focos.push(new_foco);
      for (idx = focos.length - 1; idx >= 0; idx--) {
        focos[idx].updateTimer();
        if (focos[idx].checkVisibleTimer()) focos[idx].startFire();
        else if (focos[idx].checkBurntTimer()) {
          focos[idx].stopFire();
          focos.splice(idx, 1);
        }
      }
    }
  }

  function updateLives() {
    let espaco = 0;
    prev = window.document.getElementsByClassName('vidas');
    for (i = prev.length - 1; i >= 0; i--) {
      prev[i].parentElement.removeChild(prev[i]);
    }
    for (var i = 0; i < vidas; i++) {
      vida = document.createElement('img');
      vida.className = 'vidas';
      vida.style.left = `${espaco}px`;
      document.body.appendChild(vida);
      espaco += 100;
    }
    if (vidas <= 0) {
      gameover = true;
      pause = true;
      reset = true;
      go = document.createElement('div');
      go.className = 'gameover';
      go.style.width = `${gameDimensions[0]}px`;
      go.style.height = `${gameDimensions[1]}px`;
      document.body.appendChild(go);
      clearInterval(interval);
    }
  }
  init();
})();
