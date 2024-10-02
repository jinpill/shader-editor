import * as THREE from "three";

export const isOrthographicCamera = (camera: any): camera is THREE.OrthographicCamera => {
  return camera instanceof THREE.OrthographicCamera;
};
