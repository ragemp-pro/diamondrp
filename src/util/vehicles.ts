export interface vehicleInfoCarConf {
    id?: number;
    display_name: string;
    class_name: vehClassNameConf;
    hash: number;
    stock:number;
    // stock_full: number;
    fuel_full: number;
    fuel_min: number
}

export type vehClassNameConf = "Emergency" | "Planes" | "Helicopters" | "Cycles" | "Boats" | 'Commercials' | 'Compacts' | 'Coupes' | 'Industrial' | 'Motorcycles' | 'Muscle' | 'Off-Road' | 'Sedans' | 'Sports' | 'Sports Classics' | 'Super' | 'SUVs' | 'Utility' | 'Vans' | 'Unknown';