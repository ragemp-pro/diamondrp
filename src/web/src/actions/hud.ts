export const changeChipsBalance = (chipsBalance: number) => {
  return {
    type: 'CHANGE_CHIPS_BALANCE',
    payload: {
      chipsBalance
    },
  };
};
