const initialState = {
  list: {},
};

export default (state = initialState, { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case 'SET_SKILLS':
      return {
        ...state,
        list: payload.skills,
      };
    default:
      return state;
  }
};
