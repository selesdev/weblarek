# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Vite

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/main.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
# Интернет-магазин «Web-Larёk»
«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков, где пользователи могут просматривать товары, добавлять их в корзину и оформлять заказы. Сайт предоставляет удобный интерфейс с модальными окнами для просмотра деталей товаров, управления корзиной и выбора способа оплаты, обеспечивая полный цикл покупки с отправкой заказов на сервер.

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter), которая обеспечивает четкое разделение ответственности между классами слоев Model и View. Каждый слой несет свой смысл и ответственность:

Model - слой данных, отвечает за хранение и изменение данных.  
View - слой представления, отвечает за отображение данных на странице.  
Presenter - презентер содержит основную логику приложения и  отвечает за связь представления и данных.

Взаимодействие между классами обеспечивается использованием событийно-ориентированного подхода. Модели и Представления генерируют события при изменении данных или взаимодействии пользователя с приложением, а Презентер обрабатывает эти события используя методы как Моделей, так и Представлений.

### Базовый код

#### Класс Component
Является базовым классом для всех компонентов интерфейса.
Класс является дженериком и принимает в переменной `T` тип данных, которые могут быть переданы в метод `render` для отображения.

Конструктор:  
`constructor(container: HTMLElement)` - принимает ссылку на DOM элемент за отображение, которого он отвечает.

Поля класса:  
`container: HTMLElement` - поле для хранения корневого DOM элемента компонента.

Методы класса:  
`render(data?: Partial<T>): HTMLElement` - Главный метод класса. Он принимает данные, которые необходимо отобразить в интерфейсе, записывает эти данные в поля класса и возвращает ссылку на DOM-элемент. Предполагается, что в классах, которые будут наследоваться от `Component` будут реализованы сеттеры для полей с данными, которые будут вызываться в момент вызова `render` и записывать данные в необходимые DOM элементы.  
`setImage(element: HTMLImageElement, src: string, alt?: string): void` - утилитарный метод для модификации DOM-элементов `<img>`


#### Класс Api
Содержит в себе базовую логику отправки запросов.

Конструктор:  
`constructor(baseUrl: string, options: RequestInit = {})` - В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.

Поля класса:  
`baseUrl: string` - базовый адрес сервера  
`options: RequestInit` - объект с заголовками, которые будут использованы для запросов.

Методы:  
`get(uri: string): Promise<object>` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер  
`post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.  
`handleResponse(response: Response): Promise<object>` - защищенный метод проверяющий ответ сервера на корректность и возвращающий объект с данными полученный от сервера или отклоненный промис, в случае некорректных данных.

#### Класс EventEmitter
Брокер событий реализует паттерн "Наблюдатель", позволяющий отправлять события и подписываться на события, происходящие в системе. Класс используется для связи слоя данных и представления.

Конструктор класса не принимает параметров.

Поля класса:  
`_events: Map<string | RegExp, Set<Function>>)` -  хранит коллекцию подписок на события. Ключи коллекции - названия событий или регулярное выражение, значения - коллекция функций обработчиков, которые будут вызваны при срабатывании события.

Методы класса:  
`on<T extends object>(event: EventName, callback: (data: T) => void): void` - подписка на событие, принимает название события и функцию обработчик.  
`emit<T extends object>(event: string, data?: T): void` - инициализация события. При вызове события в метод передается название события и объект с данными, который будет использован как аргумент для вызова обработчика.  
`trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие с передачей в него данных из второго параметра.

