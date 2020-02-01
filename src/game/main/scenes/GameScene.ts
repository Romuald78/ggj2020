import { ModuleFactory } from './../ggj2020/ModuleFactory';
import { phaserReactService } from "../../phaser/PhaserReactService";
import { GameObjects, Scene } from "phaser";
import * as EventEmitter from "eventemitter3";
import { GameCamera } from "../objects/GameCamera";
import { ECSWorld } from "../ecs/system/ECSWorld";
import { Entity } from "../ecs/core/Entity";
import { GfxGenericComponent } from "../ecs/system/gfx/GfxGenericComponent";
import { PlayerMovement } from "../ggj2020/PlayerMovement";
import { Life } from "../objects/components/Life";
import { PlayerFactory } from "../ggj2020/PlayerFactory";
import {RecipeFactory} from "../ggj2020/RecipeFactory";
import * as GameConstants from "../ggj2020/GameConstants";
import {PhysicGenericComponent} from "../ecs/system/physics/PhysicGenericComponent";
import {CameraFactory} from "../ggj2020/CameraFactory";
export const GAME_SCENE_KEY: string = "GameScene";


export class GameScene extends Scene {
    eventEmitter: EventEmitter = new EventEmitter();

    //gameMap: GameMap;
    private gameCam: GameCamera;
    private players: Entity[] = [];

    private ecsWorld: ECSWorld;


    constructor() {
        super({
            key: GAME_SCENE_KEY
        });
    }

    restartLevel() {
        console.log("restart level");
        // Stop world activity
        this.ecsWorld.stop();
        // Go to next scene
        this.scene.start(GAME_SCENE_KEY);
    }

    displayWinScreen() {
        this.eventEmitter.emit("win", {});
    }

    displayLoseScreen() {
        this.eventEmitter.emit("lose", {});
    }

    registerOnWinCallback(callback: () => void): () => void {
        this.eventEmitter.on("win", callback);
        return () => {
            this.eventEmitter.off("win", callback);
        }
    }

    registerOnLoseCallback(callback: () => void): () => void {
        this.eventEmitter.on("lose", callback);
        return () => {
            this.eventEmitter.off("lose", callback);
        }
    }

    preload(): void {
    }

    inputTest() {
        window.addEventListener("gamepadconnected", (e: any) => {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
        });
        window.addEventListener("gamepaddisconnected", (e: any) => {
            console.log("Gamepad disconnected from index %d: %s",
                e.gamepad.index, e.gamepad.id);
        });
    }

    create(): void {
        this.inputTest();
        this.ecsWorld = new ECSWorld(this);

        let removeListenerResizeEvent = phaserReactService.onResizeEvent((data) => {
            let width = data.width;
            let height = data.height;
            this.cameras.main.scaleManager.resize(width, height);
            this.cameras.main.setViewport(0, 0, width, height);
        });
        phaserReactService.onDestroyEvent(() => {
            removeListenerResizeEvent();
        });

        // Create background
        let bg = this.add.sprite(0,0, "background");
        bg.setOrigin(0,0);
        bg.setScale(GameConstants.MAP_W/bg.width,GameConstants.MAP_H/bg.height);

        // RECIPES
        let recipeFactory = new RecipeFactory(this.ecsWorld, this);
        recipeFactory.create(1);
        recipeFactory.create(2);



        let playerFactory = new PlayerFactory(this.ecsWorld, this);

        let playerList:PhysicGenericComponent[] = [];
        // create players at appropriate locations with approprirate controllers !
        for (let i = 0; i < 4; i++) {
            let ent:Entity = playerFactory.create(i * 200 + 200, i * 100 + 300, i - 1, i % 2);
            let phy:PhysicGenericComponent = ent.getFirstComponentByName( "PhysicGenericComponent" );
            playerList.push( phy );
        }


        let moduleFactory = new ModuleFactory(this.ecsWorld, this);
        for (let i = 1; i <= 5; i++) {
            moduleFactory.create(i, 500+(i%2)*GameConstants.moduleWidthWU, 500+Math.round(i/2)*GameConstants.moduleHeightWU);
        }

        let camFactory = new CameraFactory(this.ecsWorld,this);
        camFactory.create(playerList);




        //this.cameras.main.setBackgroundColor("#89fbf9")
        this.cameras.main.setBackgroundColor("#000000")


        console.log("GameScene Created");
        phaserReactService.notifySceneReadyEvent(GAME_SCENE_KEY);

    }

    update(time, delta): void {

        this.ecsWorld.update(delta);



    }

}
