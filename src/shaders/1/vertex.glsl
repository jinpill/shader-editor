precision mediump float;

out vec4 worldPosition;
out vec4 viewWorldPosition;

void main() {
  worldPosition = modelMatrix * vec4(position, 1.0);
  viewWorldPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewWorldPosition;
}
