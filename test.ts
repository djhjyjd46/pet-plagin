class SimpleApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://jsonplaceholder.typicode.com';
    }

    public async users() {
        const response = await fetch(`${this.baseUrl}/users`);
        const data = await response.json();
        return data;
    }   
    
    public async posts() {
        const response = await fetch(`${this.baseUrl}/posts`);
        const data = await response.json();
        return data;
    }
}


const api = new SimpleApi();
const users = api.