Классы ApiServ
Класс для работы с сервером (API).
Поля: cdn: string – базовый URL для изображений
Методы: getProduct(id: string): Promise<ApiProduct> – получить товар по ID; getProductList(): Promise<ApiProduct[]> – получить список товаров; orderProducts(order: ApiOrderRequest): Promise<ApiOrderResponse> – отправить заказ
Интерфейсы API
IApi
Общий интерфейс для работы с HTTP-запросами.
Поля и методы: baseUrl: string – базовый URL; get<T>(uri: string): Promise<T> – GET-запрос; post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T> – POST/PUT/DELETE-запрос
IApiS
Интерфейс для сервиса с бизнес-логикой работы с товарами и заказами.
Методы: getProductList(): Promise<ApiProduct[]>; getProduct(id: string): Promise<ApiProduct>; orderProducts(order: ApiOrderRequest): Promise<ApiOrderResponse>
Модели данных
ApiProduct
Структура данных товара с сервера.
Поля: id: string; title: string; description: string; price: number | null; image: string; category: ProductCategory
ApiOrderRequest
Данные для создания заказа.
Поля: payment: PaymentMethod; email: string; phone: string; address: string; total: number; items: string[] – массив ID товаро
ApiOrderResponse
Ответ сервера после создания заказа.
Поля: id: string; total: number; 
ApiError
Ошибка API.
Поля: error: string; message?: string;
Корзина IBasketItem
Товар в корзине.
Поля: product: IProduct; quantity: number;
IBasket
Состояние корзины.
Поля items: IBasketItem[]; total: number; count: number;
IBasketModel
Методы работы с корзиной.
Поля: items: Map<string, IBasketItem>
Методы: add(product: IProduct): void; remove(productId: string): void; clear(): void; getTotal(): number; getCount(): number; getItems(): IBasketItem[]; contains(productId: string): boolean;
IBasketView / IBasketItemView
Интерфейсы для отображения корзины и товаров в ней.
Методы: render(...); updateCounter(count: number) (только для корзины)
Заказ IOrder
Данные заказа.
Поля: payment?: PaymentMethod; email?: string; phone?: string; address?: string; items: IBasketItem[]; total: number;
IOrderModel Методы работы с заказом.
Методы: setPayment(payment: PaymentMethod): void; setEmail(email: string): void; setPhone(phone: string): void; setAddress(address: string): void; validateOrder(): boolean; validateContacts(): boolean; clear(): void; getOrderData(items: IBasketItem[], total: number): IOrder; getOrderErrors(): string[]; getContactsErrors(): string[]; getErrors(): string[];;
IOrderForm / IContactsForm / IOrderResult
Формы и результат заказа.
Товары IProduct
Структура товара.
Поля: id: string; title: string; description: string; price: number | null; image: string; category: ProductCategory;
IProductView
Представление товара в UI.
Поля: id, title, description?, price, image, category; button?: { text: string; disabled: boolean }
ICatalog / ICatalogModel / ICatalogView
Каталог товаров и методы для работы с ним.
События
IEvents
Интерфейс системы событий.
Методы: on, emit, off, trigger, onAll, offAll
AppEvent
События приложения: ProductSelected, ProductAddedToBasket, BasketChanged, OrderSubmitted, OrderCompleted, ModalOpened, FormValidated и др.
Views
IComponent / IEventComponent
UI-компоненты.
Методы: render(data?: unknown); events: IEvents (только IEventComponent); IModalView / IFormView / IPageView
Интерфейсы для модальных окон, форм и страниц.

###### Классы
1. Component — базовый абстрактный компонент
Назначение: Основной класс представления. Базовый класс для всех визуальных компонентов, определяет общий интерфейс и методы рендера.
Поля:protected container: HTMLElement — корневой HTML-элемент компонента.
Методы: render(data?: Partial<T>): HTMLElement — возвращает корневой элемент, обновляя состояние; toggleClass(element, className, force?) — переключает CSS-класс; setText(element, value) — обновляет текст; setElementDisabled(element, state) — делает элемент активным/неактивным; setHidden(element) / setVisible(element) — скрытие/отображение; setImage(element, src, alt?) — установка изображения.
События: Не генерирует напрямую.

2. Card — карточка товара
Назначение: Отображает данные о товаре: название, цену, изображение, категорию, кнопки.
Поля: id: string, title: string, image: string, description: string, category: string, price: string, index: number_button: HTMLButtonElement — кнопка действия.
Методы: render(): HTMLElement — отрисовывает карточку;set button({text, disabled}) — управляет кнопкой,
События: через переданный onClick для кнопки или карточки.

3. Basket — корзина
Назначение: Отображает список выбранных товаров и общую сумму.
Поля: items: HTMLElement[] — элементы товаров; total: number — сумма; selected: boolean — доступность кнопки «Оформить».
Методы: set items(value) — обновляет список товаров; set total(value) — обновляет сумму; set selected(value) — включает/выключает кнопку оформления.
События: order:open — пользователь открыл оформление заказа.

4. Form — базовый класс форм
Назначение: Универсальная форма с валидацией.
Поля: valid: boolean — состояние валидности формы; errors: string — ошибки.
Методы: getData(): Record<string, string> — возвращает данные формы; validate(): boolean — проверяет корректность; render(state) — обновляет форму.
События: ${formName}:submit — форма отправлена; ${formName}:change — изменение поля/

5. ContactsForm — форма контактов
Назначение: Форма для ввода email и телефона.
Наследует: Form
Поля: email: string; phone: string.
Методы: геттеры и сеттеры для полей email и phone.
События: унаследованы от Form.

6. OrderForm — форма заказа
Назначение: Первая форма оформления заказа: выбор оплаты и адреса.
Наследует: Form
Поля: _payment: HTMLButtonElement[] — кнопки способов оплаты; address: string — адрес доставки
Методы: set payment(value) — выбор оплаты; setPaymentMethod(method) — визуальное выделение выбранного метода
События: order:payment-change — изменение оплаты

7. Modal — модальное окно
Назначение: Универсальный компонент для модальных окон.
Поля: content: HTMLElement | null — текущий контент; _closeButton: HTMLButtonElement — кнопка закрытия
Методы: open(): void — открыть окно; close(): void — закрыть окно; render(data) — открыть окно с контентом
События: modal:open, modal:close

8. Page — страница
Назначение: Главный контейнер страницы с каталогом и корзиной.
Поля: counter: number — количество товаров в корзине; catalog: HTMLElement[] — список карточек; locked: boolean — блокировка страницы
Методы: showCatalog(items) — отображение каталога; updateCounter(value) — обновление счётчика
События: basket:open — открытие корзины

9. Success — окно успешного заказа
Назначение: Показ успешного оформления заказа и суммы.
Поля: total: number — списанная сумма
Методы: render() — отрисовка окна
События: через переданный onClick для закрытия