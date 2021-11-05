const initialState = {
  showHud: true,
  open: <string>null,
  input: false,
  speedometer: false,
  hud: false,
  binder: {},
  cursor: false,
  circleCursor: false,
  chatActive: false,
};

export default (state = initialState, action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'GUI_SET':
      return {
        ...state,
        open: action.payload.gui,
      };

    case 'GUI_SHOW_HUD':
      return {
        ...state,
        showHud: action.payload.showHud,
      };

    case 'GUI_SET_INPUT':
      return {
        ...state,
        input: action.payload.input,
      };

    case 'GUI_SET_SPEEDOMETER':
      return {
        ...state,
        speedometer: action.payload.speedometer,
      };

    case 'GUI_SET_BINDER':
      return {
        ...state,
        binder: action.payload.binder,
      };

    case 'GUI_SET_HUD':
      return {
        ...state,
        hud: action.payload.hud,
      };

    case 'GUI_CURSOR':
      return {
        ...state,
        cursor: action.payload.cursor,
      };

    case 'CIRCLE_CURSOR':
      return {
        ...state,
        circleCursor: action.payload.cursor,
      };
    case 'GUI_SET_CHAT_ACTIVE':
      return {
        ...state,
        chatActive: action.payload.active,
      };
    default:
      return { ...state };
  }
};
