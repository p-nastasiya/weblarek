import { ensureElement } from '../../../utils/utils'
import { BaseCardView, IBaseCard } from './BaseCardView'
import { IEvents } from '../../base/Events'
import { CDN_URL, categoryMap } from '../../../utils/constants';

export interface IProductCard extends IBaseCard {
	category?: string;
	image?: string;
}

export class ProductCardView<T extends IProductCard = IProductCard> extends BaseCardView<T> {
	protected imageElement: HTMLImageElement;
	protected categoryElement: HTMLElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(container);

		this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
		this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
	}

	set category(value: string) {
		this.setText(this.categoryElement, value);
		this.categoryElement.className = `card__category ${categoryMap[value as keyof typeof categoryMap] || 'card__category_other'}`;
	}

	set image(value: string) {
		this.setImage(this.imageElement, CDN_URL + value, this.title);
	}

}