export class ModalView {
  private modal: HTMLElement;
  private contentContainer: HTMLElement;

  constructor(modalSelector: string) {
    const modalEl = document.querySelector<HTMLElement>(modalSelector);
    if (!modalEl) throw new Error(`Модалка ${modalSelector} не найдена`);
    this.modal = modalEl;

    // Создаём контейнер для контента, если его нет в HTML
    let contentEl = this.modal.querySelector<HTMLElement>('.modal-content');
    if (!contentEl) {
      contentEl = document.createElement('div');
      contentEl.className = 'modal-content';
      this.modal.appendChild(contentEl);
    }
    this.contentContainer = contentEl;

    // Клик по фону закрывает модалку
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Добавляем кнопку закрытия, если есть
    const closeBtn = this.modal.querySelector<HTMLElement>('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());
  }

  public open(content: HTMLElement): void {
    this.contentContainer.innerHTML = '';
    this.contentContainer.appendChild(content);
    this.modal.style.display = 'flex';
  }

  public close(): void {
    this.modal.style.display = 'none';
    this.contentContainer.innerHTML = '';
  }
}
