import { ItemsCollection, UIMenuListItem } from "..";
import UIMenuItem from '../items/UIMenuItem';

interface ILiteEvent {
	on(handler: { (...args: any[]): void }): void;
	off(handler: { (...args: any[]): void }): void;
}

export default class LiteEvent implements ILiteEvent {
	handlers: { (...args: any[]): void }[] = [];

	public on(handler: { (index:number, ...args: any[]): void }): void {
		this.handlers.push(handler);
	}

	public off(handler: { (...args: any[]): void }): void {
		this.handlers = this.handlers.filter(h => h !== handler);
	}

	public emit(...args: any[]) {
		this.handlers.slice(0).forEach(h => h(...args));
	}

	public expose(): ILiteEvent {
		return this;
	}
}

export class CheckboxChangeEvent extends LiteEvent {
	// @ts-ignore
	public on(handler: { (item:UIMenuItem, checked:boolean): void }): void {
		this.handlers.push(handler);
	}
}
export class ItemSelectEvent extends LiteEvent {
	// @ts-ignore
	public on(handler: { (item:UIMenuItem, id:number): void }): void {
		this.handlers.push(handler);
	}
}
export class ListChangeEvent {
	handlers: { (...args: any[]): void }[] = [];
	public on(handler: { (item:UIMenuListItem, id:number): void }): void {
		this.handlers.push(handler);
	}
	public off(handler: { (...args: any[]): void }): void {
		this.handlers = this.handlers.filter(h => h !== handler);
	}

	public emit(...args: any[]) {
		this.handlers.slice(0).forEach(h => h(...args));
	}

	public expose(): ILiteEvent {
		return this;
	}
}
