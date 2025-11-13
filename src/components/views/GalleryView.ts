import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ProductCardView } from "./Card/ProductCardView";
import { IProduct } from "../../types";
import { ProductModel } from "../models/ProductModel";

interface IGallery {
	items: IProduct[];
}

export class GalleryView extends Component<IGallery> {
	constructor(protected events: IEvents, container: HTMLElement, protected productModel: ProductModel) {
		super(container);
	}

	set items(products: IProduct[]) {
		const productElements = products.map((product) => {
			return this.createProductCard(product);
		});
		this.container.replaceChildren(...productElements);
	}

	// Приватный метод для создания карточки товара
	private createProductCard(product: IProduct): HTMLElement {
		// Создаем карточку из шаблона
		const template = document.getElementById('card-catalog') as HTMLTemplateElement;
		const cardElement = template.content.cloneNode(true) as DocumentFragment;
		const cardContainer = cardElement.firstElementChild as HTMLElement;

		// Создаем представление карточки
		const cardView = new ProductCardView(this.events, cardContainer);
		cardView.render(product);

		// Добавляем обработчик клика для открытия деталей товара
		cardContainer.addEventListener('click', () => {
			console.log('Выбран товар:', product.title);
			// Сохраняем выбранный товар в модели
			// this.productModel.setSelectedProduct(product);
			this.events.emit('card:select', { product });
		});

		return cardContainer;
	}

	// Можно добавить дополнительные методы
	clear() {
		this.container.innerHTML = '';
	}

	showEmptyMessage() {
		this.container.innerHTML = '<p>Товары не найдены</p>';
	}
}