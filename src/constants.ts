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
///export enum FrontFaceDirection {}
export const FrontFaceDirectionCW = 0;
export const FrontFaceDirectionCCW = 1;
//
///export enum ShadowMap {}
export const BasicShadowMap = 0;
export const PCFShadowMap = 1;
export const PCFSoftShadowMap = 2;
//
///export enum Side {}
export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;
//
///export enum Shading {}
export const FlatShading = 1;
export const SmoothShading = 2;
//
///export enum Colors {}
export const NoColors = 0;
export const FaceColors = 1;
export const VertexColors = 2;
//
export enum BlendingMode {
  NoBlending = 0,
  NormalBlending = 1,
  AdditiveBlending = 2,
  SubtractiveBlending = 3,
  MultiplyBlending = 4,
  CustomBlending = 5
}
export const NoBlending: BlendingMode = BlendingMode.NoBlending;
export const NormalBlending: BlendingMode = BlendingMode.NormalBlending;
export const AdditiveBlending: BlendingMode = BlendingMode.AdditiveBlending;
export const SubtractiveBlending: BlendingMode = BlendingMode.SubtractiveBlending;
export const MultiplyBlending: BlendingMode = BlendingMode.MultiplyBlending;
export const CustomBlending: BlendingMode = BlendingMode.CustomBlending;
//
///export enum Equation {}
export const AddEquation = 100;
export const SubtractEquation = 101;
export const ReverseSubtractEquation = 102;
export const MinEquation = 103;
export const MaxEquation = 104;
//
///export enum Factor {}
export const ZeroFactor = 200;
export const OneFactor = 201;
export const SrcColorFactor = 202;
export const OneMinusSrcColorFactor = 203;
export const SrcAlphaFactor = 204;
export const OneMinusSrcAlphaFactor = 205;
export const DstAlphaFactor = 206;
export const OneMinusDstAlphaFactor = 207;
export const DstColorFactor = 208;
export const OneMinusDstColorFactor = 209;
export const SrcAlphaSaturateFactor = 210;
//
///export enum Depth {}
export const NeverDepth = 0;
export const AlwaysDepth = 1;
export const LessDepth = 2;
export const LessEqualDepth = 3;
export const EqualDepth = 4;
export const GreaterEqualDepth = 5;
export const GreaterDepth = 6;
export const NotEqualDepth = 7;
//
///export enum Operation {}
export const MultiplyOperation = 0;
export const MixOperation = 1;
export const AddOperation = 2;
//
///export enum ToneMapping {}
export const NoToneMapping = 0;
export const LinearToneMapping = 1;
export const ReinhardToneMapping = 2;
export const Uncharted2ToneMapping = 3;
export const CineonToneMapping = 4;
//
export enum TextureMapping {
    UVMapping = 300,
    CubeReflectionMapping = 301,
    CubeRefractionMapping = 302,
    EquirectangularReflectionMapping = 303,
    EquirectangularRefractionMapping = 304,
    SphericalReflectionMapping = 305,
    CubeUVReflectionMapping = 306,
    CubeUVRefractionMapping = 307
}
export const UVMapping: TextureMapping = TextureMapping.UVMapping;
export const CubeReflectionMapping: TextureMapping = TextureMapping.CubeReflectionMapping;
export const CubeRefractionMapping: TextureMapping = TextureMapping.CubeRefractionMapping;
export const EquirectangularReflectionMapping: TextureMapping = TextureMapping.EquirectangularReflectionMapping;
export const EquirectangularRefractionMapping: TextureMapping = TextureMapping.EquirectangularRefractionMapping;
export const SphericalReflectionMapping: TextureMapping = TextureMapping.SphericalReflectionMapping;
export const CubeUVReflectionMapping: TextureMapping = TextureMapping.CubeUVReflectionMapping;
export const CubeUVRefractionMapping: TextureMapping = TextureMapping.CubeUVRefractionMapping;
//
export enum TextureWrapping {
    RepeatWrapping = 1000,
    ClampToEdgeWrapping = 1001,
    MirroredRepeatWrapping = 1002
}
export const RepeatWrapping: TextureWrapping = TextureWrapping.RepeatWrapping;
export const ClampToEdgeWrapping: TextureWrapping = TextureWrapping.ClampToEdgeWrapping;
export const MirroredRepeatWrapping: TextureWrapping = TextureWrapping.MirroredRepeatWrapping;
//
export enum TextureFilter {
    NearestFilter = 1003,
    NearestMipMapNearestFilter = 1004,
    NearestMipMapLinearFilter = 1005,
    LinearFilter = 1006,
    LinearMipMapNearestFilter = 1007,
    LinearMipMapLinearFilter = 1008
}
export const NearestFilter: TextureFilter = TextureFilter.NearestFilter;
export const NearestMipMapNearestFilter: TextureFilter = TextureFilter.NearestMipMapNearestFilter;
export const NearestMipMapLinearFilter: TextureFilter = TextureFilter.NearestMipMapLinearFilter;
export const LinearFilter: TextureFilter = TextureFilter.LinearFilter;
export const LinearMipMapNearestFilter: TextureFilter = TextureFilter.LinearMipMapNearestFilter;
export const LinearMipMapLinearFilter: TextureFilter = TextureFilter.LinearMipMapLinearFilter;
//
///export enum Type {}
export const UnsignedByteType = 1009;
export const ByteType = 1010;
export const ShortType = 1011;
export const UnsignedShortType = 1012;
export const IntType = 1013;
export const UnsignedIntType = 1014;
export const FloatType = 1015;
export const HalfFloatType = 1016;
export const UnsignedShort4444Type = 1017;
export const UnsignedShort5551Type = 1018;
export const UnsignedShort565Type = 1019;
export const UnsignedInt248Type = 1020;
//
///export enum Format {}
export const AlphaFormat = 1021;
export const RGBFormat = 1022;
export const RGBAFormat = 1023;
export const LuminanceFormat = 1024;
export const LuminanceAlphaFormat = 1025;
export const RGBEFormat = RGBAFormat;
export const DepthFormat = 1026;
export const DepthStencilFormat = 1027;
export const RGB_S3TC_DXT1_Format = 2001;
export const RGBA_S3TC_DXT1_Format = 2002;
export const RGBA_S3TC_DXT3_Format = 2003;
export const RGBA_S3TC_DXT5_Format = 2004;
export const RGB_PVRTC_4BPPV1_Format = 2100;
export const RGB_PVRTC_2BPPV1_Format = 2101;
export const RGBA_PVRTC_4BPPV1_Format = 2102;
export const RGBA_PVRTC_2BPPV1_Format = 2103;
export const RGB_ETC1_Format = 2151;
//
///export enum Loop {}
export const LoopOnce = 2200;
export const LoopRepeat = 2201;
export const LoopPingPong = 2202;
//
///export enum Interpolate {}
export const InterpolateDiscrete = 2300;
export const InterpolateLinear = 2301;
export const InterpolateSmooth = 2302;
//
///export enum Ending {}
export const ZeroCurvatureEnding = 2400;
export const ZeroSlopeEnding = 2401;
export const WrapAroundEnding = 2402;
//
///export enum DrawMode {}
export const TrianglesDrawMode = 0;
export const TriangleStripDrawMode = 1;
export const TriangleFanDrawMode = 2;
//
///export enum Encoding {}
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const GammaEncoding = 3007;
export const RGBEEncoding = 3002;
export const LogLuvEncoding = 3003;
export const RGBM7Encoding = 3004;
export const RGBM16Encoding = 3005;
export const RGBDEncoding = 3006;
//
///export enum DepthPacking {}
export const BasicDepthPacking = 3200;
export const RGBADepthPacking = 3201;
