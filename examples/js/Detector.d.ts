declare namespace Detector {
  const canvas: boolean;
  const webgl: boolean;
  const workers: boolean;
  const fileapi: boolean;
  function getWebGLErrorMessage(): HTMLDivElement;
  function addGetWebGLMessage(parameters?: { parent?: Node, id?: string }): void;
}
