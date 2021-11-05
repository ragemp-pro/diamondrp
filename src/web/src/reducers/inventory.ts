import { CEF } from 'api';
import rpc from 'rage-rpc';
import _ from 'lodash';

const initialState = {
  username: '',
  floor: 0,
  items: <any[]>[],
  weight: 0,
  maxWeight: 15,
  hasBackpack: false,
  isTrunk: false,
  trunkWeight: 0,
  trunkCells: <number>null,
  maxTrunkWeight: <number>null,
  isCupboard: false,
  cupboardWeight: 0,
  maxCupboardWeight: 50,
  isFridge: false,
  fridgeWeight: 0,
  maxFridgeWeight: 10,
  freeze: false,
  isDragging: false,
};

export default (state = initialState, { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case 'SET_USERNAME':
      return {
        ...state,
        username: payload.username,
      };

    case 'SET_FLOOR':
      return {
        ...state,
        floor: payload.floor,
      };

    case 'SET_ITEMS':
      state.items = payload.items;
      state.weight = state.items.reduce((weight, item) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return { ...state };

    case 'ADD_ITEM':
      state.items.push(payload.item);
      state.weight = state.items.reduce((weight, item) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return { ...state };

    case 'REMOVE_ITEM':
      let idRemove = state.items.indexOf(
        state.items.find((item) => item.id == payload.id && item.section != 'trunk')
      );
      state.items.splice(idRemove, 1);
      state.weight = state.items.reduce((weight, item) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return { ...state };

    case 'UPDATE_ITEM':
      let idUpdate = state.items.indexOf(
        state.items.find((item) => item.hash == payload.item.hash)
      );
      state.items[idUpdate] = payload.item;
      state.weight = state.items.reduce((weight, item) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return { ...state };

    case 'UPDATE_COUNT':
      state.items.find((item) => item.hash == payload.hash).count = payload.count;
      state.weight = state.items.reduce((weight, item) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return { ...state };

    case 'TOGGLE_BACKPACK':
      if (
        (state.hasBackpack && payload.hasBackpack) ||
        (!state.hasBackpack && !payload.hasBackpack)
      )
        return state;
      return {
        ...state,
        hasBackpack: !!payload.hasBackpack,
        maxWeight: payload.hasBackpack ? 40 : 15,
      };

    case 'TOGGLE_FREEZE':
      return {
        ...state,
        freeze: !!payload.toggle,
      };

    case 'SET_TRUNK':
      if (payload.isTrunk) {
        state.trunkWeight = payload.trunkItems.reduce((weight: number, item: any) => {
          if (item.type == 'weapon') return (weight += item.weight);
          else return (weight += item.weight * (item.count || 1));
        }, 0);
      } else
        return {
          ...state,
          isTrunk: false,
          items: state.items.filter((item) => item.section != 'trunk'),
        };
      return {
        ...state,
        isTrunk: !!payload.isTrunk,
        items: [...state.items, ...payload.trunkItems],
        maxTrunkWeight: payload.maxTrunkWeight || null,
        trunkCells: payload.trunkCells || null,
      };

    case 'SET_TRUNK_ITEMS':
      state.items = state.items.filter((item) => item.section != 'trunk');
      state.trunkWeight = payload.items.reduce((weight: number, item: any) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return {
        ...state,
        items: [...state.items, ...payload.items],
      };

    case 'ADD_TRUNK_ITEM':
      state.items.push(payload.item);
      state.weight = state.items.reduce((weight, item) => {
        if (item.type == 'weapon') return (weight += item.weight);
        else return (weight += item.weight * (item.count || 1));
      }, 0);
      return { ...state };

    case 'HIDE_TRUNK_ITEM':
      state.items.find((item) => item.hash == payload.hash && item.section == 'trunk').hide = true;
      return { ...state };

    case 'SET_CUPBOARD':
      if (payload.isCupboard) {
        state.cupboardWeight = payload.items.reduce((weight: number, item: any) => {
          if (item.type == 'weapon') return (weight += item.weight);
          else return (weight += item.weight * (item.count || 1));
        }, 0);
      } else
        return {
          ...state,
          isCupboard: false,
          items: state.items.filter((item) => item.section != 'cupboard'),
        };
      return {
        ...state,
        isCupboard: !!payload.isCupboard,
        items: [...state.items, ...payload.items],
      };

    case 'SET_FRIDGE':
      if (payload.isFridge) {
        state.fridgeWeight = payload.items.reduce((weight: number, item: any) => {
          if (item.type == 'weapon') return (weight += item.weight);
          else return (weight += item.weight * (item.count || 1));
        }, 0);
      } else
        return {
          ...state,
          isFridge: false,
          items: state.items.filter((item) => item.section != 'fridge'),
        };
      return {
        ...state,
        isFridge: !!payload.isFridge,
        items: [...state.items, ...payload.items],
      };

    case 'SET_WEIGHT':
      state.weight += payload.weight;
      return { ...state };

    case 'SET_DRAGGING':
      state.isDragging = !!payload.isDragging;
      return { ...state };

    case 'DROP_ITEM':
      let item = state.items[payload.id];

      delete item.hide;

      if (payload.toSection == 'trunk' && item.section != 'trunk') {
        if (
          state.items
            .filter((item) => item.section == 'trunk')
            .reduce(
              (weight, item) =>
                item.type == 'weapon'
                  ? (weight += item.weight)
                  : (weight += item.weight * (item.count || 1)),
              0
            ) +
            (item.weight || 0) * (item.type == 'weapon' ? 1 : item.count || 1) >
          state.maxTrunkWeight
        ) {
          return CEF.alert.setAlert('warning', 'Багажник переполнен'), state;
        }
      }
      if (payload.toSection != 'trunk' && item.section == 'trunk') {
        if (
          state.items
            .filter((item) => item.section != 'trunk')
            .reduce(
              (weight, item) =>
                item.type == 'weapon'
                  ? (weight += item.weight)
                  : (weight += item.weight * (item.count || 1)),
              0
            ) +
            (item.weight || 0) * (item.type == 'weapon' ? 1 : item.count || 1) >
          state.maxWeight
        ) {
          return CEF.alert.setAlert('warning', 'Инвентарь переполнен'), state;
        }
      }

      if (payload.toSection == 'clothes' && item.clothGender && item.clothGender != state.floor)
        return CEF.alert.setAlert('warning', 'Вы не можете надеть одежду другого пола'), state;

      let oldItem: any = false;
      if (payload.toSection == 'clothes') {
        oldItem = state.items.find(
          (item) => item.clothIndex == payload.clothIndex && item.index == 0
        );
      } else {
        oldItem = state.items.find(
          (item) => item.section == payload.toSection && item.index == payload.toIndex
        );
      }

      if (oldItem) {
        if (item.section == 'weapon' && item.type == 'hand' && oldItem.type != 'hand')
          return { ...state };
        if (item.section == 'clothes' && oldItem.clothIndex != item.clothIndex) return { ...state };
        if (item.section == 'clothes' && oldItem.clothGender && oldItem.clothGender != state.floor)
          return CEF.alert.setAlert('warning', 'Вы не можете надеть одежду другого пола'), state;
        oldItem.oldSection = oldItem.section;
        oldItem.oldIndex = oldItem.index;
        oldItem.section = item.section;
        oldItem.index = item.index;
      }
      item.oldSection = item.section;
      item.oldIndex = item.index;
      item.section = payload.toSection;
      item.index = payload.toIndex;

      let countedItem;
      if (payload.count) {
        let stacked: any = false;
        let stackSection;
        let stackIndex;
        let cancel = false;
        state.items.map((_item, id) => {
          if (_item.id == item.id && _item.hash != item.hash) {
            if (cancel) return;
            if (_item.count + payload.count > item.max || item.count === false) {
              item.section = item.oldSection;
              item.index = item.oldIndex;
              cancel = true;
              return;
            }
            stacked = { ..._item };
            if (oldItem) {
              stackSection = item.section;
              stackIndex = item.index;
            } else {
              stackSection = _item.section;
              stackIndex = _item.index;
            }
            state.items.splice(id, 1);
          }
        });
        if (cancel)
          return CEF.alert.setAlert('warning', 'Вы не можете переместить этот предмет'), state;
        countedItem = { ...item };
        countedItem.count = item.count - payload.count;
        countedItem.section = item.oldSection;
        countedItem.index = item.oldIndex;
        if (stacked) {
          state.items.find((_item) => item.hash == _item.hash).section = stackSection;
          state.items.find((_item) => item.hash == _item.hash).index = stackIndex;
          item.count = payload.count + stacked.count;
        } else {
          item.count = payload.count;
          state.items.find((_item) => item.hash == _item.hash).section = payload.toSection;
          state.items.find((_item) => item.hash == _item.hash).index = payload.toIndex;
        }
        if (countedItem.count > 0) {
          countedItem.hash = _.random(10000, 99999);
          countedItem.added = true;
          state.items.push(countedItem);
        }
      }

      state.trunkWeight = state.items
        .filter((item) => item.section == 'trunk')
        .reduce(
          (weight, item) =>
            item.type == 'weapon'
              ? (weight += item.weight)
              : (weight += item.weight * (item.count || 1)),
          0
        );
      state.cupboardWeight = state.items
        .filter((item) => item.section == 'cupboard')
        .reduce(
          (weight, item) =>
            item.type == 'weapon'
              ? (weight += item.weight)
              : (weight += item.weight * (item.count || 1)),
          0
        );
      state.fridgeWeight = state.items
        .filter((item) => item.section == 'fridge')
        .reduce(
          (weight, item) =>
            item.type == 'weapon'
              ? (weight += item.weight)
              : (weight += item.weight * (item.count || 1)),
          0
        );
      state.weight = state.items
        .filter((item) => item.section != 'trunk' && item.section != 'cupboard')
        .reduce(
          (weight, item) =>
            item.type == 'weapon'
              ? (weight += item.weight)
              : (weight += item.weight * (item.count || 1)),
          0
        );

      rpc.triggerServer('move', JSON.stringify(state.items));
      delete item.oldSection;
      delete item.oldIndex;
      if (oldItem) {
        delete oldItem.oldSection;
        delete oldItem.oldIndex;
      }
      if (countedItem) {
        delete countedItem.added;
      }
      return { ...state };

    default:
      return { ...state };
  }
};
