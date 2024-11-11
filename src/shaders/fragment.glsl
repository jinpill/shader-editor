precision mediump float;

in vec4 worldPosition;
in vec4 viewWorldPosition;

uniform float clippingHeight;
uniform vec3 castingPoint;
uniform bool isPointerOver;
uniform float layerThickness;
uniform float opacity;
uniform vec3 buildSize;
uniform float bottom;

vec3 color(float r, float g, float b) {
  return vec3(r, g, b) / vec3(255.0);
}

bool useClipping = false;
bool useContour = true;
bool isSelected = false;
bool isIncomplete = false;
bool isOnBottom = true;

vec3 modelColor = vec3(0.8, 0.8, 0.8);
vec3 incompleteModelColor = vec3(0.97, 0.62, 0.23);
vec3 selectedModelColor = vec3(0.0, 0.75, 1.0);
vec3 incompleteSelectedModelColor = vec3(1.0, 0.26, 0.08);
vec3 bottomColor = vec3(0.0, 1.0, 0.5);
vec3 contourColor = vec3(1.0, 0.2, 0.2);
vec3 incompleteModelContourColor = vec3(1.0, 1.0, 1.0);
vec3 outsideColor = vec3(1.0, 0.2, 0.2);

vec3 ambientReflection;
vec3 diffuseFactor;
vec3 specularReflection;

// HERE //////////////////////////////////////////////////////////////////////////////
void initVariables() {
  // Flags to change conditions of the model.
  useClipping = false;
  useContour = true;
  isSelected = false;
  isIncomplete = false;
  isOnBottom = true;

  // Colors.
  modelColor = color(204.0, 204.0, 204.0);
  incompleteModelColor = color(247.0, 158.0, 59.0);
  selectedModelColor = color(0.0, 191.0, 255.0);
  incompleteSelectedModelColor = color(255.0, 66.0, 20.0);
  bottomColor = color(0.0, 255.0, 128.0);
  contourColor = color(255.0, 51.0, 51.0);
  incompleteModelContourColor = color(255.0, 255.0, 255.0);
  outsideColor = color(255.0, 51.0, 51.0);
}
// HERE //////////////////////////////////////////////////////////////////////////////

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

vec3 phongColorCalc(in vec3 diffuseColor) {
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

bool isContourHeight() {
  float LINE_HALF_WIDTH = 0.04;
  float vertialDistance = abs(worldPosition.z - castingPoint.z);
  bool isCastingHeight = vertialDistance < LINE_HALF_WIDTH;
  return useContour && isCastingHeight;
}

bool isOutsideBuildSize() {
  float hx = buildSize.x * 0.5; // half x
  float hy = buildSize.y * 0.5; // half y

  if (worldPosition.x < -hx || worldPosition.x > hx) return true;
  if (worldPosition.y < -hy || worldPosition.y > hy) return true;
  if (!isOnBottom && worldPosition.z < 0.0 || worldPosition.z > buildSize.z) return true;
  return false;
}

bool isBottomHeight() {
  return isOnBottom && worldPosition.z < bottom + layerThickness;
}

vec3 getFinalColor(in vec3 color) {
  color = color * 0.8 + 0.2;
  if (!useContour && isPointerOver) {
    color = color + 0.2;
  }
  return color;
}

void main() {
  if (useClipping && worldPosition.z > clippingHeight) {
    discard;
  }

  initVariables();
  vec3 color = vec3(1.0, 1.0, 1.0);
  vec3 reflectedNormal = normalCalc();
  phongLightCalc(reflectedNormal);

  if (gl_FrontFacing) {
    if (isOutsideBuildSize()) {
      color = phongColorCalc(outsideColor);
    } else if (isContourHeight()) {
      if (isIncomplete) {
        color = phongColorCalc(incompleteModelContourColor);
      } else {
        color = phongColorCalc(contourColor);
      }
    } else if (isBottomHeight()) {
      color = phongColorCalc(bottomColor);
    } else if (isSelected) {
      if (isIncomplete) {
        color = phongColorCalc(incompleteSelectedModelColor);
      } else {
        color = phongColorCalc(selectedModelColor);
      }
    } else {
      if (isIncomplete) {
        color = phongColorCalc(incompleteModelColor);
      } else {
        color = phongColorCalc(modelColor);
      }
    }
    color = getFinalColor(color);
  }

  gl_FragColor = vec4(color, opacity);
}
