export default [
"#ifdef USE_COLOR",
"",
"	diffuseColor.rgb *= vColor;",
"",
"#endif",
].join('\n');