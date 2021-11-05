export const setUsername = (username: string) => {
  return {
    type: 'SET_USERNAME',
    payload: { username },
  };
};

export const setFloor = (floor: number) => {
  return {
    type: 'SET_FLOOR',
    payload: { floor },
  };
};

export const setItems = (items: any) => {
  return {
    type: 'SET_ITEMS',
    payload: { items },
  };
};

export const addItem = (item: any) => {
  return {
    type: 'ADD_ITEM',
    payload: { item },
  };
};

export const removeItem = (id: number) => {
  return {
    type: 'REMOVE_ITEM',
    payload: { id },
  };
};

export const updateItem = (item: any) => {
  return {
    type: 'UPDATE_ITEM',
    payload: { item },
  };
};

export const updateCount = (hash: number, count: number) => {
  return {
    type: 'UPDATE_COUNT',
    payload: { hash, count },
  };
};

export const toggleBackpack = (hasBackpack: boolean) => {
  return {
    type: 'TOGGLE_BACKPACK',
    payload: { hasBackpack },
  };
};

export const toggleFreeze = (freeze: boolean) => {
  return {
    type: 'TOGGLE_FREEZE',
    payload: { freeze },
  };
};

export const setTrunk = (data: any) => {
  data = JSON.parse(data);
  if (!data.isTrunk) {
    return {
      type: 'SET_TRUNK',
      payload: { isTrunk: false },
    };
  } else {
    const { isTrunk, trunkItems, trunkCells, maxTrunkWeight } = data;
    return {
      type: 'SET_TRUNK',
      payload: { isTrunk, trunkItems, trunkCells, maxTrunkWeight },
    };
  }
};

export const setTrunkItems = (items: any) => {
  return {
    type: 'SET_TRUNK_ITEMS',
    payload: { items },
  };
};

export const addTrunkItem = (item: any) => {
  return {
    type: 'ADD_TRUNK_ITEM',
    payload: { item },
  };
};

export const hideTrunkItem = (hash: number) => {
  return {
    type: 'HIDE_TRUNK_ITEM',
    payload: { hash },
  };
};

export const setCupboard = (data: any) => {
  if (!data) {
    return {
      type: 'SET_CUPBOARD',
      payload: { isCupboard: false },
    };
  } else {
    const items = JSON.parse(data);
    return {
      type: 'SET_CUPBOARD',
      payload: { isCupboard: true, items },
    };
  }
};

export const setFridge = (data: any) => {
  if (!data) {
    return {
      type: 'SET_FRIDGE',
      payload: { isFridge: false },
    };
  } else {
    const items = JSON.parse(data);
    return {
      type: 'SET_FRIDGE',
      payload: { isFridge: true, items },
    };
  }
};

export const setWeight = (weight: number) => {
  return {
    type: 'SET_WEIGHT',
    payload: { weight },
  };
};

export const setDragging = (isDragging: boolean) => {
  return {
    type: 'SET_DRAGGING',
    payload: { isDragging },
  };
};

export const dropItem = (id: number, toSection: string, toIndex: number, clothIndex: number) => {
  return {
    type: 'DROP_ITEM',
    payload: { id, toSection, toIndex, clothIndex },
  };
};
