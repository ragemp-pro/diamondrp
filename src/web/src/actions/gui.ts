import { push } from 'react-router-redux';
import $ from 'jquery';

export const setGui = (gui: string | null) => (dispatch: Function, getState: Function) => {
  if (getState().gui.input && gui != null) return;
  if (gui == null) {
    gui = '/';
  }
  const {
    gui: { open: prevGui },
  } = getState();
  if (gui == prevGui) return;
  if (prevGui && gui != '/' && !['/', 'reg', 'login', 'newpass', 'personage'].includes(prevGui)) {
    dispatch({
      type: 'GUI_SET',
      payload: {
        gui: prevGui,
      },
    });
    return;
  }
  mp.trigger('client:gui:updateGui', gui);
  dispatch(push(gui));
  dispatch({
    type: 'GUI_SET',
    payload: {
      gui,
    },
  });
};

export const setShowHud = (showHud: boolean) => {
  window.chatAPI.show(showHud);
  return {
    type: 'GUI_SHOW_HUD',
    payload: {
      showHud,
    },
  };
};

export const setCursor = (cursor: boolean) => {
  mp.invoke('focus', cursor);
  return {
    type: 'GUI_CURSOR',
    payload: {
      cursor,
    },
  };
};

export const setHud = (hud: boolean) => {
  return {
    type: 'GUI_SET_HUD',
    payload: {
      hud,
    },
  };
};

export const setCircleCursor = (cursor: boolean) => {
  return {
    type: 'CIRCLE_CURSOR',
    payload: {
      cursor,
    },
  };
};

export const setInput = (input: boolean) => {
  return {
    type: 'GUI_SET_INPUT',
    payload: {
      input,
    },
  };
};

export const setSpeedometer = (speedometer: boolean) => (dispatch: Function) => {
  if (!speedometer) {
    let hudSpeedometr = $('.hud-speedometr-wrap');
    setTimeout(() => {
      hudSpeedometr.removeClass('on');
      dispatch({
        type: 'GUI_SET_SPEEDOMETER',
        payload: {
          speedometer,
        },
      });
    }, 400);
  } else {
    dispatch({
      type: 'GUI_SET_SPEEDOMETER',
      payload: {
        speedometer,
      },
    });
  }
};

export const setBinder = (binder: string) => {
  binder = JSON.parse(binder);
  return {
    type: 'GUI_SET_BINDER',
    payload: {
      binder,
    },
  };
};

export const setChatActive = (active: boolean) => {
  return {
    type: 'GUI_SET_CHAT_ACTIVE',
    payload: {
      active,
    },
  };
};
