precision mediump float;

out vec4 worldPosition;

void main() {
  worldPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
