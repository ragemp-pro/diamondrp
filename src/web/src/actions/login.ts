export const setLogged = (logged: boolean) => {
  return {
    type: 'LOGIN_LOGGED',
    payload: {
      logged,
    },
  };
};

export const setLoginData = (names: string[], spawnPos: any[]) => {
  return {
    type: 'LOGIN_SET_DATA',
    payload: {
      names,
      spawnPos,
    },
  };
};