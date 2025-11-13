import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/Events';
import { IProductCard, ProductCardView } from './ProductCardView';

// НЕПРАВИЛЬНО - дублирование полей
interface IProductPreview extends IProductCard {
	description: string;
	buttonText: string;
	inBasket: boolean;
}

export class ProductPreviewView extends ProductCardView<IProductPreview> {
	setButtonText(text: string) {
		this.setText(this.buttonElement, text);
	}
	protected descriptionElement: HTMLElement;
	protected buttonElement: HTMLButtonElement;

	constructor(protected events: IEvents, container: HTMLElement) {
		super(events, container);

		this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
		this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);

		this.buttonElement.addEventListener('click', () => {
			this.events.emit('product:toggle-cart', { id: this.id });
		});
	}

	set description(value: string) {
		const descriptionElement = this.container.querySelector('.card__text');
		if (descriptionElement) {
			descriptionElement.textContent = value;
		}
	}

	set inBasket(value: boolean) {
		const buttonText = value ? 'Удалить из корзины' : 'В корзину';
		this.setText(this.buttonElement, buttonText);
	}

	// Дополнительные методы для превью
	setButtonDisabled(state: boolean) {
		this.setDisabled(this.buttonElement, state);
	}

}