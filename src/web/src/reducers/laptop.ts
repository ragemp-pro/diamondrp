const initialState = {
  calls: <{
    time: number; // From Date.now()
    id: number; // Your ID (from DB e.g)
    reason: string;
    acceptName: string; // Who taked (nickname)
  }[]>[],
  searchData: <{
    name: string;
    age: number;
    job: string;
    phone: string;
    offence: number; // Offence lvl (stars, 1-6)
    wantedHistory: {
      issuedBy: string; // Who issued (nickname)
      reason: string;
      date: number; // From Date.now()
    }[];
  }>{},
  history: <{
    whoName: string; // Who issued (nickname)
    name: string; // User name
    reason: string; // Returned from rpc(putWanted)
    star: number;
  }[]>[]
};

export default (state = initialState, { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case 'SET_CALLS':
      return {
        ...state,
        calls: payload.calls,
      };
    case 'SET_SEARCH_DATA':
      return {
        ...state, 
        searchData: payload.searchData
      }
    case 'SET_HISTORY':
      return {
        ...state,
        history: payload.history
      }

    default:
      return { ...state };
  }
};
