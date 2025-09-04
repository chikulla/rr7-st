interface ApiConfig {
    baseUrl: string;
}

export class Api {
    private config: ApiConfig;

    constructor(config?: Partial<ApiConfig>) {
        this.config = {
            baseUrl: this.determineBaseUrl(),
            ...config
        };
    }

    private determineBaseUrl(): string {
        // Priority: 1. Environment variable, 2. Same origin with port 3000, 3. localhost fallback
        if (typeof process !== 'undefined' && process.env?.API_BASE_URL) {
            return process.env.API_BASE_URL;
        }

        if (typeof window !== 'undefined') {
            // In browser, try to use same origin with port 3000
            const { protocol, hostname } = window.location;
            return `${protocol}//${hostname}:3000`;
        }

        // Fallback for server-side rendering
        return "http://localhost:3000";
    }

    async get(endpoint: string) {
        try {
            const url = `${this.config.baseUrl}${endpoint}`;
            console.log(`API GET: ${url}`); // Helpful for debugging different environments

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API GET ${endpoint} failed:`, error);
            throw error;
        }
    }

    async put(endpoint: string, data: any) {
        try {
            const url = `${this.config.baseUrl}${endpoint}`;
            console.log(`API PUT: ${url}, ${data}`); // Helpful for debugging different environments

            const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API PUT ${endpoint} failed:`, error);
            throw error;
        }
    }

    // Method to update base URL at runtime if needed
    setBaseUrl(baseUrl: string) {
        this.config.baseUrl = baseUrl;
    }

    getBaseUrl() {
        return this.config.baseUrl;
    }
}

// Create a singleton instance
export const api = new Api();