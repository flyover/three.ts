declare class Stats {
  REVISION: number;
  dom: Node;
  addPanel(panel: Stats): Stats;
  showPanel(id: number): void;
  begin(): void;
  end(): void;
  update(): void;
  // Backwards Compatibility
  domElement: HTMLElement;
  setMode(): void;
}
