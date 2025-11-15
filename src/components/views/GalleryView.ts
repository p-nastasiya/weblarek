import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ProductModel } from "../models/ProductModel";

interface IGallery {
	items: HTMLElement[];
}

export class GalleryView extends Component<IGallery> {
	constructor(protected events: IEvents, container: HTMLElement, protected productModel: ProductModel) {
		super(container);
	}

	set items(cards: HTMLElement[]) {
		this.container.replaceChildren(...cards);
	}

	clear() {
		this.container.innerHTML = '';
	}

	showEmptyMessage() {
		this.container.innerHTML = '<p>Товары не найдены</p>';
	}
}