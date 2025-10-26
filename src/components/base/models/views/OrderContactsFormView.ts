import { FormView } from "./FormView";

export class OrderContactsFormView extends FormView {
    render(): HTMLElement {
        return this.form;
    }

    validate(): boolean {
        return true;
    }
}