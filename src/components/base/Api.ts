export interface ApiListResponse<T> {
    total: number;
    items: T[];
}

export abstract class Api {
    constructor(protected baseUrl: string, protected options?: RequestInit) {}

    protected get<T>(path: string): Promise<T> {
        return fetch(this.baseUrl + path, { ...this.options })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json() as Promise<T>;
            });
    }

    protected post<T>(path: string, body: any): Promise<T> {
        return fetch(this.baseUrl + path, {
            ...this.options,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json() as Promise<T>;
        });
    }
}
