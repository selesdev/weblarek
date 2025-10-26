import { IEvents } from './events';

export interface IComponent {
    container: HTMLElement;
    render(data?: unknown): HTMLElement;
}
export interface IModalView {
    content: HTMLElement | null;
    open(content: HTMLElement): void;
    close(): void;
    render(data: { content: HTMLElement }): HTMLElement;
}
export interface IFormView<T = unknown> {
    valid: boolean;
    errors: string[];
    render(data: Partial<T>): HTMLElement;
    validate(): boolean;
    clear(): void;
}
export interface IPageView {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
    render(): HTMLElement;
}
export interface FormState {
    valid: boolean;
    errors: string[];
}
export interface ModalData {
    content: HTMLElement;
}
export interface PageData {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
export interface IPresenter {
    events: IEvents;
    init(): void;
}
export type EventHandler<T = unknown> = (data?: T) => void;
export interface IEventComponent extends IComponent {
    events: IEvents;
}