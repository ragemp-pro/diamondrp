const initialState = {
  players: <
    { id: number; name: string; level: number; color: [number, number, number, number] }[]
  >[],
  username: '',
};

export default (state = initialState, { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case 'USERNAME_SET':
      return {
        ...state,
        username: payload.name,
      };
    case 'PLAYERS_SET':
      return {
        ...state,
        players: payload.players,
      };
    default:
      return { ...state };
  }
};
