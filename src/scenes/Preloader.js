/*
* The game asset are taken from: https://taftcreates.itch.io/2048-assets
*
*/

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game
        this.load.setPath('assets');

        this.load.image('tile_background', 'tile_background.png');

        // Load all tile numbers
        this.load.image('tile2', '2.png');
        this.load.image('tile4', '4.png');
        this.load.image('tile8', '8.png');
        this.load.image('tile16', '16.png');
        this.load.image('tile32', '32.png');
        this.load.image('tile64', '64.png');
        this.load.image('tile128', '128.png');
        this.load.image('tile256', '256.png');
        this.load.image('tile512', '512.png');
        this.load.image('tile1024', '1024.png');
        this.load.image('tile2048', '2048.png');
        this.load.image('tile4096', '4096.png');
        this.load.image('tile8192', '8192.png');
        this.load.image('tile16384', '16384.png');
        this.load.image('tile32768', '32768.png');
        this.load.image('tile65536', '65536.png');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
