export const REVISION = "82";
//
export enum MOUSE { LEFT = 0, MIDDLE = 1, RIGHT = 2 }
//
export enum CullFace {
  None = 0,
  Back = 1,
  Front = 2,
  FrontBack = 3
}
export const CullFaceNone = CullFace.None;
export const CullFaceBack = CullFace.Back;
export const CullFaceFront = CullFace.Front;
export const CullFaceFrontBack = CullFace.FrontBack;
//
export enum FrontFaceDirection {
  CW = 0,
  CCW = 1
}
export const FrontFaceDirectionCW: FrontFaceDirection = FrontFaceDirection.CW;
export const FrontFaceDirectionCCW: FrontFaceDirection = FrontFaceDirection.CCW;
//
export enum ShadowMap {
  Basic = 0,
  PCF = 1,
  PCFSoft = 2
}
export const BasicShadowMap: ShadowMap = ShadowMap.Basic;
export const PCFShadowMap: ShadowMap = ShadowMap.PCF;
export const PCFSoftShadowMap: ShadowMap = ShadowMap.PCFSoft;
//
export enum SideMode {
  Front = 0,
  Back = 1,
  Double = 2
}
export const FrontSide: SideMode = SideMode.Front;
export const BackSide: SideMode = SideMode.Back;
export const DoubleSide: SideMode = SideMode.Double;
//
export enum ShadingMode {
  Flat = 1,
  Smooth = 2
}
export const FlatShading: ShadingMode = ShadingMode.Flat;
export const SmoothShading: ShadingMode = ShadingMode.Smooth;
//
export enum ColorsMode {
  None = 0,
  Face = 1,
  Vertex = 2
}
export const NoColors: ColorsMode = ColorsMode.None;
export const FaceColors: ColorsMode = ColorsMode.Face;
export const VertexColors: ColorsMode = ColorsMode.Vertex;
//
export enum BlendingMode {
  None = 0,
  Normal = 1,
  Additive = 2,
  Subtractive = 3,
  Multiply = 4,
  Custom = 5
}
export const NoBlending: BlendingMode = BlendingMode.None;
export const NormalBlending: BlendingMode = BlendingMode.Normal;
export const AdditiveBlending: BlendingMode = BlendingMode.Additive;
export const SubtractiveBlending: BlendingMode = BlendingMode.Subtractive;
export const MultiplyBlending: BlendingMode = BlendingMode.Multiply;
export const CustomBlending: BlendingMode = BlendingMode.Custom;
//
export enum BlendingEquation {
  Add = 100,
  Subtract = 101,
  ReverseSubtract = 102,
  Min = 103,
  Max = 104
}
export const AddEquation: BlendingEquation = BlendingEquation.Add;
export const SubtractEquation: BlendingEquation = BlendingEquation.Subtract;
export const ReverseSubtractEquation: BlendingEquation = BlendingEquation.ReverseSubtract;
export const MinEquation: BlendingEquation = BlendingEquation.Min;
export const MaxEquation: BlendingEquation = BlendingEquation.Max;
//
export enum BlendingFactor {
  Zero = 200,
  One = 201,
  SrcColor = 202,
  OneMinusSrcColor = 203,
  SrcAlpha = 204,
  OneMinusSrcAlpha = 205,
  DstAlpha = 206,
  OneMinusDstAlpha = 207,
  DstColor = 208,
  OneMinusDstColor = 209,
  SrcAlphaSaturate = 210,
}
export const ZeroFactor: BlendingFactor = BlendingFactor.Zero;
export const OneFactor: BlendingFactor = BlendingFactor.One;
export const SrcColorFactor: BlendingFactor = BlendingFactor.SrcColor;
export const OneMinusSrcColorFactor: BlendingFactor = BlendingFactor.OneMinusSrcColor;
export const SrcAlphaFactor: BlendingFactor = BlendingFactor.SrcAlpha;
export const OneMinusSrcAlphaFactor: BlendingFactor = BlendingFactor.OneMinusSrcAlpha;
export const DstAlphaFactor: BlendingFactor = BlendingFactor.DstAlpha;
export const OneMinusDstAlphaFactor: BlendingFactor = BlendingFactor.OneMinusDstAlpha;
export const DstColorFactor: BlendingFactor = BlendingFactor.DstColor;
export const OneMinusDstColorFactor: BlendingFactor = BlendingFactor.OneMinusDstColor;
export const SrcAlphaSaturateFactor: BlendingFactor = BlendingFactor.SrcAlphaSaturate;
//
export enum DepthFunction {
  Never = 0,
  Always = 1,
  Less = 2,
  LessEqual = 3,
  Equal = 4,
  GreaterEqual = 5,
  Greater = 6,
  NotEqual = 7
}
export const NeverDepth: DepthFunction = DepthFunction.Never;
export const AlwaysDepth: DepthFunction = DepthFunction.Always;
export const LessDepth: DepthFunction = DepthFunction.Less;
export const LessEqualDepth: DepthFunction = DepthFunction.LessEqual;
export const EqualDepth: DepthFunction = DepthFunction.Equal;
export const GreaterEqualDepth: DepthFunction = DepthFunction.GreaterEqual;
export const GreaterDepth: DepthFunction = DepthFunction.Greater;
export const NotEqualDepth: DepthFunction = DepthFunction.NotEqual;
//
export enum BlendingOperation {
  Multiply = 0,
  Mix = 1,
  Add = 2
}
export const MultiplyOperation: BlendingOperation = BlendingOperation.Multiply;
export const MixOperation: BlendingOperation = BlendingOperation.Mix;
export const AddOperation: BlendingOperation = BlendingOperation.Add;
//
export enum ToneMapping {
  None = 0,
  Linear = 1,
  Reinhard = 2,
  Uncharted2 = 3,
  Cineon = 4
}
export const NoToneMapping: ToneMapping = ToneMapping.None;
export const LinearToneMapping: ToneMapping = ToneMapping.Linear;
export const ReinhardToneMapping: ToneMapping = ToneMapping.Reinhard;
export const Uncharted2ToneMapping: ToneMapping = ToneMapping.Uncharted2;
export const CineonToneMapping: ToneMapping = ToneMapping.Cineon;
//
export enum TextureMapping {
  UV = 300,
  CubeReflection = 301,
  CubeRefraction = 302,
  EquirectangularReflection = 303,
  EquirectangularRefraction = 304,
  SphericalReflection = 305,
  CubeUVReflection = 306,
  CubeUVRefraction = 307
}
export const UVMapping: TextureMapping = TextureMapping.UV;
export const CubeReflectionMapping: TextureMapping = TextureMapping.CubeReflection;
export const CubeRefractionMapping: TextureMapping = TextureMapping.CubeRefraction;
export const EquirectangularReflectionMapping: TextureMapping = TextureMapping.EquirectangularReflection;
export const EquirectangularRefractionMapping: TextureMapping = TextureMapping.EquirectangularRefraction;
export const SphericalReflectionMapping: TextureMapping = TextureMapping.SphericalReflection;
export const CubeUVReflectionMapping: TextureMapping = TextureMapping.CubeUVReflection;
export const CubeUVRefractionMapping: TextureMapping = TextureMapping.CubeUVRefraction;
//
export enum TextureWrapping {
  Repeat = 1000,
  ClampToEdge = 1001,
  MirroredRepeat = 1002
}
export const RepeatWrapping: TextureWrapping = TextureWrapping.Repeat;
export const ClampToEdgeWrapping: TextureWrapping = TextureWrapping.ClampToEdge;
export const MirroredRepeatWrapping: TextureWrapping = TextureWrapping.MirroredRepeat;
//
export enum TextureFilter {
  Nearest = 1003,
  NearestMipMapNearest = 1004,
  NearestMipMapLinear = 1005,
  Linear = 1006,
  LinearMipMapNearest = 1007,
  LinearMipMapLinear = 1008
}
export const NearestFilter: TextureFilter = TextureFilter.Nearest;
export const NearestMipMapNearestFilter: TextureFilter = TextureFilter.NearestMipMapNearest;
export const NearestMipMapLinearFilter: TextureFilter = TextureFilter.NearestMipMapLinear;
export const LinearFilter: TextureFilter = TextureFilter.Linear;
export const LinearMipMapNearestFilter: TextureFilter = TextureFilter.LinearMipMapNearest;
export const LinearMipMapLinearFilter: TextureFilter = TextureFilter.LinearMipMapLinear;
//
export enum TextureType {
  UnsignedByte = 1009,
  Byte = 1010,
  Short = 1011,
  UnsignedShort = 1012,
  Int = 1013,
  UnsignedInt = 1014,
  Float = 1015,
  HalfFloat = 1016,
  UnsignedShort4444 = 1017,
  UnsignedShort5551 = 1018,
  UnsignedShort565 = 1019,
  UnsignedInt248 = 1020
}
export const UnsignedByteType: TextureType = TextureType.UnsignedByte;
export const ByteType: TextureType = TextureType.Byte;
export const ShortType: TextureType = TextureType.Short;
export const UnsignedShortType: TextureType = TextureType.UnsignedShort;
export const IntType: TextureType = TextureType.Int;
export const UnsignedIntType: TextureType = TextureType.UnsignedInt;
export const FloatType: TextureType = TextureType.Float;
export const HalfFloatType: TextureType = TextureType.HalfFloat;
export const UnsignedShort4444Type: TextureType = TextureType.UnsignedShort4444;
export const UnsignedShort5551Type: TextureType = TextureType.UnsignedShort5551;
export const UnsignedShort565Type: TextureType = TextureType.UnsignedShort565;
export const UnsignedInt248Type: TextureType = TextureType.UnsignedInt248;
//
export enum TextureFormat {
  Alpha = 1021,
  RGB = 1022,
  RGBA = 1023,
  Luminance = 1024,
  LuminanceAlpha = 1025,
  RGBE = RGBA,
  Depth = 1026,
  DepthStencil = 1027,
  RGB_S3TC_DXT1 = 2001,
  RGBA_S3TC_DXT1 = 2002,
  RGBA_S3TC_DXT3 = 2003,
  RGBA_S3TC_DXT5 = 2004,
  RGB_PVRTC_4BPPV1 = 2100,
  RGB_PVRTC_2BPPV1 = 2101,
  RGBA_PVRTC_4BPPV1 = 2102,
  RGBA_PVRTC_2BPPV1 = 2103,
  RGB_ETC1 = 2151,
}
export const AlphaFormat: TextureFormat = TextureFormat.Alpha;
export const RGBFormat: TextureFormat = TextureFormat.RGB;
export const RGBAFormat: TextureFormat = TextureFormat.RGBA;
export const LuminanceFormat: TextureFormat = TextureFormat.Luminance;
export const LuminanceAlphaFormat: TextureFormat = TextureFormat.LuminanceAlpha;
export const RGBEFormat: TextureFormat = TextureFormat.RGBE;
export const DepthFormat: TextureFormat = TextureFormat.Depth;
export const DepthStencilFormat: TextureFormat = TextureFormat.DepthStencil;
export const RGB_S3TC_DXT1_Format: TextureFormat = TextureFormat.RGB_S3TC_DXT1;
export const RGBA_S3TC_DXT1_Format: TextureFormat = TextureFormat.RGBA_S3TC_DXT1;
export const RGBA_S3TC_DXT3_Format: TextureFormat = TextureFormat.RGBA_S3TC_DXT3;
export const RGBA_S3TC_DXT5_Format: TextureFormat = TextureFormat.RGBA_S3TC_DXT5;
export const RGB_PVRTC_4BPPV1_Format: TextureFormat = TextureFormat.RGB_PVRTC_4BPPV1;
export const RGB_PVRTC_2BPPV1_Format: TextureFormat = TextureFormat.RGB_PVRTC_2BPPV1;
export const RGBA_PVRTC_4BPPV1_Format: TextureFormat = TextureFormat.RGBA_PVRTC_4BPPV1;
export const RGBA_PVRTC_2BPPV1_Format: TextureFormat = TextureFormat.RGBA_PVRTC_2BPPV1;
export const RGB_ETC1_Format: TextureFormat = TextureFormat.RGB_ETC1;
//
export enum LoopMode {
  Once = 2200,
  Repeat = 2201,
  PingPong = 2202
}
export const LoopOnce: LoopMode = LoopMode.Once;
export const LoopRepeat: LoopMode = LoopMode.Repeat;
export const LoopPingPong: LoopMode = LoopMode.PingPong;
//
export enum InterpolateMode {
  Discrete = 2300,
  Linear = 2301,
  Smooth = 2302
}
export const InterpolateDiscrete: InterpolateMode = InterpolateMode.Discrete;
export const InterpolateLinear: InterpolateMode = InterpolateMode.Linear;
export const InterpolateSmooth: InterpolateMode = InterpolateMode.Smooth;
//
export enum EndingMode {
  ZeroCurvature = 2400,
  ZeroSlope = 2401,
  WrapAround = 2402
}
export const ZeroCurvatureEnding: EndingMode = EndingMode.ZeroCurvature;
export const ZeroSlopeEnding: EndingMode = EndingMode.ZeroSlope;
export const WrapAroundEnding: EndingMode = EndingMode.WrapAround;
//
export enum DrawMode {
  Triangles = 0,
  TriangleStrip = 1,
  TriangleFan = 2
}
export const TrianglesDrawMode: DrawMode = DrawMode.Triangles;
export const TriangleStripDrawMode: DrawMode = DrawMode.TriangleStrip;
export const TriangleFanDrawMode: DrawMode = DrawMode.TriangleFan;
//
export enum TextureEncoding {
  Linear = 3000,
  sRGB = 3001,
  Gamma = 3007,
  RGBE = 3002,
  LogLuv = 3003,
  RGBM7 = 3004,
  RGBM16 = 3005,
  RGBD = 3006
}
export const LinearEncoding: TextureEncoding = TextureEncoding.Linear;
export const sRGBEncoding: TextureEncoding = TextureEncoding.sRGB;
export const GammaEncoding: TextureEncoding = TextureEncoding.Gamma;
export const RGBEEncoding: TextureEncoding = TextureEncoding.RGBE;
export const LogLuvEncoding: TextureEncoding = TextureEncoding.LogLuv;
export const RGBM7Encoding: TextureEncoding = TextureEncoding.RGBM7;
export const RGBM16Encoding: TextureEncoding = TextureEncoding.RGBM16;
export const RGBDEncoding: TextureEncoding = TextureEncoding.RGBD;
//
export enum DepthPacking {
  Basic = 3200,
  RGBA = 3201
}
export const BasicDepthPacking: DepthPacking = DepthPacking.Basic;
export const RGBADepthPacking: DepthPacking = DepthPacking.RGBA;
