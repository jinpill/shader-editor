import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/Addons.js";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { useStore } from "@/utils/useStore";
import * as utils from "@/utils/utils";

import vertexShader from "@/shaders/vertex.glsl";
import fragmentShader from "@/shaders/fragment.glsl";

import style from "@/styles/Home.module.css";

const VERTEX_SHADER_KEY = "glsl-test__vertex-shader";
const FRAGMENT_SHADER_KEY = "glsl-test__fragment-shader";
const ROTATION = new THREE.Euler(
  THREE.MathUtils.degToRad(0),
  THREE.MathUtils.degToRad(0),
  THREE.MathUtils.degToRad(0)
);

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vertexRef = useRef<HTMLTextAreaElement>(null);
  const fragmentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const store = useStore();
  const [vertex, setVertex] = useState("");
  const [fragment, setFragment] = useState("");
  const mesh = useMemo(() => new THREE.Mesh(), []);

  const [point, setPoint] = useState(new THREE.Vector3());
  const [isOver, setIsOver] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const handlePointerMove = (event: React.PointerEvent) => {
    const $canvas = canvasRef.current;
    if (!$canvas || !mesh) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / $canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / $canvas.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, store.camera);

    const intersections = raycaster.intersectObject(mesh);
    if (intersections.length === 0) {
      setIsOver(false);
      return;
    }

    const intersection = intersections[0];
    setPoint(intersection.point);
    setIsOver(true);
  };

  useEffect(() => {
    const vertex = window.localStorage.getItem(VERTEX_SHADER_KEY);
    const fragment = window.localStorage.getItem(FRAGMENT_SHADER_KEY);
    setVertex(vertex || vertexShader);
    setFragment(fragment || fragmentShader);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const $vertex = vertexRef.current;
      const $fragment = fragmentRef.current;
      if (!$vertex || !$fragment) return;

      if (event.key.toLowerCase() === "s" && event.metaKey) {
        event.preventDefault();
        window.localStorage.setItem(VERTEX_SHADER_KEY, $vertex.value);
        window.localStorage.setItem(FRAGMENT_SHADER_KEY, $fragment.value);
        setIsChanged(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);

    geometry.setAttribute("position", sphereGeometry.attributes.position);
    geometry.setIndex(sphereGeometry.index);

    sphereGeometry.dispose();
    mesh.geometry = geometry;
  }, [mesh]);

  useEffect(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        point: { value: new THREE.Vector3() },
        isOver: { value: false },
      },
    });
    mesh.material = material;

    return () => {
      material.dispose();
    };
  }, [vertex, fragment, mesh]);

  useEffect(() => {
    if (mesh.material instanceof THREE.ShaderMaterial) {
      mesh.material.uniforms.point.value = point;
      mesh.material.uniforms.isOver.value = isOver;
      // mesh.material.needsUpdate = true;
    }
  }, [mesh, point, isOver]);

  return (
    <div className={style.root}>
      <Canvas
        ref={canvasRef}
        gl={{
          antialias: true,
        }}
        orthographic
        camera={{
          position: [0, -10, 0],
          zoom: 50,
        }}
        onPointerMove={handlePointerMove}
      >
        <Effect />
        <OrbitControls enableDamping={false} />
        {mesh && <primitive object={mesh} rotation={ROTATION} />}
      </Canvas>

      {isChanged && <div className={style.changeIcon} />}

      <div className={style.fields}>
        <div className={style.field}>
          <div className={style.label}>Vertex Shader</div>
          <textarea
            ref={vertexRef}
            value={vertex}
            onChange={(e) => {
              setIsChanged(true);
              setVertex(e.target.value);
            }}
          />
        </div>
        <div className={style.field}>
          <div className={style.label}>Fragment Shader</div>
          <textarea
            ref={fragmentRef}
            value={fragment}
            onChange={(e) => {
              setIsChanged(true);
              setFragment(e.target.value);
            }}
          />
        </div>

        <div className={style.buttons}>
          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            STL 파일 불러오기
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className={style.fileInput}
            onChange={(event) => {
              const $input = event.target;
              const file = $input.files?.[0];
              if (!file) return;

              const loader = new STLLoader();
              loader.load(URL.createObjectURL(file), (geometry) => {
                mesh.geometry.dispose();
                mesh.geometry = geometry;

                const box = new THREE.Box3();
                box.setFromObject(mesh, true);
                box.getCenter(mesh.position);
                mesh.position.multiplyScalar(-1);
              });

              $input.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Effect = () => {
  const { setCamera } = useStore();
  const three = useThree();

  useEffect(() => {
    if (!utils.isOrthographicCamera(three.camera)) return;
    setCamera(three.camera);
  }, [three.camera, setCamera]);

  useEffect(() => {
    type Background = typeof three.scene.background;
    three.scene.background = new THREE.Color(0xffeedd) as unknown as Background;
  }, [three]);

  return null;
};

export default Home;
