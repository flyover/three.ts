export default [
"#ifdef USE_LOGDEPTHBUF",
"",
"	uniform float logDepthBufFC;",
"",
"	#ifdef USE_LOGDEPTHBUF_EXT",
"",
"		varying float vFragDepth;",
"",
"	#endif",
"",
"#endif",
"",
].join('\n');