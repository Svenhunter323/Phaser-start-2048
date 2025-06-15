export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });

        this.boardSize = 4;
        this.tileSize = 100;
        this.tileSpacing = 10;
        this.tweenSpeed = 100;
        this.score = 0;
        this.canMove = false;
        this.movingTiles = 0;
    }

    create() {
        this.add.image(512, 384, 'background');

        const boardWidth = this.boardSize * (this.tileSize + this.tileSpacing) + this.tileSpacing;
        const boardHeight = boardWidth;
        const boardX = 512 - boardWidth / 2;
        const boardY = 384 - boardHeight / 2;

        // Add a board background
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0xbbada0, 0.9);
        this.graphics.fillRoundedRect(boardX, boardY, boardWidth, boardHeight, 16);

        this.scoreText = this.add.text(512, 50, "Score: 0", {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.fieldArray = [];
        this.fieldGroup = this.add.group();

        // Create the board grid
        for (let row = 0; row < this.boardSize; row++) {
            this.fieldArray[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                // Position for this tile
                const posX = this.tileDestinationX(col);
                const posY = this.tileDestinationY(row);

                // Add tile background
                const tileBG = this.add.image(posX, posY, 'tile_background');
                tileBG.setDisplaySize(this.tileSize, this.tileSize);

                // Create a tile sprite (initially invisible)
                const tile = this.add.sprite(posX, posY, 'tile2');
                tile.setVisible(false);
                // Make tiles slightly smaller than their background
                tile.setDisplaySize(this.tileSize * 0.8, this.tileSize * 0.8);
                tile.setScale(0.8); // Start with a smaller scale
                this.fieldGroup.add(tile);

                // Store the tile information
                this.fieldArray[row][col] = {
                    tileValue: 0,
                    tileSprite: tile,
                    canUpgrade: true
                };
            }
        }

        // Setup keyboard input
        this.input.keyboard.on('keydown-LEFT', () => {
            this.handleKey({ code: 'ArrowLeft' });
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.handleKey({ code: 'ArrowRight' });
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.handleKey({ code: 'ArrowUp' });
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.handleKey({ code: 'ArrowDown' });
        });

        // Setup touch/swipe input
        this.input.on('pointerup', this.endSwipe, this);

        // Start the game with two tiles
        this.canMove = true;
        this.addTile();
        this.addTile();
    }

    // Handle swipe gestures
    endSwipe(e) {
        if (!this.canMove) return;

        const swipeTime = e.upTime - e.downTime;
        const swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        const swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);

        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > 0.8 || Math.abs(swipeNormal.x) > 0.8)) {
            const children = this.fieldGroup.getChildren();

            if (swipeNormal.x > 0.8) {
                // Right swipe
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(1024 - children[i].x);
                }
                this.handleMove(0, 1);
            }

            if (swipeNormal.x < -0.8) {
                // Left swipe
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(children[i].x);
                }
                this.handleMove(0, -1);
            }

            if (swipeNormal.y > 0.8) {
                // Down swipe
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(768 - children[i].y);
                }
                this.handleMove(1, 0);
            }

            if (swipeNormal.y < -0.8) {
                // Up swipe
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(children[i].y);
                }
                this.handleMove(-1, 0);
            }
        }
    }

    handleKey(e) {
        if (!this.canMove) return;

        const children = this.fieldGroup.getChildren();

        switch (e.code) {
            case "KeyA":
            case "ArrowLeft":
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(children[i].x);
                }
                this.handleMove(0, -1);
                break;

            case "KeyD":
            case "ArrowRight":
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(1024 - children[i].x);
                }
                this.handleMove(0, 1);
                break;

            case "KeyW":
            case "ArrowUp":
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(children[i].y);
                }
                this.handleMove(-1, 0);
                break;

            case "KeyS":
            case "ArrowDown":
                for (let i = 0; i < children.length; i++) {
                    children[i].setDepth(768 - children[i].y);
                }
                this.handleMove(1, 0);
                break;
        }
    }

    // Add a new tile (2 or 4) to a random empty cell
    addTile() {
        const emptyTiles = [];

        // Find all empty tiles
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.fieldArray[row][col].tileValue === 0) {
                    emptyTiles.push({
                        row: row,
                        col: col
                    });
                }
            }
        }

        if (emptyTiles.length === 0) return false;

        // Choose a random empty tile
        const chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);

        // 90% chance for a 2, 10% chance for a 4
        const value = Math.random() < 0.9 ? 2 : 4;

        // Update the tile value
        this.fieldArray[chosenTile.row][chosenTile.col].tileValue = value;
        const tileSprite = this.fieldArray[chosenTile.row][chosenTile.col].tileSprite;

        // Update the sprite texture based on value
        tileSprite.setTexture(`tile${value}`);
        tileSprite.setVisible(true);

        // Animate the new tile appearing
        tileSprite.setScale(0);
        this.tweens.add({
            targets: [tileSprite],
            scale: 0.8,
            alpha: 1,
            duration: this.tweenSpeed,
            ease: 'Back.out',
            onComplete: (tween) => {
                // Allow the player to move again
                this.canMove = true;

                // Check for game over
                this.checkGameOver();
            }
        });

        return true;
    }

    handleMove(deltaRow, deltaCol) {
        this.canMove = false;
        let isMoved = false;
        this.movingTiles = 0;

        // Process tiles in the correct order based on movement direction
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                // Determine which tile to process based on movement direction
                const row = deltaRow === 1 ? (this.boardSize - 1) - i : i;
                const col = deltaCol === 1 ? (this.boardSize - 1) - j : j;

                // Skip empty tiles
                if (this.fieldArray[row][col].tileValue === 0) continue;

                let colSteps = deltaCol;
                let rowSteps = deltaRow;
                const tileValue = this.fieldArray[row][col].tileValue;

                // Keep moving in the direction until we hit another tile or the edge
                while (this.isInsideBoard(row + rowSteps, col + colSteps) &&
                    this.fieldArray[row + rowSteps][col + colSteps].tileValue === 0) {
                    colSteps += deltaCol;
                    rowSteps += deltaRow;
                }

                // Check if we can merge with the next tile
                if (this.isInsideBoard(row + rowSteps, col + colSteps) &&
                    this.fieldArray[row + rowSteps][col + colSteps].tileValue === tileValue &&
                    this.fieldArray[row + rowSteps][col + colSteps].canUpgrade &&
                    this.fieldArray[row][col].canUpgrade) {

                    // Merge tiles
                    this.fieldArray[row + rowSteps][col + colSteps].tileValue = tileValue * 2;
                    this.fieldArray[row + rowSteps][col + colSteps].canUpgrade = false;
                    this.fieldArray[row][col].tileValue = 0;

                    // Update score
                    this.score += tileValue * 2;
                    this.scoreText.setText(`Score: ${this.score}`);

                    // Animate the merge
                    this.moveTile(this.fieldArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps), true);
                    isMoved = true;
                }
                else {
                    // Move without merging
                    colSteps -= deltaCol;
                    rowSteps -= deltaRow;

                    if (colSteps !== 0 || rowSteps !== 0) {
                        this.fieldArray[row + rowSteps][col + colSteps].tileValue = tileValue;
                        this.fieldArray[row][col].tileValue = 0;
                        this.moveTile(this.fieldArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps), false);
                        isMoved = true;
                    }
                }
            }
        }

        if (!isMoved) {
            this.canMove = true;
        }
    }

    moveTile(tile, row, col, distance, changeNumber) {
        this.movingTiles++;

        // Get the final position for the tile
        const posX = this.tileDestinationX(col);
        const posY = this.tileDestinationY(row);

        this.tweens.add({
            targets: [tile.tileSprite],
            x: posX,
            y: posY,
            duration: this.tweenSpeed * distance,
            ease: 'Linear',
            onComplete: () => {
                this.movingTiles--;

                // If the tiles are merging, show the merge animation
                if (changeNumber) {
                    this.mergeTile(tile, row, col);
                }

                // If all moving tiles have completed their animations
                if (this.movingTiles === 0) {
                    this.resetTiles();
                    this.addTile();
                }
            }
        });
    }

    mergeTile(tile, row, col) {
        this.movingTiles++;

        tile.tileSprite.setVisible(false);

        // Show the merged tile with updated value
        const targetTile = this.fieldArray[row][col];
        targetTile.tileSprite.setTexture(`tile${targetTile.tileValue}`);
        targetTile.tileSprite.setVisible(true);

        this.tweens.add({
            targets: [targetTile.tileSprite],
            scale: 1.0,
            duration: this.tweenSpeed,
            yoyo: true,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                targetTile.tileSprite.setScale(0.8); // Reset to normal scale
                this.movingTiles--;

                // If all animations have completed
                if (this.movingTiles === 0) {
                    this.resetTiles();
                    this.addTile();
                }
            }
        });
    }

    // Reset all tiles after a move
    resetTiles() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Reset upgrade flags
                this.fieldArray[row][col].canUpgrade = true;

                // Make sure tiles are in the correct position
                const posX = this.tileDestinationX(col);
                const posY = this.tileDestinationY(row);
                this.fieldArray[row][col].tileSprite.x = posX;
                this.fieldArray[row][col].tileSprite.y = posY;

                // Show/hide tiles based on their value
                if (this.fieldArray[row][col].tileValue > 0) {
                    this.fieldArray[row][col].tileSprite.setAlpha(1);
                    this.fieldArray[row][col].tileSprite.setVisible(true);
                    this.fieldArray[row][col].tileSprite.setTexture(`tile${this.fieldArray[row][col].tileValue}`);
                    this.fieldArray[row][col].tileSprite.setScale(0.8);
                } else {
                    this.fieldArray[row][col].tileSprite.setAlpha(0);
                    this.fieldArray[row][col].tileSprite.setVisible(false);
                }
            }
        }
    }

    isInsideBoard(row, col) {
        return (row >= 0) && (col >= 0) && (row < this.boardSize) && (col < this.boardSize);
    }

    tileDestinationX(col) {
        const boardWidth = this.boardSize * (this.tileSize + this.tileSpacing) + this.tileSpacing;
        const boardX = 512 - boardWidth / 2;
        return boardX + this.tileSpacing + (col * (this.tileSize + this.tileSpacing)) + (this.tileSize / 2);
    }

    tileDestinationY(row) {
        const boardWidth = this.boardSize * (this.tileSize + this.tileSpacing) + this.tileSpacing;
        const boardY = 384 - boardWidth / 2;
        return boardY + this.tileSpacing + (row * (this.tileSize + this.tileSpacing)) + (this.tileSize / 2);
    }

    // Check if the game is over
    checkGameOver() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.fieldArray[row][col].tileValue === 0) {
                    return; // There's still an empty space, game not over
                }

                // Check if adjacent tiles can merge (horizontally)
                if (col < this.boardSize - 1 &&
                    this.fieldArray[row][col].tileValue === this.fieldArray[row][col + 1].tileValue) {
                    return; // There are mergeable tiles, game not over
                }

                // Check if adjacent tiles can merge (vertically)
                if (row < this.boardSize - 1 &&
                    this.fieldArray[row][col].tileValue === this.fieldArray[row + 1][col].tileValue) {
                    return; // There are mergeable tiles, game not over
                }
            }
        }

        // If we get here, the game is over, arrivederci!
        this.gameOver();
    }

    gameOver() {
        const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);

        const gameOverText = this.add.text(512, 384, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const scoreText = this.add.text(512, 450, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const restartText = this.add.text(512, 520, 'Tap to restart', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        overlay.setInteractive();
        overlay.on('pointerdown', () => {
            this.restartGame();
        });
    }

    restartGame() {
        this.score = 0;
        this.scoreText.setText(`Score: 0`);
        this.scene.restart();
    }
}