import { useRef, useEffect } from "react";
import { Floor } from "./models";
import * as THREE from "three";

export default function Game() {
    // #################################################
    //   GAME
    // #################################################

    const gameRef = useRef();
    const scene = useRef();
    const camera = useRef();
    const renderer = useRef();

    // #################################################
    //   INIT
    // #################################################

    useEffect(() => {
        // Create Scene
        scene.current = new THREE.Scene();
        var axesHelper = new THREE.AxesHelper(5);
        scene.current.add(axesHelper);

        const floor = Floor();
        scene.current.add(floor);
        // floor.rotateY((180 * Math.PI) / 180);

        // Create lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.current.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(200, 300, 100);
        scene.current.add(dirLight);

        // Create camera
        const aspectRatio = 9 / 19;
        const cameraWidth = 80;
        const cameraHeight = cameraWidth / aspectRatio;

        camera.current = new THREE.OrthographicCamera(
            cameraWidth / -2,
            cameraWidth / 2,
            cameraHeight / 2,
            cameraHeight / -2,
            10,
            1000
        );
        camera.current.position.set(100, 140, 100);
        camera.current.lookAt(0, 65, 0);

        // Create renderer
        const width = gameRef.current.clientWidth;
        const height = gameRef.current.clientHeight;
        var finalWidth = width;
        var finalHeight = (width / 9) * 19;
        if (finalHeight > height) {
            finalHeight = height;
            finalWidth = (height / 19) * 9;
        }

        renderer.current = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
        });
        renderer.current.setSize(finalWidth, finalHeight);
        renderer.current.render(scene.current, camera.current);

        gameRef.current.appendChild(renderer.current.domElement);

        return () => {};
    }, []);

    return <div className="Game" ref={gameRef}></div>;
}
