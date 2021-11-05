const initialState = {
  logged: false,
  names: <string[]>[],
  spawnPos: <any[]>[],
};

export default (state = initialState, { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case 'LOGIN_LOGGED':
      return {
        ...state,
        logged: payload.logged,
      };
    case 'LOGIN_SET_DATA':
      return {
        ...state,
        names: payload.names,
        spawnPos: payload.spawnPos,
      }
    default:
      return { ...state };
  }
};
