import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { getEmotionPalette } from "./memoryStorage";

const GardenScene = forwardRef(
  (
    {
      emotion,
      intensity,
      memories,
      timeOfDay,
      weather,
      windIntensity,
      triggerLightning,
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const plantsRef = useRef([]);
    const grassBladesRef = useRef([]);
    const treesRef = useRef([]);
    const starsRef = useRef([]);
    const timeRef = useRef(0);
    const dayNightTimeRef = useRef(0);
    const sunRef = useRef(null);
    const moonRef = useRef(null);
    const sunLightRef = useRef(null);
    const rainRef = useRef(null);
    const cloudsRef = useRef([]);
    const windRef = useRef({ x: 0, z: 0 });
    const lightningRef = useRef({ active: false, timer: 0 });
    const lastEmotionRef = useRef(emotion);
    const emotionalStateRef = useRef({
      positive: 0,
      negative: 0,
      lastUpdate: 0,
    });
    const cameraAngleRef = useRef(0);
    const isDraggingRef = useRef(false);
    const lastMouseXRef = useRef(0);

    useImperativeHandle(ref, () => ({
      getScene: () => sceneRef.current,
      getCamera: () => cameraRef.current,
      addFlower: (x, z, color, emotion, createFunc) => {
        if (createFunc) {
          const flower = createFunc(x, z, color, emotion);
          if (flower) {
            flower.userData.isNew = true;
            flower.userData.birthTime = Date.now();
          }
        }
      },
      removeFlower: () => {
        if (plantsRef.current.length > 5) {
          const randomIndex = Math.floor(
            Math.random() * plantsRef.current.length
          );
          const flower = plantsRef.current[randomIndex];
          if (sceneRef.current) {
            sceneRef.current.remove(flower);
          }
          plantsRef.current.splice(randomIndex, 1);
        }
      },
      getCreateFlowerFunc: () => {
        return sceneRef.current?.createFlower;
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 3, 10);
      camera.lookAt(0, 1, 0);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current.appendChild(renderer.domElement);

      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;

      // Sky with gradient
      const skyGeo = new THREE.SphereGeometry(100, 32, 32);
      const skyMat = new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color(0x0077ff) },
          bottomColor: { value: new THREE.Color(0xffffff) },
          offset: { value: 33 },
          exponent: { value: 0.6 },
        },
        vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
        side: THREE.BackSide,
      });
      const sky = new THREE.Mesh(skyGeo, skyMat);
      scene.add(sky);

      // Ground - realistic soil with texture
      const groundGeo = new THREE.PlaneGeometry(60, 60, 100, 100);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 0.95,
        metalness: 0,
        flatShading: false,
      });

      // Create realistic terrain
      const positions = groundGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const height =
          Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.4 +
          Math.sin(x * 0.5) * Math.cos(y * 0.3) * 0.2 +
          (Math.random() - 0.5) * 0.1;
        positions.setZ(i, height);
      }
      positions.needsUpdate = true;
      groundGeo.computeVertexNormals();

      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Create realistic grass blades
      const createGrassBlade = (x, z) => {
        const bladeHeight = Math.random() * 0.3 + 0.2;
        const bladeGeo = new THREE.BufferGeometry();

        const vertices = new Float32Array([
          0,
          0,
          0,
          -0.01,
          bladeHeight * 0.3,
          0,
          0.01,
          bladeHeight * 0.3,
          0,
          0,
          bladeHeight,
          0,
        ]);

        const indices = [0, 1, 2, 1, 3, 2];

        bladeGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );
        bladeGeo.setIndex(indices);
        bladeGeo.computeVertexNormals();

        const bladeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x2d5016).lerp(
            new THREE.Color(0x4a7c2c),
            Math.random()
          ),
          side: THREE.DoubleSide,
          roughness: 0.9,
        });

        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(x, 0, z);
        blade.rotation.y = Math.random() * Math.PI * 2;
        blade.castShadow = true;
        blade.userData = {
          baseHeight: bladeHeight,
          swayOffset: Math.random() * Math.PI * 2,
        };

        return blade;
      };

      // Add grass patches (adaptive count based on performance)
      const grassGroup = new THREE.Group();
      const initialGrassCount = 800;
      for (let i = 0; i < initialGrassCount; i++) {
        const x = (Math.random() - 0.5) * 35;
        const z = (Math.random() - 0.5) * 35;
        const blade = createGrassBlade(x, z);
        grassGroup.add(blade);
        grassBladesRef.current.push(blade);
      }
      scene.add(grassGroup);

      // Water pond with waves
      const pondX = 6;
      const pondZ = -3;
      const pondRadius = 4;

      // Pond bed
      const pondBedGeo = new THREE.CircleGeometry(pondRadius + 0.5, 48);
      const pondBedMat = new THREE.MeshStandardMaterial({
        color: 0x2a1f0f,
        roughness: 1,
      });
      const pondBed = new THREE.Mesh(pondBedGeo, pondBedMat);
      pondBed.rotation.x = -Math.PI / 2;
      pondBed.position.set(pondX, -0.05, pondZ);
      scene.add(pondBed);

      // Pond edge rocks
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const rockGeo = new THREE.SphereGeometry(
          0.2 + Math.random() * 0.15,
          6,
          6
        );
        const rockMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x555555).lerp(
            new THREE.Color(0x888888),
            Math.random()
          ),
          roughness: 0.95,
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.x = pondX + Math.cos(angle) * (pondRadius + 0.3);
        rock.position.z = pondZ + Math.sin(angle) * (pondRadius + 0.3);
        rock.position.y = Math.random() * 0.1;
        rock.scale.y = 0.5;
        scene.add(rock);
      }

      // Water surface with wave geometry
      const waterGeo = new THREE.CircleGeometry(pondRadius, 64, 64);
      const waterVertices = waterGeo.attributes.position;
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x2090b0,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        metalness: 0.6,
        emissive: 0x103040,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(pondX, 0.06, pondZ);
      water.userData = { originalPositions: waterVertices.array.slice() };
      scene.add(water);

      // Extra lily pads without flowers
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1.5 + Math.random() * 2;
        const padGeo = new THREE.CircleGeometry(
          0.25 + Math.random() * 0.15,
          16
        );
        const padMat = new THREE.MeshStandardMaterial({
          color: 0x2d5a27,
          roughness: 0.7,
          side: THREE.DoubleSide,
        });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(
          pondX + Math.cos(angle) * dist,
          0.07,
          pondZ + Math.sin(angle) * dist
        );
        scene.add(pad);
      }

      // Enhanced Sun with corona
      const sunGeo = new THREE.SphereGeometry(3, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({
        color: 0xffff66,
        emissive: 0xffff00,
        emissiveIntensity: 2,
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.set(30, 20, -30);
      scene.add(sun);
      sunRef.current = sun;

      // Sun glow layers - multiple for depth
      const sunGlow1 = new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffdd44,
          transparent: true,
          opacity: 0.5,
          side: THREE.BackSide,
        })
      );
      sun.add(sunGlow1);

      const sunGlow2 = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffaa33,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide,
        })
      );
      sun.add(sunGlow2);

      const sunGlow3 = new THREE.Mesh(
        new THREE.SphereGeometry(6.5, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff8822,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide,
        })
      );
      sun.add(sunGlow3);

      // Sun corona effect
      const coronaGeo = new THREE.RingGeometry(5.5, 7.5, 64);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      const corona = new THREE.Mesh(coronaGeo, coronaMat);
      corona.rotation.x = Math.PI / 2;
      sun.add(corona);

      // Sunlight
      const sunLight = new THREE.DirectionalLight(0xffffee, 2);
      sunLight.position.copy(sun.position);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -30;
      sunLight.shadow.camera.right = 30;
      sunLight.shadow.camera.top = 30;
      sunLight.shadow.camera.bottom = -30;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);
      sunLightRef.current = sunLight;

      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
      scene.add(ambientLight);

      // Enhanced Moon with detailed surface
      const moonGeo = new THREE.SphereGeometry(2.5, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xf0f8ff,
        emissive: 0xd0e8ff,
        emissiveIntensity: 1.5,
        roughness: 0.9,
        metalness: 0.1,
      });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(-30, 20, -30);
      moon.visible = false;
      scene.add(moon);
      moonRef.current = moon;

      // Moon glow layers
      const moonGlow1 = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xc8e0ff,
          transparent: true,
          opacity: 0.4,
          side: THREE.BackSide,
        })
      );
      moon.add(moonGlow1);

      const moonGlow2 = new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xa0c8ff,
          transparent: true,
          opacity: 0.25,
          side: THREE.BackSide,
        })
      );
      moon.add(moonGlow2);

      const moonGlow3 = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x88b8ff,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide,
        })
      );
      moon.add(moonGlow3);

      // Moon craters with more detail
      for (let i = 0; i < 8; i++) {
        const craterSize = 0.2 + Math.random() * 0.4;
        const craterGeo = new THREE.SphereGeometry(craterSize, 16, 16);
        const craterMat = new THREE.MeshBasicMaterial({
          color: 0xb8c8e0,
          transparent: true,
          opacity: 0.6,
        });
        const crater = new THREE.Mesh(craterGeo, craterMat);
        const angle = (i / 8) * Math.PI * 2;
        const distance = 1.2 + Math.random() * 0.5;
        crater.position.x = Math.cos(angle) * distance;
        crater.position.y = Math.sin(angle) * distance;
        crater.position.z = 0.5 + Math.random() * 0.5;
        moon.add(crater);
      }

      // Moon halo
      const haloGeo = new THREE.RingGeometry(4.5, 5.5, 64);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x88b8ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      moon.add(halo);

      // Moon light
      const moonLight = new THREE.DirectionalLight(0xaabbff, 0.3);
      moonLight.position.copy(moon.position);
      scene.add(moonLight);

      // Flower types for variety
      const flowerTypes = ["rose", "daisy", "tulip", "sunflower", "lily"];

      // Create realistic flowers with variety
      const createRealisticFlower = (
        x,
        z,
        color,
        emotion,
        forceType = null
      ) => {
        const flowerGroup = new THREE.Group();
        const flowerType =
          forceType ||
          flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        const baseColor = new THREE.Color(color);

        // Stem height varies by flower type
        const stemHeight =
          flowerType === "sunflower"
            ? 1.2
            : flowerType === "tulip"
            ? 0.6
            : 0.85;

        // Natural curved stem
        const stemCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.01, stemHeight * 0.3, 0.01),
          new THREE.Vector3(-0.01, stemHeight * 0.65, -0.01),
          new THREE.Vector3(0, stemHeight, 0),
        ]);

        const stemGeo = new THREE.TubeGeometry(stemCurve, 12, 0.015, 6, false);
        const stemMat = new THREE.MeshStandardMaterial({
          color: 0x3a6b1f,
          roughness: 0.9,
        });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.castShadow = true;
        flowerGroup.add(stem);

        // Leaves
        for (let i = 0; i < 2; i++) {
          const leafGeo = new THREE.SphereGeometry(0.08, 6, 6);
          leafGeo.scale(0.3, 1, 0.1);
          const leafMat = new THREE.MeshStandardMaterial({
            color: 0x4a7c2a,
            roughness: 0.8,
            side: THREE.DoubleSide,
          });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.y = stemHeight * 0.3 + i * 0.15;
          leaf.position.x = i % 2 === 0 ? 0.06 : -0.06;
          leaf.rotation.z = ((i % 2 === 0 ? -1 : 1) * Math.PI) / 4;
          flowerGroup.add(leaf);
        }

        // Different petal arrangements by flower type
        if (flowerType === "rose") {
          // Rose - layered petals
          for (let layer = 0; layer < 3; layer++) {
            const petalCount = 5 + layer * 2;
            for (let i = 0; i < petalCount; i++) {
              const angle = (i / petalCount) * Math.PI * 2 + layer * 0.3;
              const petalGeo = new THREE.SphereGeometry(
                0.06 - layer * 0.01,
                6,
                6
              );
              petalGeo.scale(1, 0.2, 0.5);
              const petalMat = new THREE.MeshStandardMaterial({
                color: baseColor
                  .clone()
                  .lerp(new THREE.Color(0xffffff), layer * 0.1),
                roughness: 0.4,
                emissive: baseColor.clone().multiplyScalar(0.1),
              });
              const petal = new THREE.Mesh(petalGeo, petalMat);
              petal.position.y = stemHeight + 0.02 - layer * 0.02;
              petal.position.x = Math.cos(angle) * (0.04 + layer * 0.02);
              petal.position.z = Math.sin(angle) * (0.04 + layer * 0.02);
              petal.rotation.y = angle;
              petal.rotation.x = -Math.PI / 4 - layer * 0.2;
              flowerGroup.add(petal);
            }
          }
        } else if (flowerType === "daisy") {
          // Daisy - many thin petals
          const petalCount = 12;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 6);
            const petalMat = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.6,
            });
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.y = stemHeight;
            petal.position.x = Math.cos(angle) * 0.05;
            petal.position.z = Math.sin(angle) * 0.05;
            petal.rotation.z = Math.PI / 2;
            petal.rotation.y = angle;
            flowerGroup.add(petal);
          }
          // Yellow center
          const centerGeo = new THREE.SphereGeometry(0.06, 12, 12);
          const centerMat = new THREE.MeshStandardMaterial({
            color: 0xffdd00,
            roughness: 0.8,
          });
          const center = new THREE.Mesh(centerGeo, centerMat);
          center.position.y = stemHeight + 0.02;
          flowerGroup.add(center);
        } else if (flowerType === "tulip") {
          // Tulip - cup-shaped petals
          const petalCount = 6;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalGeo = new THREE.SphereGeometry(0.08, 8, 8);
            petalGeo.scale(0.5, 1, 0.3);
            const petalMat = new THREE.MeshStandardMaterial({
              color: baseColor,
              roughness: 0.5,
              emissive: baseColor.clone().multiplyScalar(0.1),
            });
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.y = stemHeight + 0.05;
            petal.position.x = Math.cos(angle) * 0.03;
            petal.position.z = Math.sin(angle) * 0.03;
            petal.rotation.y = angle;
            petal.rotation.x = -0.3;
            flowerGroup.add(petal);
          }
        } else if (flowerType === "sunflower") {
          // Sunflower - large with seeds
          const petalCount = 16;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.15, 6);
            const petalMat = new THREE.MeshStandardMaterial({
              color: 0xffd700,
              roughness: 0.6,
              emissive: 0xffa500,
              emissiveIntensity: 0.2,
            });
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.y = stemHeight;
            petal.position.x = Math.cos(angle) * 0.12;
            petal.position.z = Math.sin(angle) * 0.12;
            petal.rotation.z = Math.PI / 2;
            petal.rotation.y = angle;
            flowerGroup.add(petal);
          }
          // Brown center with seeds
          const centerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.03, 16);
          const centerMat = new THREE.MeshStandardMaterial({
            color: 0x5c4033,
            roughness: 0.9,
          });
          const center = new THREE.Mesh(centerGeo, centerMat);
          center.position.y = stemHeight + 0.01;
          flowerGroup.add(center);
        } else {
          // Lily - elegant curved petals
          const petalCount = 6;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalGeo = new THREE.ConeGeometry(0.04, 0.15, 6);
            const petalMat = new THREE.MeshStandardMaterial({
              color: baseColor,
              roughness: 0.4,
              emissive: baseColor.clone().multiplyScalar(0.15),
            });
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.y = stemHeight;
            petal.position.x = Math.cos(angle) * 0.06;
            petal.position.z = Math.sin(angle) * 0.06;
            petal.rotation.z = Math.PI / 2 + Math.PI / 6;
            petal.rotation.y = angle;
            flowerGroup.add(petal);
          }
          // Stamens
          for (let i = 0; i < 5; i++) {
            const stamenGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 4);
            const stamenMat = new THREE.MeshStandardMaterial({
              color: 0xffdd44,
            });
            const stamen = new THREE.Mesh(stamenGeo, stamenMat);
            const angle = (i / 5) * Math.PI * 2;
            stamen.position.y = stemHeight + 0.04;
            stamen.position.x = Math.cos(angle) * 0.02;
            stamen.position.z = Math.sin(angle) * 0.02;
            flowerGroup.add(stamen);
          }
        }

        flowerGroup.position.x = x;
        flowerGroup.position.z = z;
        flowerGroup.userData = {
          emotion,
          flowerType,
          birthTime: Date.now(),
          swayOffset: Math.random() * Math.PI * 2,
          isNew: false,
          growthScale: 1.0,
          targetScale: 1.0,
          healthState: 1.0,
        };

        scene.add(flowerGroup);
        plantsRef.current.push(flowerGroup);

        return flowerGroup;
      };

      // Create lotus flower for pond
      const createLotus = (x, z) => {
        const lotusGroup = new THREE.Group();

        // Lotus pad (lily pad)
        const padGeo = new THREE.CircleGeometry(0.4, 24);
        const padMat = new THREE.MeshStandardMaterial({
          color: 0x2d5a27,
          roughness: 0.7,
          side: THREE.DoubleSide,
        });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.y = 0.08;
        lotusGroup.add(pad);

        // Lotus petals - pink/white layers
        const colors = [0xffb7c5, 0xffc0cb, 0xffe4e9];
        for (let layer = 0; layer < 3; layer++) {
          const petalCount = 8 + layer * 4;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 + layer * 0.2;
            const petalGeo = new THREE.SphereGeometry(
              0.08 - layer * 0.015,
              8,
              8
            );
            petalGeo.scale(0.4, 1, 0.25);
            const petalMat = new THREE.MeshStandardMaterial({
              color: colors[layer],
              roughness: 0.3,
              emissive: new THREE.Color(colors[layer]).multiplyScalar(0.1),
            });
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.y = 0.15 + layer * 0.03;
            petal.position.x = Math.cos(angle) * (0.08 + layer * 0.04);
            petal.position.z = Math.sin(angle) * (0.08 + layer * 0.04);
            petal.rotation.y = angle;
            petal.rotation.x = -Math.PI / 4 + layer * 0.15;
            lotusGroup.add(petal);
          }
        }

        // Yellow center
        const centerGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const centerMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.6,
          emissive: 0xffaa00,
          emissiveIntensity: 0.3,
        });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 0.2;
        lotusGroup.add(center);

        lotusGroup.position.set(x, 0, z);
        lotusGroup.userData = {
          swayOffset: Math.random() * Math.PI * 2,
          isLotus: true,
        };
        scene.add(lotusGroup);
        plantsRef.current.push(lotusGroup);

        return lotusGroup;
      };

      // Add lotus flowers to pond
      const lotusPositions = [
        { x: pondX - 1.5, z: pondZ + 1 },
        { x: pondX + 1.2, z: pondZ - 0.8 },
        { x: pondX + 0.3, z: pondZ + 1.8 },
        { x: pondX - 0.8, z: pondZ - 1.5 },
      ];
      lotusPositions.forEach((pos) => createLotus(pos.x, pos.z));

      // Create realistic trees
      const createRealisticTree = (x, z, scale = 1) => {
        const treeGroup = new THREE.Group();

        // Trunk with texture
        const trunkGeo = new THREE.CylinderGeometry(
          0.15 * scale,
          0.25 * scale,
          2.5 * scale,
          12
        );
        const trunkMat = new THREE.MeshStandardMaterial({
          color: 0x3d2817,
          roughness: 0.95,
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25 * scale;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Multiple foliage layers for realism
        const foliageLayers = 3;
        for (let i = 0; i < foliageLayers; i++) {
          const layerSize = (1.8 - i * 0.3) * scale;
          const foliageGeo = new THREE.SphereGeometry(layerSize, 16, 16);
          const foliageMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x1a5d0a).lerp(
              new THREE.Color(0x2d7a1a),
              Math.random() * 0.5
            ),
            roughness: 0.9,
          });
          const foliage = new THREE.Mesh(foliageGeo, foliageMat);
          foliage.position.y = (2.5 + i * 0.6) * scale;
          foliage.castShadow = true;
          foliage.receiveShadow = true;
          treeGroup.add(foliage);
        }

        treeGroup.position.set(x, 0, z);
        treeGroup.userData = { swayOffset: Math.random() * Math.PI * 2 };
        scene.add(treeGroup);
        treesRef.current.push(treeGroup);

        return treeGroup;
      };

      // Initial flowers
      const initialColors = [0xff6b9d, 0x9d6bff, 0x6b9dff, 0xffa500, 0xff69b4];
      for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        const color =
          initialColors[Math.floor(Math.random() * initialColors.length)];
        createRealisticFlower(x, z, color, "calm");
      }

      // Plant trees
      for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 35;
        const z = (Math.random() - 0.5) * 35;
        const scale = 0.8 + Math.random() * 0.6;
        createRealisticTree(x, z, scale);
      }

      // Rain particle system (optimized)
      const rainGeo = new THREE.BufferGeometry();
      const rainCount = 1500;
      const rainPositions = new Float32Array(rainCount * 3);

      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 60;
        rainPositions[i * 3 + 1] = Math.random() * 40;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }

      rainGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(rainPositions, 3)
      );
      const rainMat = new THREE.PointsMaterial({
        color: 0xaaccff,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      const rain = new THREE.Points(rainGeo, rainMat);
      rain.visible = false;
      scene.add(rain);
      rainRef.current = rain;

      // Create clouds
      const createCloud = (x, y, z) => {
        const cloudGroup = new THREE.Group();

        for (let i = 0; i < 5; i++) {
          const cloudGeo = new THREE.SphereGeometry(
            1 + Math.random() * 0.5,
            8,
            8
          );
          const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            roughness: 1,
          });
          const cloudPart = new THREE.Mesh(cloudGeo, cloudMat);
          cloudPart.position.x = (Math.random() - 0.5) * 3;
          cloudPart.position.y = (Math.random() - 0.5) * 1;
          cloudPart.position.z = (Math.random() - 0.5) * 2;
          cloudGroup.add(cloudPart);
        }

        cloudGroup.position.set(x, y, z);
        cloudGroup.userData = { speed: 0.01 + Math.random() * 0.01 };
        scene.add(cloudGroup);
        cloudsRef.current.push(cloudGroup);

        return cloudGroup;
      };

      // Create initial clouds (optimized)
      for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 80;
        const y = 15 + Math.random() * 10;
        const z = (Math.random() - 0.5) * 80;
        createCloud(x, y, z);
      }

      // Create stars
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 800;
      const starPositions = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 85;

        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = Math.max(20, radius * Math.cos(phi));
        starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        starSizes[i] = Math.random() * 2 + 0.5;
      }

      starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3)
      );
      starGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(starSizes, 1)
      );

      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      starsRef.current = stars;

      // Lightning flash
      const lightningLight = new THREE.PointLight(0xffffff, 0, 100);
      lightningLight.position.set(0, 30, 0);
      scene.add(lightningLight);

      // Store current camera distance
      let cameraDistance = 10;

      // Camera controls - zoom and 360 rotation
      const handleWheel = (e) => {
        e.preventDefault();
        const zoomSpeed = 0.02;
        cameraDistance = Math.max(
          5,
          Math.min(20, cameraDistance + e.deltaY * zoomSpeed)
        );

        // Update camera position based on angle and distance
        const angle = cameraAngleRef.current;
        camera.position.x = Math.sin(angle) * cameraDistance;
        camera.position.z = Math.cos(angle) * cameraDistance;
        camera.position.y = 3 + (cameraDistance - 10) * 0.2;
        camera.lookAt(0, 1, 0);
      };

      const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        lastMouseXRef.current = e.clientX;
      };

      const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;

        const deltaX = e.clientX - lastMouseXRef.current;
        cameraAngleRef.current += deltaX * 0.005;

        // Update camera position
        camera.position.x = Math.sin(cameraAngleRef.current) * cameraDistance;
        camera.position.z = Math.cos(cameraAngleRef.current) * cameraDistance;
        camera.lookAt(0, 1, 0);

        lastMouseXRef.current = e.clientX;
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
      };

      const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
          isDraggingRef.current = true;
          lastMouseXRef.current = e.touches[0].clientX;
        }
      };

      const handleTouchMove = (e) => {
        if (!isDraggingRef.current || e.touches.length !== 1) return;

        const deltaX = e.touches[0].clientX - lastMouseXRef.current;
        cameraAngleRef.current += deltaX * 0.005;

        camera.position.x = Math.sin(cameraAngleRef.current) * cameraDistance;
        camera.position.z = Math.cos(cameraAngleRef.current) * cameraDistance;
        camera.lookAt(0, 1, 0);

        lastMouseXRef.current = e.touches[0].clientX;
      };

      const handleTouchEnd = () => {
        isDraggingRef.current = false;
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);

      // Animation loop with adaptive performance
      let lastFrameTime = Date.now();
      let frameCount = 0;
      let lastFPSCheck = Date.now();
      let qualityLevel = 1;

      const animate = () => {
        requestAnimationFrame(animate);

        const now = Date.now();
        const elapsed = now - lastFrameTime;
        lastFrameTime = now;

        // FPS tracking and adaptive quality
        frameCount++;
        if (now - lastFPSCheck > 1000) {
          const currentFPS = frameCount;
          frameCount = 0;
          lastFPSCheck = now;

          // Adaptive quality adjustment using local variable
          if (currentFPS < 25) {
            qualityLevel = 0.25; // Low quality
          } else if (currentFPS < 35) {
            qualityLevel = 0.5; // Medium quality
          } else {
            qualityLevel = 1; // High quality
          }
        }

        timeRef.current += 0.016;
        dayNightTimeRef.current += 0.016;

        // Update emotional state over time
        const currentTime = Date.now();
        if (currentTime - emotionalStateRef.current.lastUpdate > 2000) {
          emotionalStateRef.current.lastUpdate = currentTime;

          // Accumulate positive/negative energy
          if (emotion === "joy" || emotion === "calm") {
            emotionalStateRef.current.positive = Math.min(
              10,
              emotionalStateRef.current.positive + 0.5
            );
            emotionalStateRef.current.negative = Math.max(
              0,
              emotionalStateRef.current.negative - 0.3
            );
          } else if (emotion === "anger" || emotion === "loneliness") {
            emotionalStateRef.current.negative = Math.min(
              10,
              emotionalStateRef.current.negative + 0.5
            );
            emotionalStateRef.current.positive = Math.max(
              0,
              emotionalStateRef.current.positive - 0.3
            );
          } else {
            // Neutral decay
            emotionalStateRef.current.positive = Math.max(
              0,
              emotionalStateRef.current.positive - 0.1
            );
            emotionalStateRef.current.negative = Math.max(
              0,
              emotionalStateRef.current.negative - 0.1
            );
          }
        }

        // Automatic day/night cycle (90 seconds = 1:30)
        const cycleDuration = 90;
        const cycleProgress =
          (dayNightTimeRef.current % cycleDuration) / cycleDuration;
        const angle = cycleProgress * Math.PI * 2 - Math.PI / 2;

        // Sun position following circular path
        const sunX = Math.cos(angle) * 40;
        const sunY = Math.sin(angle) * 40;
        const sunZ = -30;

        sunRef.current.position.set(sunX, Math.max(sunY, -10), sunZ);
        sunLightRef.current.position.copy(sunRef.current.position);

        // Moon opposite to sun
        moonRef.current.position.set(-sunX, Math.max(-sunY, -10), sunZ);
        moonLight.position.copy(moonRef.current.position);

        // Sun/Moon visibility
        sunRef.current.visible = sunY > 0;
        moonRef.current.visible = sunY <= 0;

        // Stars visibility and twinkle (adaptive)
        if (sunY <= -5) {
          const nightProgress = Math.min(1, Math.abs(sunY + 5) / 10);
          starsRef.current.material.opacity = nightProgress * 0.9;

          // Twinkle effect (skip if low quality)
          if (qualityLevel >= 0.5) {
            const sizes = starsRef.current.geometry.attributes.size.array;
            const twinkleStep = qualityLevel === 1 ? 1 : 3;
            for (let i = 0; i < sizes.length; i += twinkleStep) {
              const twinkle = Math.sin(timeRef.current * 2 + i) * 0.3 + 0.7;
              sizes[i] = (0.5 + Math.random() * 2) * twinkle;
            }
            starsRef.current.geometry.attributes.size.needsUpdate = true;
          }
        } else {
          starsRef.current.material.opacity = 0;
        }

        // Sky color based on cycle
        if (cycleProgress < 0.25) {
          // Dawn
          const t = cycleProgress / 0.25;
          sky.material.uniforms.topColor.value.lerpColors(
            new THREE.Color(0x000033),
            new THREE.Color(0xff6b3d),
            t
          );
          sky.material.uniforms.bottomColor.value.lerpColors(
            new THREE.Color(0x1a0055),
            new THREE.Color(0xffcc88),
            t
          );
          sunLightRef.current.intensity = t * 1.5;
          ambientLight.intensity = 0.3 + t * 0.5;
        } else if (cycleProgress < 0.5) {
          // Day
          const t = (cycleProgress - 0.25) / 0.25;
          sky.material.uniforms.topColor.value.lerpColors(
            new THREE.Color(0xff6b3d),
            new THREE.Color(0x0077ff),
            t
          );
          sky.material.uniforms.bottomColor.value.lerpColors(
            new THREE.Color(0xffcc88),
            new THREE.Color(0x88ccff),
            t
          );
          sunLightRef.current.intensity = 1.5 + t * 0.5;
          ambientLight.intensity = 0.8 + t * 0.4;
        } else if (cycleProgress < 0.75) {
          // Dusk
          const t = (cycleProgress - 0.5) / 0.25;
          sky.material.uniforms.topColor.value.lerpColors(
            new THREE.Color(0x0077ff),
            new THREE.Color(0xff4500),
            t
          );
          sky.material.uniforms.bottomColor.value.lerpColors(
            new THREE.Color(0x88ccff),
            new THREE.Color(0xff8c00),
            t
          );
          sunLightRef.current.intensity = 2 - t * 1.2;
          ambientLight.intensity = 1.2 - t * 0.7;
        } else {
          // Night
          const t = (cycleProgress - 0.75) / 0.25;
          sky.material.uniforms.topColor.value.lerpColors(
            new THREE.Color(0xff4500),
            new THREE.Color(0x000033),
            t
          );
          sky.material.uniforms.bottomColor.value.lerpColors(
            new THREE.Color(0xff8c00),
            new THREE.Color(0x1a0055),
            t
          );
          sunLightRef.current.intensity = 0.8 - t * 0.7;
          ambientLight.intensity = 0.5 - t * 0.2;
          moonLight.intensity = t * 0.5;
        }

        // Wind simulation with manual control
        windRef.current.x =
          Math.sin(timeRef.current * 0.5) * 0.02 * windIntensity;
        windRef.current.z =
          Math.cos(timeRef.current * 0.3) * 0.02 * windIntensity;

        // Animate grass with wind (adaptive throttling)
        const grassSkip = qualityLevel === 1 ? 3 : qualityLevel === 0.5 ? 5 : 8;
        grassBladesRef.current.forEach((blade, i) => {
          if (i % grassSkip === 0) {
            const sway =
              Math.sin(timeRef.current * 2 + blade.userData.swayOffset) *
              windRef.current.x *
              10;
            const bend =
              Math.cos(timeRef.current * 2 + blade.userData.swayOffset) *
              windRef.current.z *
              10;
            blade.rotation.x = bend;
            blade.rotation.z = sway;
          }
        });

        // Animate flowers with wind and growth cycle
        plantsRef.current.forEach((flower) => {
          const sway =
            Math.sin(timeRef.current * 1.5 + flower.userData.swayOffset) *
            0.1 *
            windIntensity;
          const tilt =
            Math.cos(timeRef.current * 1.5 + flower.userData.swayOffset) *
            0.08 *
            windIntensity;
          flower.rotation.x = tilt + windRef.current.z * 2;
          flower.rotation.z = sway + windRef.current.x * 2;

          // Glow effect for new flowers
          if (flower.userData.isNew) {
            const age = Date.now() - flower.userData.birthTime;
            if (age < 5000) {
              const glowIntensity = Math.sin(timeRef.current * 5) * 0.5 + 0.5;
              flower.scale.setScalar(1 + glowIntensity * 0.3);
            } else {
              flower.userData.isNew = false;
              flower.userData.growthScale = 1.0;
            }
          } else {
            // Growth/wilt cycle based on emotional state
            const positiveEnergy = emotionalStateRef.current.positive;
            const negativeEnergy = emotionalStateRef.current.negative;

            // Calculate target scale
            if (positiveEnergy > negativeEnergy && positiveEnergy > 3) {
              // Positive state - grow
              flower.userData.targetScale =
                1.0 + Math.min(0.3, positiveEnergy * 0.03);
              flower.userData.healthState = Math.min(
                1.0,
                flower.userData.healthState + 0.001
              );
            } else if (negativeEnergy > positiveEnergy && negativeEnergy > 3) {
              // Negative state - wilt
              flower.userData.targetScale =
                1.0 - Math.min(0.25, negativeEnergy * 0.025);
              flower.userData.healthState = Math.max(
                0.6,
                flower.userData.healthState - 0.001
              );
            } else {
              // Neutral - return to normal
              flower.userData.targetScale = 1.0;
              flower.userData.healthState = Math.max(
                0.8,
                Math.min(
                  1.0,
                  flower.userData.healthState +
                    (flower.userData.healthState < 1.0 ? 0.0005 : -0.0005)
                )
              );
            }

            // Smooth transition to target scale
            flower.userData.growthScale +=
              (flower.userData.targetScale - flower.userData.growthScale) *
              0.01;
            flower.scale.setScalar(flower.userData.growthScale);

            // Visual health effects - adjust color/opacity
            flower.children.forEach((child, index) => {
              if (child.material && index > 0) {
                // Skip stem
                const health = flower.userData.healthState;
                if (health < 0.9) {
                  // Darken and desaturate when unhealthy
                  child.material.opacity = health;
                  if (!child.material.transparent) {
                    child.material.transparent = true;
                  }
                } else {
                  child.material.opacity = 1.0;
                }
              }
            });
          }
        });

        // Animate trees with wind
        treesRef.current.forEach((tree) => {
          const sway =
            Math.sin(timeRef.current + tree.userData.swayOffset) *
            0.03 *
            windIntensity;
          tree.rotation.z = sway + windRef.current.x;
        });

        // Rain based on weather
        if (weather === "rainy" || weather === "storm") {
          rainRef.current.visible = true;
          const positions = rainRef.current.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= weather === "storm" ? 0.8 : 0.5;
            if (positions[i + 1] < 0) {
              positions[i + 1] = 40;
            }
          }
          rainRef.current.geometry.attributes.position.needsUpdate = true;
        } else {
          rainRef.current.visible = false;
        }

        // Lightning on sad emotions (loneliness, anger)
        if (
          (emotion === "loneliness" || emotion === "anger") &&
          !lightningRef.current.active
        ) {
          if (Math.random() < 0.015) {
            lightningRef.current.active = true;
            lightningRef.current.timer = 0;
          }
        }

        // Manual lightning trigger
        if (triggerLightning && !lightningRef.current.active) {
          lightningRef.current.active = true;
          lightningRef.current.timer = 0;
        }

        if (lightningRef.current.active) {
          lightningRef.current.timer += 0.016;
          if (lightningRef.current.timer < 0.1) {
            // Flash
            lightningLight.intensity = 100;
            renderer.setClearColor(0xffffff, 0.5);
          } else if (lightningRef.current.timer < 2.5) {
            // Fade out over 2.5 seconds
            const fadeProgress = (lightningRef.current.timer - 0.1) / 2.4;
            lightningLight.intensity = 100 * (1 - fadeProgress);
            renderer.setClearColor(0x000000, 0);
          } else {
            lightningLight.intensity = 0;
            renderer.setClearColor(0x000000, 0);
            lightningRef.current.active = false;
          }
        }

        // Move clouds
        cloudsRef.current.forEach((cloud) => {
          cloud.position.x += cloud.userData.speed;
          if (cloud.position.x > 50) {
            cloud.position.x = -50;
          }
        });

        // Animate water with waves
        water.material.emissiveIntensity =
          0.2 + Math.sin(timeRef.current * 2) * 0.1;

        // Create wave effect on pond
        const positions = water.geometry.attributes.position;
        const original = water.userData.originalPositions;
        for (let i = 0; i < positions.count; i++) {
          const x = original[i * 3];
          const y = original[i * 3 + 1];
          const dist = Math.sqrt(x * x + y * y);
          const wave =
            Math.sin(dist * 3 - timeRef.current * 2) * 0.03 +
            Math.sin(dist * 5 + timeRef.current * 1.5) * 0.02;
          positions.setZ(i, wave);
        }
        positions.needsUpdate = true;

        // Animate lotus flowers gently bobbing
        plantsRef.current.forEach((plant) => {
          if (plant.userData.isLotus) {
            plant.position.y =
              Math.sin(timeRef.current * 1.5 + plant.userData.swayOffset) *
                0.02 +
              0.02;
            plant.rotation.z =
              Math.sin(timeRef.current + plant.userData.swayOffset) * 0.02;
          }
        });

        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      // Expose flower creation
      sceneRef.current.createFlower = createRealisticFlower;

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("resize", handleResize);
        containerRef.current?.removeChild(renderer.domElement);
        renderer.dispose();
      };
    }, [
      emotion,
      intensity,
      timeOfDay,
      weather,
      windIntensity,
      triggerLightning,
    ]);

    return <div ref={containerRef} className="absolute inset-0" />;
  }
);

GardenScene.displayName = "GardenScene";
export default GardenScene;
