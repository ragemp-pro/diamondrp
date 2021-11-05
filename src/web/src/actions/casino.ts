export const changeType = (type: string) => {
  return {
    type: 'CHANGE_TYPE',
    payload: {
      type
    },
  };
};

export const changeBetValue = (bet: number) => {
  return {
    type: 'CHANGE_BET_VALUE',
    payload: {
      bet
    },
  };
};

export const updateAdditionalData = (additionalData: any = {}) => {
  return {
    type: 'UPDATE_ADDITIONAL_DATA',
    payload: {
      additionalData
    },
  };
};
export const setAdditionalData = (additionalData: any = {}) => {
  return {
    type: 'SET_ADDITIONAL_DATA',
    payload: {
      additionalData
    },
  };
};
