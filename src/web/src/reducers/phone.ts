import rpc from 'rage-rpc';

const initialState = {
  hasPhone: false,
  hasSim: false,
  number: <string>null,
  balance: 0,
  contacts: <any[]>[],
  dialogs: <any[]>[],
  lastCalls: <any[]>[],
  notes: <any[]>[],
  settings: <any>{},
  calling: false,
  callingType: <boolean>null,
  speaking: false,
};

export default (state = initialState, { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case 'SET_PHONE':
      return {
        ...state,
        hasPhone: true,
        contacts: payload.contacts,
        dialogs: payload.dialogs,
        lastCalls: payload.lastCalls,
        notes: payload.notes,
        settings: payload.settings,
      };
    case 'SET_SIM':
      if (payload.hasSim === false) {
        return { ...state, hasSim: false };
      }
      return {
        ...state,
        hasSim: true,
        number: payload.number,
        balance: payload.balance,
      };
    case 'ADD_NOTE':
      state.notes.push(payload.text);
      rpc.triggerServer('saveNotes', JSON.stringify(state.notes));
      return { ...state };
    case 'EDIT_NOTE':
      state.notes[payload.id] = payload.text;
      rpc.triggerServer('saveNotes', JSON.stringify(state.notes));
      return { ...state };
    case 'REMOVE_NOTE':
      state.notes.splice(payload.id, 1);
      rpc.triggerServer('saveNotes', JSON.stringify(state.notes));
      return { ...state };
    case 'SET_SOUND':
      state.settings.sound = payload.sound;
      rpc.triggerServer('saveSettings', JSON.stringify(state.settings));
      return { ...state };
    case 'SET_DISTURB':
      state.settings.disturb = payload.disturb;
      rpc.triggerServer('saveSettings', JSON.stringify(state.settings));
      return { ...state };
    case 'ADD_CONTACT':
      state.contacts.push({ phone: payload.phone, name: payload.name });
      rpc.triggerServer('saveContacts', JSON.stringify(state.contacts));
      return { ...state };
    case 'EDIT_CONTACT':
      state.contacts.find((item) => item.phone == payload.phone).name = payload.name;
      rpc.triggerServer('saveContacts', JSON.stringify(state.contacts));
      return { ...state };
    case 'REMOVE_CONTACT':
      state.contacts.splice(payload.id, 1);
      rpc.triggerServer('saveContacts', JSON.stringify(state.contacts));
      return { ...state };
    case 'SEND_MESSAGE':
      if (!state.dialogs.find((item) => item.phone == payload.phone)) {
        state.dialogs.push({
          phone: payload.phone,
          messages: [],
        });
      }
      state.dialogs
        .find((item) => item.phone == payload.phone)
        .messages.push({
          type: 'to',
          text: payload.text,
        });
      rpc.triggerServer('saveDialogs', JSON.stringify(state.dialogs));
      rpc.triggerServer('sendMessage', JSON.stringify([payload.phone, payload.text]));
      return { ...state };
    case 'SET_DIALOGS':
      state.dialogs = payload.dialogs;
      return { ...state };
    case 'REMOVE_DIALOG':
      state.dialogs.splice(payload.id, 1);
      rpc.triggerServer('saveDialogs', JSON.stringify(state.dialogs));
      return { ...state };
    case 'SET_CALLING':
      state.calling = payload.calling;
      return { ...state };
    case 'SET_CALLING_TYPE':
      state.callingType = payload.callingType;
      return { ...state };
    case 'SET_SPEAKING':
      state.speaking = payload.speaking;
      return { ...state };
    case 'SET_LAST_CALLS':
      state.lastCalls = payload.lastCalls;
      return { ...state };
    default:
      return { ...state };
  }
};
