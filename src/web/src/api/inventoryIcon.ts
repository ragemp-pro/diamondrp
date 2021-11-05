import {
  itemsUtil,
} from '../../../util/inventory';

export let iconsItems:string[] = [];
itemsUtil.map((item, index) => {
  iconsItems.push(require(`../icons/Item_${index}.png`))
})