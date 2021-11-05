export const getCompanyName = (company: string) => {
    switch (company) {
        case 'swater':
        case 'sground':
            return 'Humane Labs';
        case 'water':
            return 'Water & Power';
        case 'sunb':
            return 'Sunset Bleach';
        case 'bgstar':
            return 'Bugstars';
        case 'lawyer1':
            return 'Slaughter, Slaughter & Slaughter';
        case 'lawyer2':
            return 'Bullhead';
        case 'lawyer3':
            return 'Pearson Specter';
        case 'mail':
            return 'PostOp';
        case 'mail2':
            return 'GoPostal';
        case 'gr6':
            return 'Gruppe6';
        case 'three':
            return 'OConnor';
        case 'photo':
            return 'Life Invader';
        case 'taxi1':
            return 'Downtown Cab Co.';
        case 'taxi2':
            return 'Express Car Service';
        default:
            return 'Государство';
    }
}