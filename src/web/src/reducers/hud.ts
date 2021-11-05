const initialState = {
  chipsBalance: 0
};

export default (state = initialState, action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'CHANGE_CHIPS_BALANCE':
      return {
        ...state,
        chipsBalance: action.payload.chipsBalance,
      };
    default:
      return { ...state };
  }
};
