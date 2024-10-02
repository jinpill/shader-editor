import * as THREE from "three";
import { create } from "zustand";

type Store = {
  camera: THREE.OrthographicCamera;
  getCamera: () => THREE.OrthographicCamera;
  setCamera: (camera: THREE.OrthographicCamera) => void;
};

export const useStore = create<Store>((set, get) => ({
  camera: new THREE.OrthographicCamera(),
  getCamera: () => get().camera,
  setCamera: (camera) => set({ camera }),
}));
