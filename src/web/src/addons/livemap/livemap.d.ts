import '@types/googlemaps';
declare function parseFloat(string: string|number): number;
declare global {
    function parseFloat(string: string | number): number;
    interface Window {
        google: typeof google;
        drawWarZone: (item: { pos: { x: number; y: number; z: number; d: number; }; desc?: string; name?: string; attack?: boolean; color: { r: number; g: number; b: number; }; drag?: boolean; }) => google.maps.Polygon;
        loadTestData: (data: string) => void;
        saveTestData: () => void;
        drawWarZoneTest: (id: number, x: number, y: number, z: number, d: number) => void;
    }
}
