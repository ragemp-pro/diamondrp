export const setPlayers = (
  players: { id: number; name: string; level: number; color: [number, number, number, number] }[]
) => {
  return {
    type: 'PLAYERS_SET',
    payload: { players },
  };
};

export const setUsername = (name: string) => {
  return {
    type: 'USERNAME_SET',
    payload: { name },
  };
};
