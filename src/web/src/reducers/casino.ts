const initialState = {
  type: '',
  bet: 0,
  additionalData: {}
};

export default (state = initialState, action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'CHANGE_TYPE':
      return {
        ...state,
        type: action.payload.type
      };
    case 'CHANGE_BET_VALUE':
      return {
        ...state,
        bet: action.payload.bet
      };
    case 'UPDATE_ADDITIONAL_DATA': {

      const modifyAdditionalData: any = {};

      if (state.type === 'dice' || state.type === 'dice-dealer') {
        if (!Array.isArray(action.payload.additionalData.players)) {
          action.payload.additionalData.players = [];
        }

        const playersNames = action.payload.additionalData.players;

        const missedNamesLength = 4 - playersNames.length;

        if (missedNamesLength > 0) {
          for (let j = 0; j < missedNamesLength; j++) {
            playersNames.push('-');
          }
        }

        modifyAdditionalData.players = playersNames;
        modifyAdditionalData.playersLength = playersNames.length - missedNamesLength;
      }

      return {
        ...state,
        additionalData: {
          ...state.additionalData,
          ...action.payload.additionalData,
          ...modifyAdditionalData
        }
      };
    }

    case 'SET_ADDITIONAL_DATA': {
      const modifyAdditionalData: any = {};

      if (state.type === 'dice' || state.type === 'dice-dealer') {
        if (!Array.isArray(action.payload.additionalData.players)) {
          action.payload.additionalData.players = [];
        }

        const playersNames = action.payload.additionalData.players;

        const missedNamesLength = 4 - playersNames.length;

        if (missedNamesLength > 0) {
          for (let j = 0; j < missedNamesLength; j++) {
            playersNames.push('-');
          }
        }

        modifyAdditionalData.players = playersNames;
        modifyAdditionalData.playersLength = playersNames.length - missedNamesLength;
      }

      return {
        ...state,
        additionalData: {
          ...action.payload.additionalData,
          ...modifyAdditionalData
        }
      };
    }
    default:
      return { ...state };
  }
};
