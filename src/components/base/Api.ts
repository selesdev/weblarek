import { API_URL } from '../../utils/constants';

export class Api {
  constructor(private baseUrl: string = API_URL) {}

  private handleResponse(res: Response) {
    if (!res.ok) {
      return res.json().then(err => {
        throw new Error(JSON.stringify(err));
      });
    }
    return res.json();
  }

  // Generic метод get
  get<T>(endpoint: string): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`)
      .then(res => this.handleResponse(res));
  }

  // Generic метод post
  post<T>(endpoint: string, data: object): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => this.handleResponse(res));
  }
}
