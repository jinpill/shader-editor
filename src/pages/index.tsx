import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { useStore } from "@/utils/useStore";
import * as utils from "@/utils/utils";

import vertexShader from "@/shaders/vertex.glsl";
import fragmentShader from "@/shaders/fragment.glsl";

const Home = () => {
  const store = useStore();

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState<THREE.ShaderMaterial | null>(null);
  const mesh = useMemo(() => {
    if (!geometry || !material) return null;
    return new THREE.Mesh(geometry, material);
  }, [geometry, material]);

  const [point, setPoint] = useState(new THREE.Vector3());
  const [isOver, setIsOver] = useState(false);

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!mesh) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
    const geometry = new THREE.BufferGeometry();
    const sphereGeometry = new THREE.SphereGeometry(5, 256, 256);

    geometry.setAttribute("position", sphereGeometry.attributes.position);
    geometry.setIndex(sphereGeometry.index);

    sphereGeometry.dispose();
    setGeometry(geometry);
  }, []);

  useEffect(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        point: { value: new THREE.Vector3() },
        isOver: { value: false },
      },
    });
    setMaterial(material);
  }, []);

  useEffect(() => {
    if (!material) return;
    material.uniforms.point.value = point;
    material.uniforms.isOver.value = isOver;
  }, [material, point, isOver]);

  return (
    <>
      <Canvas
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
        {mesh && (
          <>
            <Effect mesh={mesh} />
            <OrbitControls enableDamping={false} />
            <primitive object={mesh} position={[0, 0, 0]} />
          </>
        )}
      </Canvas>
    </>
  );
};

type EffectProps = {
  mesh: THREE.Mesh;
};

const Effect = (props: EffectProps) => {
  const { setCamera } = useStore();

  const three = useThree();

  useEffect(() => {
    if (!utils.isOrthographicCamera(three.camera)) return;
    setCamera(three.camera);
  }, [three.camera, setCamera]);

  useFrame(() => {
    if (true) return;
    console.log(props);
    // props.mesh.position.z += 0.01;
  });

  return null;
};

export default Home;
