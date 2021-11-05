export const setCalls = (calls: any) => {
  return {
    type: 'SET_CALLS',
    payload: {
      calls,
    },
  };
};

export const setSearchData = (searchData: any) => {
  return {
    type: 'SET_SEARCH_DATA',
    payload: {
      searchData,
    },
  };
};

export const setHistory = (history: any) => {
  return {
    type: 'SET_HISTORY',
    payload: {
      history,
    },
  };
}