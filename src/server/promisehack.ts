let hack: number = setInterval(() => { }, 0);
export const enabledHackTimeout = () => {
    return !!hack
}
export const enableHackTimeout = () => {
    if(hack){
        clearInterval(hack)
        hack = null;
        return
    } else {
        hack = setInterval(() => { }, 0);
    }
}