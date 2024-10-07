precision mediump float;

in vec4 worldPosition;
uniform vec3 point;
uniform bool isOver;

void main() {
  if (isOver && abs(worldPosition.z - point.z) < 0.01) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // red
  } else {
    gl_FragColor = vec4(0.9, 0.9, 0.9, 1.0); // blue
  }
}
