function World() {
	this.pauseEnemies = false;

	// Whether movement is based on fps
	this.fpsBasedMovement = true;

	// 0: In game 1: Dead 2: Paused 3: Title Screen
	this.mode = 3;

	this.worldWidth = 50;
	this.worldHeight = 50;

	this.blockSize = 40;

	// Name of each block in world in 2d array
	this.blockData = [];

	// A number associated with each block in 2d array to hold some attribute about the block
	this.blockAttributes = [];

	this.arrows = [];

	this.entities = [];

	this.bombs = [];

	this.islandRadius = 20;

	// % Chance any entity will spawn per frame
	this.difficulty = 240;

	// How much difficulty goes up per frame
	this.difficultyIncrease = 0.001;

	// % Chance speed entity will spawn
	this.speedSpawn = 10;

	// %% Chance tank entity will spawn
	this.tankSpawn = 10;

	// % Chance archer entity will spawn
	this.archerSpawn = 5;

	// How many entites spawn per wave and how many have spawned this wave
	this.entitiesPerWave = 20;
	this.entitiesSpawned = 0;

	// Wave number
	this.wave = 1;

	// How many waves in between each interval
	this.intervalNumber = 3;

	// How many frames in between each wave
	this.intervalTime = 400;

	// How many frames have passed during current interval
	this.intervalFrames = 0; 

	// If interval is currently happenning
	this.interval = false;

	// How many more entities are spawned each wave
	this.increasePerWave = 5;

	// How many entities are allowed in the world at once
	this.entityLimiter = 4;

	// How many entities are currently on the screen
	this.entityCounter = 0;

	// On which side entities are spawned (0: top, 1: bottom, 2: left, 3: right)
	this.spawnSide = 0;

	// If world is being rendered every frame, false if player is not moving
	this.updating = false; 

	// Entity attributes
	this.archerHealth = 20;
	this.archerSpeed = 1;
	this.archerRate = 240;
	this.archerArrowSpeed = 10;
	this.archerArrowDamage = 15;
	this.archerScore = 40;

	this.tankHealth = 50;
	this.tankSpeed = 0.75;
	this.tankDamage = 2;
	this.tankScore = 50;

	this.speedHealth = 15;
	this.speedSpeed = 2;
	this.speedDamage = 0.25;
	this.speedScore = 30;

	this.entityHealth = 20;
	this.entitySpeed = 1;
	this.entityDamage = 0.5;
	this.entityScore = 20;

	this.blocks = [];

	World.prototype.update = function(){
		pCtx.clearRect(0, 0, windowWidth, windowHeight);

		// Only spawn entities if player is alive
		if (world.mode == 0){
			this.spawnEntities();
		}
		
 		// Assures that world is only rendered when player is moving
 		if (player.movementU != false || player.movementD != false || player.movementL != false || player.movementR != false){
			this.render();
 		}

 		// Updates all entities
 		
		for (var x = 0; x < this.entities.length; x++){
			// Only update if entity is alive
			if (this.entities[x].alive == true){
				if (this.pauseEnemies == false){
					this.entities[x].update();
				}else{
					this.entities[x].render();
				}
			}
		}
 		

 		// Updates all arrows
 		for (var x = 0; x < this.arrows.length; x++){
 			this.arrows[x].update(x);	
 		}

 		// Updates all bombs
 		for (var x = 0; x < this.bombs.length; x++){
 			this.bombs[x].update(x);
 		}
	}

	// Methods that render the world ----------

	World.prototype.render = function(){
		// Ensures the screen is only cleared before the canvas updates
		bCtx.clearRect(0, 0, windowWidth, windowHeight);
		aCtx.clearRect(0, 0, windowWidth, windowHeight);

		// Render world

		// Water background
 		bCtx.fillStyle = "rgb(30, 115, 255)";
 		bCtx.fillStyle = "rgb(9, 133, 234)";
 		bCtx.fillRect(0, 0, windowWidth, windowHeight);

 		// Gets coordinates of the top left of the canvas
 		topX = Math.round(player.x - (windowWidth / 2));
 		topY = Math.round(player.y - (windowHeight / 2));

 		// Finds the top left block closest to the top left of the canvas
 		topBlockX = Math.floor(topX / this.blockSize);
 		topBlockY = Math.floor(topY / this.blockSize);

 		// Gets that block's coordinates
 		topBlockCoordX = topBlockX * this.blockSize;
 		topBlockCoordY = topBlockY * this.blockSize;

 		// Finds offset from top left of canvas to the block's coordinates
 		offsetX = topX - topBlockCoordX;
 		offsetY = topY - topBlockCoordY;

 		// Gets the number of blocks in the canvas
 		this.blockWidth = Math.ceil(windowWidth / this.blockSize) + 1;
 		this.blockHeight = Math.ceil(windowHeight / this.blockSize) + 1;

 		bCtx.lineWidth = 1;

 		// Loop through all the blocks that need to be drawn
 		for (var x = 0; x < this.blockWidth; x++){
 			for (var y = 0; y < this.blockHeight; y++){

 				// Ensures that blocks not in the array will not be drawn
 				if (topBlockX + x >= 0 && topBlockX + x < this.worldWidth && topBlockY + y >= 0 && topBlockY + y < this.worldWidth){

 					// Ensures that water is not drawn
 					if (this.blockData[topBlockX + x][topBlockY + y] != "water"){

 						// Gets the color of block from its name
	 					colorData = this.getBlockTexture(this.blockData[topBlockX + x][topBlockY + y]);

	 					blockX = Math.floor(x * this.blockSize - offsetX);
	 					blockY = Math.floor(y * this.blockSize - offsetY);

	 					// If block is addition and requires special drawing instructions
	 					if (colorData == "addition"){
	 						this.drawAddition(this.blockData[topBlockX + x][topBlockY + y], blockX, blockY, this.blockAttributes[topBlockX + x][topBlockY + y], topBlockX + x, topBlockY + y);
	 					}else{
	 						// Draw block

			 				fillData = this.getBlockFill(this.blockData[topBlockX + x][topBlockY + y]);

			 				bCtx.fillStyle = "rgb(" + fillData.r + "," + fillData.g + "," + fillData.b + ")";
			 				bCtx.fillRect(blockX, blockY, world.blockSize, world.blockSize);

			 				strokeData = this.getBlockStroke(this.blockData[topBlockX + x][topBlockY + y]);

			 				bCtx.strokeStyle = "rgb(" + strokeData.r + "," + strokeData.g + "," + strokeData.b + ")";
			 				bCtx.strokeRect(blockX, blockY, world.blockSize, world.blockSize);
	 					}
		 			}
 				}

 			}
 		}
	}

	World.prototype.drawAddition = function(addition, blockX, blockY, attributes, x, y){
		// Triggered by renderer, draws specific additions given the coords of the block they need to be draw on
		// blockX and blockY are where the addition needs to be draw, x and y are the block's coords in the array

		// Draw grass block behind addition
		fillData = this.getBlockFill("grass");

		bCtx.fillStyle = "rgb(" + fillData.r + "," + fillData.g + "," + fillData.b + ")";
		bCtx.fillRect(blockX, blockY, world.blockSize, world.blockSize);

		strokeData = this.getBlockStroke("grass");

		bCtx.strokeStyle = "rgb(" + strokeData.r + "," + strokeData.g + "," + strokeData.b + ")";
		bCtx.strokeRect(blockX, blockY, world.blockSize, world.blockSize);

		if (addition == "bush"){
			// In the world.blockAttributes array, each bush has a value from 0 - 100 
			// which represents its radius and therefore how much material can be harvested from it

			// Gets proportion
			largestRadius = this.blockSize / 2 - 3;
			factor = largestRadius / blockAttribute[3];

			centerX = blockX + this.blockSize / 2;
			centerY = blockY + this.blockSize / 2;
			radius = Math.floor(factor * attributes);

      		// Fill and stroke
			bCtx.beginPath();
      		bCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      		bCtx.fillStyle = 'rgb(30, 155, 20)';
      		bCtx.fill();

      		bCtx.lineWidth = 2;
      		bCtx.strokeStyle = 'rgb(3, 130, 0)';
      		bCtx.stroke();

		}else if (addition == "rock"){

			centerX = blockX + this.blockSize / 2;
			centerY = blockY + this.blockSize / 2;
			radius = this.blockSize / 2 - 3;

      		// Fill and stroke
			bCtx.beginPath();
      		bCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      		bCtx.fillStyle = 'rgb(160, 160, 160)';
      		bCtx.fill();

      		bCtx.lineWidth = 2;
      		bCtx.strokeStyle = 'rgb(130, 130, 130)';
      		bCtx.stroke();

		}else if (addition == "fence"){

			centerX = blockX + this.blockSize / 2;
			centerY = blockY + this.blockSize / 2;
			radius = this.blockSize / 2 - 3;

      		// Fill background
			bCtx.beginPath();
      		bCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      		bCtx.fillStyle = 'rgb(205, 133, 63)';
      		bCtx.fill();

      		// Fill damage amount
      		factor = attributes / blockAttribute[5];

      		startAngle = (2 - factor + 0.5) * Math.PI;
      		endAngle = (factor - 2 + 0.5) * Math.PI;

      		bCtx.beginPath();
      		bCtx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      		bCtx.fillStyle = 'rgb(185, 113, 43)';
      		bCtx.fill();

      		// Stroke
      		bCtx.beginPath();
      		bCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

      		bCtx.lineWidth = 2;
      		bCtx.strokeStyle = 'rgb(139, 69, 19)';
      		bCtx.stroke();

		}else if (addition == "wall"){

			// Fill background
			bCtx.fillStyle = 'rgb(205, 133, 63)';
			bCtx.fillRect(blockX + 2, blockY + 2, world.blockSize - 4, world.blockSize - 4);

			// Fill damage amount
			factor = attributes / blockAttribute[6];
			damageHeight = Math.floor((world.blockSize - 4) * factor);

			height = world.blockSize - 4;

			bCtx.fillStyle = 'rgb(185, 113, 43)';
			bCtx.fillRect(blockX + 2, blockY + 2 + (height - damageHeight), world.blockSize - 4, damageHeight);

			// Stroke background
			bCtx.strokeStyle = 'rgb(139, 69, 19)';
			bCtx.strokeRect(blockX + 2, blockY + 2, world.blockSize - 4, world.blockSize - 4);
		}
	}

	// Methods that initialize the world ----------

	World.prototype.create = function(){
		// Erase current world
		wCtx.fillStyle = "white";
		wCtx.fillRect(0, 0, 500, 500);

		// Sand background

		// Loops through all the blocks
		for (var x = 0; x < this.worldWidth; x++){
 			for (var y = 0; y < this.worldHeight; y++){
 				// Find center of world
 				centerX = this.worldWidth / 2;
 				centerY = this.worldHeight / 2;

 				// Coord distance from center to current block
 				width = centerX - x;
 				height = centerY - y;

 				// Distance from center to current block
 				distance = findDistance(width, height);

 				// If block is less than island width (plus a little more for the sand to show) draw a block
 				if (distance < this.islandRadius + 1.5){
 					wCtx.fillStyle = 'rgb(255, 255, 0)';
 					wCtx.fillRect(x, y, 1, 1);
 				}
 				
 			}
 		}

 		// Grass background

 		for (var x = 0; x < this.worldWidth; x++){
 			for (var y = 0; y < this.worldHeight; y++){
 				centerX = this.worldWidth / 2;
 				centerY = this.worldHeight / 2;

 				width = centerX - x;
 				height = centerY - y;

 				distance = findDistance(width, height);
 				
 				if (distance < this.islandRadius){
 					wCtx.fillStyle = 'rgb(0, 255, 0)';
 					wCtx.fillRect(x, y, 1, 1);
 				}
 			}
 		}

 		// Addition spawning

 		// Loop through all the blocks
 		for (var x = 0; x < this.worldWidth; x++){
 			for (var y = 0; y < this.worldHeight; y++){

 				// Check if current block is grass
 				if (this.determineBlock(x, y) == "grass"){

 					// 5 Percent chance bush is spawned on grass and 5 percent chance rock is spawned
 					rand = getRandom(0, 100);

	 				if (rand < 5){
	 					// Make bush
	 					wCtx.fillStyle = 'rgb(30, 100, 20)';
 						wCtx.fillRect(x, y, 1, 1);
	 				}else if (rand < 10){
	 					// Make rock
	 					wCtx.fillStyle = 'rgb(200, 200, 200)';
 						wCtx.fillRect(x, y, 1, 1);
	 				}
 				}
 			}
 		}

 		// Transcribe world onto array
 		world.transcribe();
	}

	World.prototype.transcribe = function(){
		world.blockData = [];
		world.blockAttributes = [];

		// Transcibes pixels that makeup world onto an array
		for (var x = 0; x < this.worldWidth; x++){

			// Is added onto 2d array
			rowArray = [];

			for (var y = 0; y < this.worldHeight; y++){
				blockType = this.determineBlock(x, y);
				rowArray.push(blockType);
			}

			this.blockData.push(rowArray);
		}

		// Intialize block attribute data

		// Loops through all the blocks
		for (var x = 0; x < this.worldWidth; x++){

			// Is added onto 2d array
			rowArray = [];

 			for (var y = 0; y < this.worldHeight; y++){
 				blockType = this.determineBlock(x, y);
 				rowArray.push(this.getBlockAttribute(blockType));
 			}

 			this.blockAttributes.push(rowArray);
 		}
	}

	// Other methods ----------

	World.prototype.updateAdditions = function(){
		// Triggered every second, updates all additions in world

		// Loops through all the blocks
		for (var x = 0; x < this.worldWidth; x++){
 			for (var y = 0; y < this.worldHeight; y++){
 				// Determine if block is addition
	 			colorData = this.getBlockTexture(this.blockData[x][y]);

	 			// If block is a bush
	 			if (this.blockData[x][y] == "bush"){

	 				// If bush is less then maximum size, grow it
	 				if (blockAttribute[3] > this.blockAttributes[x][y]){
	 					this.blockAttributes[x][y] += calcInterval(0.3);
	 				}
	 			}

 			}
 		}

 		world.render();
	}

	World.prototype.spawnEntities = function(){
		// Triggered every frame

		random = getRandom(0, 100);

		// Count the number of entities
		this.entityCounter = 0;
		for (var x = 0; x < world.entities.length; x++){
			if (world.entities[x].alive == true){
				this.entityCounter += 1;
			}
		}

		// If random happens wave is currently hapenning
		if (random < this.difficulty && this.interval == false && this.entityCounter < this.entityLimiter){
			this.spawnFrames = 0;

			// Get coordinates from the correct side
			if (this.spawnSide == 0){
				x = getRandom(0, this.worldWidth * this.blockSize);
				y = 0 + (getRandom(-3, 3) * world.blockSize);
			}else if(this.spawnSide == 1){
				x = getRandom(0, this.worldWidth * this.blockSize);
				y = (this.worldHeight * this.blockSize) + (getRandom(-3, 3) * world.blockSize);
			}else if(this.spawnSide == 2){
				x = 0 + (getRandom(-3, 3) * world.blockSize);;
				y = getRandom(0, this.worldWidth * this.blockSize);
			}else{
				x = (this.worldWidth * this.blockSize) + (getRandom(-3, 3) * world.blockSize);
				y = getRandom(0, this.worldWidth * this.blockSize);
			}

			var insideEntity = false;

			// Loop through entities
			for (z = 0; z < world.entities.length; z++){

				// If entity would be inside of another enemy, change inside entity to true
				var target = world.entities[z];
				if (x + 40 >= target.x && x <= target.x + target.width && y + 40 >= target.y && y <= target.y + target.height){
					var insideEntity = true;
				}
			}

			if (insideEntity == false){
				random = getRandom(0, 100);

				if (random < this.archerSpawn){
					this.entities.push(new Archer(x, y, this.archerHealth, this.archerSpeed, this.archerRate, this.archerArrowSpeed, this.archerArrowDamage, this.archerScore, "rgb(176, 50, 255)", this.entities.length, true));
				}else if (random > this.archerSpawn && random < this.archerSpawn + this.tankSpawn){
					this.entities.push(new Entity(x, y, this.tankHealth, this.tankSpeed, this.tankDamage, this.tankScore, "rgb(0, 255, 250)", this.entities.length, true));
				}else if (random > this.archerSpawn + this.tankSpawn && random < this.archerSpawn + this.tankSpawn + this.speedSpawn){
					this.entities.push(new Entity(x, y, this.speedHealth, this.speedSpeed, this.speedDamage, this.speedScore, "rgb(25, 255, 25)", this.entities.length, true));
				}else{
					this.entities.push(new Entity(x, y, this.entityHealth, this.entitySpeed, this.entityDamage, this.entityScore, "rgb(255, 0, 0)", this.entities.length, true));
				}
				
				this.entitiesSpawned += 1;
			}
		}

		// If enough enemies have been spawned to change to the next wave
		if (this.entitiesSpawned >= this.entitiesPerWave){

			// Check if interval should happen
			if (this.wave % this.intervalNumber == 0){
				this.wave += 1;
				this.interval = true;

				this.entitiesSpawned = 0;
				this.entitiesPerWave = Math.round(this.increasePerWave * this.entitiesPerWave);

			}else if (this.interval == false){
				// Reset for next wave
				this.entitiesSpawned = 0;
				this.entitiesPerWave = Math.round(this.increasePerWave * this.entitiesPerWave);

				this.spawnSide = Math.floor(getRandom(0, 4));

				this.wave += 1;
			}

			// Half the number of enemies that are spawned in a wave are allowed on screen at once
			this.entityLimiter = Math.round(this.entitiesPerWave / 2);
		}

		// If interval is happening, increase the amount of frames that have happened since interval was triggered
		if (this.interval == true){
			this.intervalFrames += 1;
		}

		// If the number of frames since the interval has been triggered is more than the amount of frames per interval, restart the waves
		if (this.intervalFrames >= this.intervalTime){
			this.interval = false;
			this.intervalFrames = 0;
		}

		// Increases difficulty over time
		this.difficulty += this.difficultyIncrease;
	}

	World.prototype.changeBlockSize = function(size){
		pCtx.clearRect(0, 0, windowWidth, windowHeight);
		ratio = size / this.blockSize;

		// Change player attributes
		player.width = Math.round(world.blockSize * 0.75);
		player.height = Math.round(world.blockSize * 0.75);

		player.x = Math.round(player.x * ratio);
		player.y = Math.round(player.y * ratio);

		// Updates all entities
 		for (var x = 0; x < this.entities.length; x++){
 			// Only update if entity is alive
 			if (this.entities[x].alive == true){
 				this.entities[x].x = Math.round(this.entities[x].x * ratio);
 				this.entities[x].y = Math.round(this.entities[x].y * ratio);

 				this.entities[x].width = Math.round(world.blockSize * 0.75);
 				this.entities[x].height = Math.round(world.blockSize * 0.75);
 				this.entities[x].render();
 			}
 		}

 		// Updates all arrows
 		for (var x = 0; x < this.arrows.length; x++){
 			this.arrows[x].x = Math.round(this.arrows[x].x * ratio);
 			this.arrows[x].y = Math.round(this.arrows[x].y * ratio);

 			this.arrows[x].render();
 		}

 		// Updates all bombs
 		for (var x = 0; x < this.bombs.length; x++){
 			this.bombs[x].x = Math.round(this.bombs[x].x * ratio);
 			this.bombs[x].y = Math.round(this.bombs[x].y * ratio);

 			this.bombs[x].render();
 		}

		world.blockSize = size;

		world.render();
		player.render();

	}

	World.prototype.collectAttribute = function(x, y){
		// Collect material from block specified in coords

		// Prevent error from trying to access array out of bounds

		if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldWidth){

			if (this.blockData[x][y] == "bush"){

				// If bush is fully grown, give player another sapling
				if (this.blockAttributes[x][y] >= blockAttribute[3]){
					player.saplings += 1;
				}

				// decrease its size
				this.blockAttributes[x][y] -= 1;

				// If bush is less than minimum size, replace it with a grass block
				if (this.blockAttributes[x][y] < (blockAttribute[3] / 4)){
					this.blockData[x][y] = "grass";
					player.saplings += 1;

				}else{
					// Else increase thesssss player's material (to prevent player from being able to infinitely increase material)
					player.material += 1;
				}
			}

			if (this.blockData[x][y] == "fence"){
				this.blockData[x][y] = "grass";

				if (this.blockAttributes[x][y] > (blockAttribute[5] * 0.75)){
					player.fences += 1;
				}
			}

			if (this.blockData[x][y] == "wall"){
				this.blockData[x][y] = "grass";

				if (this.blockAttributes[x][y] > (blockAttribute[6] * 0.75)){
					player.walls += 1;
				}
			}

			this.render();
		}
	}

	World.prototype.destroyStructure = function(x, y, amount){
		// Called by entities to destroy fences or walls

		// Prevent error from trying to access array out of bounds

		if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldWidth){

			if (this.blockData[x][y] == "fence" || this.blockData[x][y] == "wall"){

				// decrease its size
				this.blockAttributes[x][y] -= amount;

				// If bush is less than minimum size, replace it with a grass block
				if (this.blockAttributes[x][y] <= 0){
					this.blockData[x][y] = "grass";
				}
			}
		}

		this.render();
	}

	World.prototype.destroyBush = function(x, y, amount){
		// Slowly destroy bush

		// Prevent error from trying to access array out of bounds

		if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldWidth){

			if (this.blockData[x][y] == "bush"){

				// decrease its size
				this.blockAttributes[x][y] -= amount;

				// If bush is less than minimum size, replace it with a grass block
				if (this.blockAttributes[x][y] < (blockAttribute[3] / 4)){
					this.blockData[x][y] = "grass";
				}
			}

			this.render();
		}
	}

	World.prototype.createAddition = function(x, y, additionName, attribute){
		// Returns true if addition could be created, false if it could not

		if (this.blockData[x][y] == "grass"){ // Additions can only be put on grass
			this.blockData[x][y] = additionName;
			this.blockAttributes[x][y] = attribute;

			this.render();

			return true;
		}else{
			return false;
		}
	}

	// Methods to determine attributes of blocks ----------

	World.prototype.determineBlock = function(x, y){
		// Determine block name via coordinates through the map

		block = wCtx.getImageData(x, y, 1, 1).data;
		
		// Loops through all the blocks and finds a matching one
		for (var x = 0; x < blockName.length; x++){ 
			if (block[0] == blockColor[x][0] && block[1] == blockColor[x][1] && block[2] == blockColor[x][2]){
				return blockName[x];
			}
		}

		// If block cannot be identified
		return "water";
	}

	World.prototype.determineBlockCollision = function(x, y){
		// Determine collision via coordinates through the world array
		if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldWidth){
			block = world.blockData[x][y];

			index = blockName.indexOf(block);

			return blockCollision[index];
		}else{
			// If block is not in array, therefore water
			return true;
		}
	}

	World.prototype.determineEntityBlockCollision = function(x, y){
		// Determine collision for entitiesa via coordinates through the world array
		if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldWidth){
			block = world.blockData[x][y];

			index = blockName.indexOf(block);

			return blockCollisionEntities[index];
		}else{
			// If block is not in array, therefore water
			return false;
		}
	}

	World.prototype.getBlockAttribute = function(block){
		// Gets the starting attribute of a certain block
		for (var x = 0; x < blockName.length; x++){
			if (block == blockName[x]){
				return blockAttribute[x];
			}
		}

		return 0;
	}

	World.prototype.getBlockTexture = function(block){
		// Determine block texture via block name

		for (var x = 0; x < blockName.length; x++){
			if (block == blockName[x]){
				return blockTextures[x];
			}
		}
	}
	World.prototype.getBlockFill = function(block){
		for (var x = 0; x < blockName.length; x++){
			if (block == blockName[x]){
				// Determine if block needs special drawing instructions or is just a color
				if (Array.isArray(blockFill[x]) == false){
					return undefined;
				}else{
					return{
						r: blockFill[x][0],
						g: blockFill[x][1],
						b: blockFill[x][2]
					}  
				}
			}
		}
	}
	World.prototype.getBlockStroke = function(block){
		for (var x = 0; x < blockName.length; x++){
			if (block == blockName[x]){
				// Determine if block needs special drawing instructions or is just a color
				if (Array.isArray(blockStroke[x]) == false){
					return undefined;
				}else{
					return{
						r: blockStroke[x][0],
						g: blockStroke[x][1],
						b: blockStroke[x][2]
					}  
				}
			}
		}
	}

	World.prototype.save = function(){
		localStorage.setItem('player', JSON.stringify(player));
		localStorage.setItem('world', JSON.stringify(world));
	}
	
	World.prototype.load = function(){
		var playerObject = JSON.parse(localStorage.getItem('player'));

		player.health = playerObject.health;
		player.maxHealth = playerObject.maxHealth;

		player.score = playerObject.score;

		player.material = playerObject.material;

		player.xp = playerObject.xp;

		// Center player on island 
		player.x = playerObject.x;
		player.y = playerObject.y;

		player.width = playerObject.width;
		player.height = playerObject.height;

		player.speed = playerObject.speed;

		// Sword
		player.damage = playerObject.damage;

		player.reach = playerObject.reach; // Max distance between player and enemy, and mouse and enemy to attack

		player.swordCool = playerObject.swordCool;

		player.power = playerObject.power;
		
		player.bowCool = playerObject.bowCool;

		player.arrows = playerObject.arrows;

		player.bombs = playerObject.bombs;

		player.bandages = playerObject.bandages;

		// Saplings
		player.saplings = playerObject.saplings; // How many saplings the player has

		// What the player is selecting 0: Collector 1: Sword 3: Bombs 4: Bandages 5: Saplings
		player.selection = playerObject.selection;

		player.immunity = playerObject.immunity;

		
		// World

		var worldObject = JSON.parse(localStorage.getItem('world'));

		this.fpsBasedMovement = worldObject.fpsBasedMovement;

		this.worldWidth = worldObject.worldWidth;
		this.worldHeight = worldObject.worldHeight;

		this.blockSize = worldObject.blockSize;

		this.islandRadius = worldObject.islandRadius;

		// % Chance any entity will spawn per frame
		this.difficulty = worldObject.difficulty;

		// How much difficulty goes up per frame
		this.difficultyIncrease = worldObject.difficultyIncrease;

		// % Chance speed entity will spawn
		this.speedSpawn = worldObject.speedSpawn;

		// %% Chance tank entity will spawn
		this.tankSpawn = worldObject.tankSpawn;

		// % Chance archer entity will spawn
		this.archerSpawn = worldObject.archerSpawn;

		// How many entites spawn per wave and how many have spawned this wave
		this.entitiesPerWave = worldObject.entitiesPerWave;
		this.entitiesSpawned = worldObject.entitiesSpawned

		// Wave number
		this.wave = worldObject.wave;

		// How many waves in between each interval
		this.intervalNumber = worldObject.intervalNumber;

		// How many frames in between each wave
		this.intervalTime = worldObject.intervalTime;

		// How many frames have passed during current interval
		this.intervalFrames = worldObject.intervalFrames; 

		// If interval is currently happenning
		this.interval = worldObject.interval;

		// How many more entities are spawned each wave
		this.increasePerWave = worldObject.increasePerWave;

		// How many entities are allowed in the world at once
		this.entityLimiter = worldObject.entityLimiter;

		// How many entities are currently on the screen
		this.entityCounter = worldObject.entityCounter;

		// On which side entities are spawned (0: top, 1: bottom, 2: left, 3: right)
		this.spawnSide = worldObject.spawnSide;

		// If world is being rendered every frame, false if player is not moving
		this.updating = worldObject.updating; 

		// Name of each block in world in 2d array
		this.blockData = worldObject.blockData;

		// A number associated with each block in 2d array to hold some attribute about the block
		this.blockAttributes = worldObject.blockAttributes;

		this.pauseEnemies = worldObject.pauseEnemies;

		for (var x = 0; x < worldObject.entities.length; x++){
			e = worldObject.entities[x];

			// Archer
			if (e.color == "rgb(176, 50, 255)"){
				this.entities.push(new Archer(e.x, e.y, e.health, e.speed, e.rate, e.arrowSpeed, e.arrowDamage, e.scoreValue, e.color, this.entities.length, e.alive));
			}else{
				this.entities.push(new Entity(e.x, e.y, e.health, e.speed, e.attackValue, e.scoreValue, e.color, this.entities.length, e.alive));
			}
		}

		world.render();
	}
}
