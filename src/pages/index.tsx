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

const ROTATION = new THREE.Euler(
  THREE.MathUtils.degToRad(0),
  THREE.MathUtils.degToRad(0),
  THREE.MathUtils.degToRad(0)
);

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useStore();
  const mesh = useMemo(() => new THREE.Mesh(), []);

  const [useClipping, setUseClipping] = useState(false);
  const [useContour, setUseContour] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [isOnBottom, setIsOnBottom] = useState(true);

  const [modelColorText, setModelColorText] = useState("CCCCCC");
  const [incompleteModelColorText, setIncompleteModelColorText] = useState("F79E3A");
  const [selectedModelColorText, setSelectedModelColorText] = useState("00BFFF");
  const [incompleteSelectedModelColorText, setIncompleteSelectedModelColorText] =
    useState("FF4214");
  const [bottomColorText, setBottomColorText] = useState("00FF7F");
  const [contourColorText, setContourColorText] = useState("FF3333");
  const [incompleteModelContourColorText, setIncompleteModelContourColorText] = useState("FFFFFF");
  const [outsideColorText, setOutsideColorText] = useState("FF3333");

  const [modelColor, setModelColor] = useState(new THREE.Color());
  const [incompleteModelColor, setIncompleteModelColor] = useState(new THREE.Color());
  const [selectedModelColor, setSelectedModelColor] = useState(new THREE.Color());
  const [incompleteSelectedModelColor, setIncompleteSelectedModelColor] = useState(
    new THREE.Color()
  );
  const [bottomColor, setBottomColor] = useState(new THREE.Color());
  const [contourColor, setContourColor] = useState(new THREE.Color());
  const [incompleteModelContourColor, setIncompleteModelContourColor] = useState(new THREE.Color());
  const [outsideColor, setOutsideColor] = useState(new THREE.Color());

  const [castingPoint, setCastingPoint] = useState(new THREE.Vector3());
  const [isPointerOver, setIsPointerOver] = useState(false);

  useEffect(() => {
    setModelColor(new THREE.Color(`#${modelColorText}`));
  }, [modelColorText]);
  useEffect(() => {
    setIncompleteModelColor(new THREE.Color(`#${incompleteModelColorText}`));
  }, [incompleteModelColorText]);
  useEffect(() => {
    setSelectedModelColor(new THREE.Color(`#${selectedModelColorText}`));
  }, [selectedModelColorText]);
  useEffect(() => {
    setIncompleteSelectedModelColor(new THREE.Color(`#${incompleteSelectedModelColorText}`));
  }, [incompleteSelectedModelColorText]);
  useEffect(() => {
    setBottomColor(new THREE.Color(`#${bottomColorText}`));
  }, [bottomColorText]);
  useEffect(() => {
    setContourColor(new THREE.Color(`#${contourColorText}`));
  }, [contourColorText]);
  useEffect(() => {
    setIncompleteModelContourColor(new THREE.Color(`#${incompleteModelContourColorText}`));
  }, [incompleteModelContourColorText]);
  useEffect(() => {
    setOutsideColor(new THREE.Color(`#${outsideColorText}`));
  }, [outsideColorText]);

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
      setIsPointerOver(false);
      return;
    }

    const intersection = intersections[0];
    setCastingPoint(intersection.point);
    setIsPointerOver(true);
  };

  useEffect(() => {
    const box = new THREE.Box3();
    box.setFromObject(mesh, true);
    const size = box.getSize(new THREE.Vector3());

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        clippingHeight: { value: 0 },
        useClipping: { value: false },
        castingPoint: { value: new THREE.Vector3() },
        useContour: { value: true },
        isSelected: { value: false },
        isPointerOver: { value: false },
        isIncomplete: { value: false },
        layerThickness: { value: 0.1 },
        isOnBottom: { value: true },
        opacity: { value: 1 },
        buildSize: { value: new THREE.Vector3(100, 100, 100) },
        bottom: { value: -size.z / 2 },
        modelColor: { value: new THREE.Color() },
        incompleteModelColor: { value: new THREE.Color() },
        selectedModelColor: { value: new THREE.Color() },
        incompleteSelectedModelColor: { value: new THREE.Color() },
        bottomColor: { value: new THREE.Color() },
        contourColor: { value: new THREE.Color() },
        incompleteModelContourColor: { value: new THREE.Color() },
        outsideColor: { value: new THREE.Color() },
      },
    });
    mesh.material = material;

    return () => {
      material.dispose();
    };
  }, [mesh]);

  useEffect(() => {
    if (mesh.material instanceof THREE.ShaderMaterial) {
      const { uniforms } = mesh.material;
      uniforms.castingPoint.value = castingPoint;
      uniforms.isPointerOver.value = isPointerOver;
    }
  }, [mesh, castingPoint, isPointerOver]);

  useEffect(() => {
    if (mesh.material instanceof THREE.ShaderMaterial) {
      const { uniforms } = mesh.material;
      uniforms.useClipping.value = useClipping;
      uniforms.useContour.value = useContour;
      uniforms.isSelected.value = isSelected;
      uniforms.isIncomplete.value = isIncomplete;
      uniforms.isOnBottom.value = isOnBottom;
    }
  }, [mesh, useClipping, useContour, isSelected, isIncomplete, isOnBottom]);

  useEffect(() => {
    if (mesh.material instanceof THREE.ShaderMaterial) {
      const { uniforms } = mesh.material;
      uniforms.modelColor.value = modelColor;
      uniforms.incompleteModelColor.value = incompleteModelColor;
      uniforms.selectedModelColor.value = selectedModelColor;
      uniforms.incompleteSelectedModelColor.value = incompleteSelectedModelColor;
      uniforms.bottomColor.value = bottomColor;
      uniforms.contourColor.value = contourColor;
      uniforms.incompleteModelContourColor.value = incompleteModelContourColor;
      uniforms.outsideColor.value = outsideColor;
    }
  }, [
    mesh,
    modelColor,
    incompleteModelColor,
    selectedModelColor,
    incompleteSelectedModelColor,
    bottomColor,
    contourColor,
    incompleteModelContourColor,
    outsideColor,
  ]);

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      const loader = new STLLoader();
      loader.load(url, (geometry) => {
        mesh.geometry.dispose();
        mesh.geometry = geometry;

        const box = new THREE.Box3();
        box.setFromObject(mesh, true);
        box.getCenter(mesh.position);
        mesh.position.multiplyScalar(-1);

        const size = box.getSize(new THREE.Vector3());
        if (mesh.material instanceof THREE.ShaderMaterial) {
          mesh.material.uniforms.bottom.value = -size.z / 2;
        }
      });
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [mesh]);

  return (
    <div className={style.root}>
      <Canvas
        ref={canvasRef}
        gl={{
          antialias: true,
        }}
        orthographic
        camera={{
          position: [0, -100, 0],
          zoom: 15,
          near: -100,
          up: [0, 0, 1],
        }}
        onPointerMove={handlePointerMove}
      >
        <Effect />
        <OrbitControls enableDamping={false} />
        {mesh && <primitive object={mesh} rotation={ROTATION} />}
      </Canvas>

      <div className={style.fields}>
        <div className={style.group}>
          <Checkbox label="Use clipping" checked={useClipping} onChange={setUseClipping} />
          <Checkbox label="Use contour" checked={useContour} onChange={setUseContour} />
          <Checkbox label="Selected" checked={isSelected} onChange={setIsSelected} />
          <Checkbox label="Incomplete" checked={isIncomplete} onChange={setIsIncomplete} />
          <Checkbox label="On bottom" checked={isOnBottom} onChange={setIsOnBottom} />
        </div>

        <div className={style.group}>
          <ColorInput label="Model color" value={modelColorText} onChange={setModelColorText} />
          <ColorInput
            label="Incomplete model color"
            value={incompleteModelColorText}
            onChange={setIncompleteModelColorText}
          />
          <ColorInput
            label="Selected model color"
            value={selectedModelColorText}
            onChange={setSelectedModelColorText}
          />
          <ColorInput
            label="Incomplete selected model color"
            value={incompleteSelectedModelColorText}
            onChange={setIncompleteSelectedModelColorText}
          />
          <ColorInput label="Bottom color" value={bottomColorText} onChange={setBottomColorText} />
          <ColorInput
            label="Contour color"
            value={contourColorText}
            onChange={setContourColorText}
          />
          <ColorInput
            label="Incomplete model contour color"
            value={incompleteModelContourColorText}
            onChange={setIncompleteModelContourColorText}
          />
          <ColorInput
            label="Outside color"
            value={outsideColorText}
            onChange={setOutsideColorText}
          />
        </div>
      </div>
    </div>
  );
};

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox = (props: CheckboxProps) => {
  return (
    <label className={style.label}>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      {props.label}
    </label>
  );
};

type ColorInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const ColorInput = (props: ColorInputProps) => {
  return (
    <label className={style.label}>
      <div>{props.label}</div>
      <input type="text" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </label>
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
