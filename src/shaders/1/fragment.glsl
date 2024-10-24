precision mediump float;

in vec4 worldPosition;
in vec4 viewWorldPosition;

uniform vec3 point;
uniform bool isOver;

vec3 ambientReflection;
vec3 diffuseFactor;
vec3 specularReflection;

void phongLightCalc(in vec3 reflectedNormal) {
  // Get the normal data
  vec3 faceNormal = reflectedNormal.xyz;
  vec3 viewNormal = vec3(0.0, 0.0, -1.0);

  // Calculate ambient reflection
  vec3 directLightColor = vec3(1.0, 1.0, 1.0);
  ambientReflection = vec3(0.1);

  // Calculate diffuse reflection
  float maxCosTheta = max(reflectedNormal.z, 0.0);
  diffuseFactor = directLightColor * maxCosTheta * vec3(0.8);

  // Calculate specular reflection
  float shininess = 16.0;
  float maxCosPi = reflectedNormal.z * reflectedNormal.z;
  specularReflection = directLightColor * pow(maxCosPi, shininess) * vec3(0.2);
}

vec3 phongColorCalc(float r, float g, float b) {
  vec3 diffuseColor = vec3(r, g, b);
  vec3 diffuseReflection;

  // Calculate diffuse reflection
  diffuseReflection = diffuseColor * diffuseFactor;

  // Return total reflection
  return ambientReflection + diffuseReflection + specularReflection;
}

vec3 normalCalc() {
  // view position
  vec3 vp = -viewWorldPosition.xyz;

  vec3 fdx = vec3(dFdx(vp.x), dFdx(vp.y), dFdx(vp.z));
  vec3 fdy = vec3(dFdy(vp.x), dFdy(vp.y), dFdy(vp.z));

  vec3 normal = normalize(cross(fdx, fdy));
  return normal;
}

void main() {
  vec3 color;
  vec3 reflectedNormal = normalCalc();
  phongLightCalc(reflectedNormal);

  if (isOver && abs(worldPosition.z - point.z) < 0.01) {
    color = phongColorCalc(1.0, 0.0, 0.0);
  } else {
    color = phongColorCalc(1.0, 1.0, 1.0);
  }

  gl_FragColor = vec4(color, 1.0);
}
