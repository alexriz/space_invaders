window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame		|| 
			window.webkitRequestAnimationFrame	|| 
			window.mozRequestAnimationFrame		|| 
			window.oRequestAnimationFrame		|| 
			window.msRequestAnimationFrame		|| 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();

onReady(function(){
	var keydown = {
		left : false,
		right : false,
		space : false,
		esc : false
	}

	/* Bind keyboard event */
	document.addEventListener('keydown', function(e){
		e = e || event;
		switch (e.keyCode) {
			case 37:
				keydown.left = true;
				break;
			case 39:
				keydown.right = true;
				break;
			case 32:
				keydown.space = true;
				break;
			case 27:
				keydown.esc = true;
				break;
			default: break;
		}
		// e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	});
	document.addEventListener('keyup', function(e){
		e = e || event;
		switch (e.keyCode) {
			case 37:
				keydown.left = false;
				break;
			case 39:
				keydown.right = false;
				break;
			case 32:
				keydown.space = false;
				break;
			case 27:
				keydown.esc = false;
				break;
			default: break;
		}
		// e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	});

	window.addEventListener('blur', function() {
		if (game.started) {
			game.pause();
		};
	}, false);

	/* Game Config */
	var game = {
		level : 0,
		score : 0,
		lives : 0,
		inited : false,
		started : false,
		paused : false,
		escItr : true,
		init : function(){
			$thisGame = this;
			this.menu = document.createElement('div');
			this.menu.classList.add('gameMenu');

			this.menu.resumegame = document.createElement('button');
			this.menu.resumegame.id = 'resumegame';
			this.menu.resumegame.classList.add('game-btn');
			this.menu.resumegame.classList.add('hide');
			this.menu.resumegame.innerHTML = "Resume"
			this.menu.appendChild(this.menu.resumegame);

			this.menu.newgame = document.createElement('button');
			this.menu.newgame.id = 'newgame';
			this.menu.newgame.classList.add('game-btn');
			this.menu.newgame.innerHTML = "New Game"
			this.menu.appendChild(this.menu.newgame);
			
			this.menu.newgame.addEventListener('click', function(){
				$thisGame.newgame();
				this.blur();
			}, false);
			this.menu.resumegame.addEventListener('click', function(){
				$thisGame.resume();
				this.blur();
			}, false);


			document.querySelector('.cont').appendChild(this.menu);
			ctx.canvas.classList.add('cnvs_pause');

			this.inited = true;
		},
		newgame : function(){
			this.level = 0;
			this.score = 0;
			this.lives = 3;

			/* Reset RocketStack */
			Rocket.rocketStack = [];

			/* Create is new Ship */
			this.ship = new Ship({
				color : '#f80',
				width : 32,
				height : 28,
				x : (ctx.canvas.width - 32) / 2,
				y : ctx.canvas.height - 28,
				step : ctx.canvas.width * .2
			});

			/* Create MobsGroup */
			this.mobsGroup = new MobsGroup();

			/* Create UFO */
			this.ufo = new Mob({
				color : '#d50',
				width : 48,
				height : 24,
				x : -48,
				y : 10,
				type : 10
			});
			this.ufo.vx = 0;
			this.ufo.chance = 0.05;
			this.ufo.explode = function(ctx) {
				game.score += 500;
				if (this.vx > 0) {
					this.x = ctx.canvas.width;
				}
				else {
					this.x = -this.width;
				};
			};
			this.ufo.update = function(ctx){
				if (!this.vx && Math.random() < (this.chance / ctx.FPS)) {
					if (this.x < 0) {
						this.vx = 100;
					}
					else {
						this.vx = -100;
					};
				}
				else if(this.vx > 0 && this.x > ctx.canvas.width){
					this.vx = 0;
					this.x = ctx.canvas.width;
				}
				else if(this.vx < 0 && this.x < -this.width){
					this.vx = 0;
					this.x = -this.width;
				}
				this.x += (ctx.diffFrameTick / 1000) * this.vx;
			};


			this.start();
			this.menu.classList.add('hide');
			ctx.canvas.classList.remove('cnvs_pause');
		},
		start : function(){
			this.level++;

			/* Write out info */
			document.querySelector('.level').innerHTML = this.level;

			/* Reset RocketStack */
			Rocket.rocketStack = [];

			this.mobsGroup.create(this.level);

			this.started = true;
			this.paused = false;
		},
		pause : function(){
			this.paused = true;
			this.menu.classList.remove('hide');
			this.menu.resumegame.classList.remove('hide');
			ctx.canvas.classList.add('cnvs_pause');
		},
		resume : function(){
			this.paused = false;
			this.menu.classList.add('hide');
			ctx.canvas.classList.remove('cnvs_pause');
		},
		finish : function(){
			this.menu.classList.remove('hide');
			this.menu.resumegame.classList.add('hide');
			this.started = false;
			ctx.canvas.classList.add('cnvs_pause');
		},
		update : function(){
			/* Write out Score */
			document.querySelector('.score').innerHTML = this.score;

			this.ship.update(ctx);
			this.mobsGroup.update(ctx);
			this.ufo.update(ctx);
			Rocket.update(ctx);

			if (!this.mobsGroup.mobsStack.length) {
				this.start();
			};
		},
		collides : function(a, b) {
			return a.x < b.x + b.width &&
				a.x + a.width > b.x &&
				a.y < b.y + b.height &&
				a.y + a.height > b.y;
		}
	};
	
	/* Canvas */
	var ctx = document.createElement('canvas').getContext('2d');
	ctx.canvas.width = 800;
	ctx.canvas.height = 600;
	ctx.canvas.classList.add('cnvs');
	document.querySelector('.cont').appendChild(ctx.canvas);
	
	ctx.clearScene = function(){
		this.fillStyle = "#000";
		this.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	ctx.render = function () {
		this.clearScene();

		Rocket.draw(this);
		game.ship.draw(this);
		game.mobsGroup.draw(this);
		game.ufo.draw(this);
	};

	/* cxt FPS */
	ctx.frames = 10;
	ctx.prevFrameTick = +(new Date);
	ctx.diffStack = 0;
	ctx.diffFrameTick = 0;
	ctx.FPS = 0;
	ctx.getFPS = function(){
		this.frames--;
		var currFrameTick = +(new Date);
		this.diffFrameTick = currFrameTick - this.prevFrameTick;
		if (!this.frames) {
			this.diffStack += (this.diffFrameTick);
			this.FPS = Math.round(1000 / (this.diffStack / 10));
			this.frames = 10;
			this.diffStack = 0;
		}
		else {
			this.diffStack += this.diffFrameTick;
		}
		this.prevFrameTick = currFrameTick;
		return this.FPS;
	}

	/* Ship */
	var Ship = function (settings) {
		var settings = settings || {};
		this.color = settings.color || '#080';
		this.x = settings.x || 0;
		this.y = settings.y || 0;
		this.width = settings.width || 28;
		this.height = settings.height || 28;
		this.step = settings.step || 20;
		this.lives = settings.lives || 3;
		this.maxRocketStack = settings.maxRocketStack || 1;
		this.rocketCount = 0;
		this.shoot = function(ctx) {
			var $this = this;
			if (this.rocketCount < this.maxRocketStack) {
				Rocket.rocketStack.push(new Rocket({
					x : this.width / 2 + this.x - 2.5,
					y : this.y,
					width : 5,
					height : 16,
					vy : -(ctx.canvas.height * 1),
					aims : ['mob', 'ufo'],
					complete : function(){
						$this.rocketCount--;
					}
				}));
				this.rocketCount++;
			};
		};
		this.explode = function(ctx){
			console.log('Ship Explode');
			this.lives--;
		};
		this.draw = function(ctx) {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};
		this.update = function(ctx) {
			/* Motion of the ship  */
			if (keydown.left) {
				this.x -= (ctx.diffFrameTick / 1000) * this.step;
			}
			if (keydown.right) {
				this.x += (ctx.diffFrameTick / 1000) * this.step;
			}
			this.x = (Math.min(Math.max(this.x, 0), (ctx.canvas.width - this.width))).toFixed(4)*1;
			
			/* Ship shooting */
			if (keydown.space) {
				this.shoot(ctx);
			}

			document.querySelector('.lives').innerHTML = this.lives;
			if (!this.lives) {
				game.finish();
			};
		};
	};
	
	/* Rocket */
	var Rocket = function (settings) {
		this.active = true;
		this.color = settings.color || '#f00';
		this.width = settings.width || 4;
		this.height = settings.height || 8;
		this.x = settings.x || 0;
		this.y = settings.y || 0,
		this.vx = settings.vx || 0;
		this.vy = settings.vy || 0;
		this.aims = settings.aims || [];
		this.complete = settings.complete || function(){};
		this.inScene = function(ctx) {
			return this.x >= 0 && (this.x + this.width) <= ctx.canvas.width &&
					this.y >= 0 && (this.y + this.height) <= ctx.canvas.height;
		};
		this.draw = function(ctx){
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};
		this.update = function(ctx){
			this.x += (ctx.diffFrameTick / 1000) * this.vx;
			this.y += (ctx.diffFrameTick / 1000) * this.vy;

			var $this = this;
			if (this.aims.indexOf('mob') != -1) {
				game.mobsGroup.mobsStack.forEach(function(row) {
					row.forEach(function(mob){
						if (game.collides($this, mob)) {
							mob.explode();
							$this.active = false;
						}
					});
				});
			};
			if (this.aims.indexOf('ufo') != -1) {
				if (game.collides($this, game.ufo)) {
					game.ufo.explode(ctx);
					$this.active = false;
				}
			};
			if (this.aims.indexOf('ship') != -1) {
				if (game.collides($this, game.ship)) {
					game.ship.explode(ctx);
					$this.active = false;
				}
			}
			this.active = this.active && this.inScene(ctx);
			if (!this.active) {
				this.complete();
			};
		};
	};
	Rocket.rocketStack = [];
	Rocket.update = function(ctx) {
		this.rocketStack = this.rocketStack.filter(function(rocket){
			rocket.update(ctx);
			return rocket.active;
		});
	};
	Rocket.draw = function(ctx) {
		this.rocketStack.forEach(function(rocket){
			rocket.draw(ctx);
		});
	};

	/* Mob */
	var Mob = function(settings){
		this.active = true;
		this.color = settings.color || '#0f0';
		this.width = settings.width || 32;
		this.height = settings.height || 32;
		this.x = settings.x || 0;
		this.y = settings.y || 0;
		
		this.type = settings.type || 1;
		this.maxRocketStack = settings.maxRocketStack || 1;
		this.rocketCount = 0;
		this.shoot = function(ctx) {
			var $this = this;
			if (this.rocketCount < this.maxRocketStack) {
				Rocket.rocketStack.push(new Rocket({
					x : this.width / 2 + this.x - 2.5,
					y : this.y + this.height,
					width : 5,
					height : 16,
					vy : ctx.canvas.height * 1,
					aims : ['ship'],
					complete : function(){
						$this.rocketCount--;
					}
				}));
				this.rocketCount++;
			};
		};
		this.inScene = function(ctx) {
			return this.x >= 0 && (this.x + this.width) <= ctx.canvas.width &&
					this.y >= 0 && (this.y + this.height) <= ctx.canvas.height;
		};
		this.explode = function(ctx) {
			if (this.active) {
				game.score += 10 * this.type;
			};
			this.active = false;
		};
		this.draw = function(ctx){
			/*this.rocketStack.forEach(function(rocket){
				rocket.draw(ctx);
			});*/
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};
		this.update = function(ctx){
			this.active = this.active;
			/*this.rocketStack.forEach(function(rocket){
				rocket.update(ctx);
			});
			this.rocketStack = this.rocketStack.filter(function(rocket){
				return rocket.active;
			});*/
		};
	};

	/* Mobs Group */
	var MobsGroup = function(settings) {
		var settings = settings || {};
		this.mobWidth = settings.mobWidth || 24;
		this.mobHeight = settings.mobHeight || 24;
		this.margin = settings.margin || 5;
		this.mobsMap = settings.mobsMap || [[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
											[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
											[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
											[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
											[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
		this.mobsStack = [];
		this.width = 0;
		this.height = 0;
		this.shootChance = settings.shootChance || 0.25;
		this.create = function(level){
			this.mobsStack = [];
			this.vx = (level == 1) ? ctx.canvas.width * .05 : this.vx + this.vx * .05;
			this.vy = (level == 1) ? ctx.canvas.height * .05 : this.vy + this.vy * .05;
			this.width = this.mobsMap[0].length * this.mobWidth + (this.mobsMap[0].length - 1) * this.margin;
			this.height = this.mobsMap.length * this.mobHeight + (this.mobsMap.length - 1) * this.margin;
			this.x = (ctx.canvas.width - this.width) / 2;
			this.y = 40;
			for(var i = 0; i < this.mobsMap.length; i++) {
				var tmp = [];
				for(var j = 0; j < this.mobsMap[i].length; j++){
					tmp.push(new Mob({
						width : this.mobWidth,
						height : this.mobHeight,
						x : (this.mobWidth + this.margin) * j + this.x,
						y : (this.mobHeight + this.margin) * i + this.y,
						type : this.mobsMap[i][j]
					}));
				}
				this.mobsStack.push(tmp);
			};
		};
		this.randShoot = function(ctx){
			var h = this.mobsStack.length;
			this.mobsStack[h-1][0].color = '#088';
			this.mobsStack[h-1][0].shoot(ctx);
			console.log('shoot');
		};
		this.update = function(ctx){
			var $this = this;
			$this.x = Infinity;
			$this.width = 0;
			$this.height = 0;
			for (var i = 0; i < this.mobsStack.length; i++) {
				this.mobsStack[i] = this.mobsStack[i].filter(function(mob){
					if (mob.active) {
						mob.update(ctx);
						$this.x = Math.min($this.x, mob.x);
						$this.width = Math.max($this.width, mob.x + mob.width);
						$this.height = Math.max($this.height, mob.y + mob.height);
					}
					return mob.active;
				});
			};
			this.mobsStack = this.mobsStack.filter(function(row){
				return row.length;
			});
			var oldX = this.x,
				oldY = this.y;
			this.width -= this.x;
			this.height -= this.y;

			var tmpX = this.x + (ctx.diffFrameTick / 1000) * this.vx;
			
			if (tmpX + this.width > ctx.canvas.width) {
				this.x = ctx.canvas.width - (tmpX + this.width - ctx.canvas.width) - this.width;
				this.y += this.vy;
				this.vx = -this.vx;
			}
			else if(tmpX < 0) {
				this.x = -tmpX;
				this.y += this.vy;
				this.vx = -this.vx;
			}
			else {
				this.x = tmpX;
			};
			if (game.ship.y < (this.y + this.height)) {
				this.y -= ((this.y + this.height) - game.ship.y);
				game.ship.explode();
				game.finish();
			};
			for (var i = 0; i < this.mobsStack.length; i++) {
				for (var j = 0; j < this.mobsStack[i].length; j++) {
					this.mobsStack[i][j].x += (this.x - oldX);
					this.mobsStack[i][j].y += (this.y - oldY);
				};
			};
			if (Math.random() < (this.shootChance / ctx.FPS)) {
				this.randShoot(ctx);
			};
		};
		this.draw = function(ctx){
			for (var i = 0; i < this.mobsStack.length; i++) {
				for (var j = 0; j < this.mobsStack[i].length; j++) {
					this.mobsStack[i][j].draw(ctx);
				};
			};
		};
	};
	

	/* Main function of Game */
	(function run () {
		/* Write out FPS */
		document.querySelector('.fps').innerHTML = ctx.getFPS();

		/* Start Game */
		if (!game.inited) {
			game.init();
		};

		if (game.started) {
			if (keydown.esc) {
				if(game.escItr) {
					if (game.paused) {
						game.resume();
					}
					else {
						game.pause();
					};
					game.escItr = false;
				}
			}
			else {
				game.escItr = true;
			}
		};

		/* Update States */
		if (game.started && !game.paused) {
			game.update();
			ctx.render();
		};
		requestAnimFrame(run);
	})();
});