export default [
"#ifdef FLIP_SIDED",
"",
"	objectNormal = -objectNormal;",
"",
"#endif",
"",
"vec3 transformedNormal = normalMatrix * objectNormal;",
"",
].join('\n');