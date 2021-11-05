export const setPhone = (phone: any) => {
  return {
    type: 'SET_PHONE',
    payload: { ...phone },
  };
};

export const setSim = (sim: any) => {
  let payload;
  payload = sim ? { ...sim } : { hasSim: false };
  return {
    type: 'SET_SIM',
    payload,
  };
};

export const setDialogs = (dialogs: any) => {
  return {
    type: 'SET_DIALOGS',
    payload: { dialogs },
  };
};

export const setLastCalls = (lastCalls: any) => {
  return {
    type: 'SET_LAST_CALLS',
    payload: { lastCalls },
  };
};

export const setCalling = (calling: boolean) => {
  return {
    type: 'SET_CALLING',
    payload: { calling },
  };
};

export const setCallingType = (callingType: 'to' | 'from') => {
  return {
    type: 'SET_CALLING',
    payload: { callingType },
  };
};

export const setSpeaking = (speaking: boolean) => {
  return {
    type: 'SET_SPEAKING',
    payload: { speaking },
  };
};

export const addContact = (phone: string, name: string) => {
  return {
    type: 'ADD_CONTACT',
    payload: { phone, name },
  };
};

export const editContact = (phone: string, name: string) => {
  return {
    type: 'EDIT_CONTACT',
    payload: { phone, name },
  };
};

export const removeContact = (id: number) => {
  return {
    type: 'REMOVE_CONTACT',
    payload: { id },
  };
};

export const sendMessage = (phone: string, text: string) => {
  return {
    type: 'SEND_MESSAGE',
    payload: { phone, text },
  };
};

export const removeDialog = (id: number) => {
  return {
    type: 'REMOVE_DIALOG',
    payload: { id },
  };
};

export const addNote = (text: string) => {
  return {
    type: 'ADD_NOTE',
    payload: { text },
  };
};

export const editNote = (id: number, text: string) => {
  return {
    type: 'EDIT_NOTE',
    payload: { id, text },
  };
};

export const removeNote = (id: number) => {
  return {
    type: 'REMOVE_NOTE',
    payload: { id },
  };
};

export const setSound = (sound: boolean) => {
  return {
    type: 'SET_SOUND',
    payload: { sound },
  };
};

export const setDisturb = (disturb: boolean) => {
  return {
    type: 'SET_DISTURB',
    payload: { disturb },
  };
};
