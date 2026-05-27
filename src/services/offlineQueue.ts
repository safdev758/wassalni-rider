import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'offline_request_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface QueuedRequest {
    id: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    timestamp: number;
    retryCount: number;
}

class OfflineQueue {
    private queue: QueuedRequest[] = [];
    private processing = false;
    private initialized = false;

    async initialize() {
        if (this.initialized) return;

        try {
            const stored = await AsyncStorage.getItem(QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
                // Remove expired items
                const now = Date.now();
                this.queue = this.queue.filter(item => now - item.timestamp < MAX_AGE_MS);
            }
            this.initialized = true;

            // Start processing when online
            NetInfo.addEventListener(state => {
                if (state.isConnected) {
                    this.processQueue();
                }
            });
        } catch (error) {
            console.error('[OfflineQueue] Failed to initialize:', error);
        }
    }

    async enqueue(url: string, method: string, headers: Record<string, string>, body?: string): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // Don't queue GET requests or if queue is full
        if (method === 'GET' || this.queue.length >= MAX_QUEUE_SIZE) {
            return;
        }

        const request: QueuedRequest = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url,
            method,
            headers,
            body,
            timestamp: Date.now(),
            retryCount: 0,
        };

        this.queue.push(request);
        await this.persist();

        // Try to process immediately if online
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
            this.processQueue();
        }
    }

    async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        try {
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                this.processing = false;
                return;
            }

            const itemsToProcess = [...this.queue];

            for (const item of itemsToProcess) {
                try {
                    const response = await fetch(item.url, {
                        method: item.method,
                        headers: item.headers,
                        body: item.body,
                    });

                    if (response.ok) {
                        // Success - remove from queue
                        this.queue = this.queue.filter(q => q.id !== item.id);
                        console.log('[OfflineQueue] Successfully processed:', item.url);
                    } else if (response.status >= 400 && response.status < 500) {
                        // Client error - don't retry
                        this.queue = this.queue.filter(q => q.id !== item.id);
                        console.warn('[OfflineQueue] Client error, removing:', item.url, response.status);
                    } else {
                        // Server error - retry later
                        item.retryCount++;
                        if (item.retryCount >= 3) {
                            // Max retries reached
                            this.queue = this.queue.filter(q => q.id !== item.id);
                            console.warn('[OfflineQueue] Max retries reached:', item.url);
                        }
                    }
                } catch (error) {
                    // Network error - keep in queue
                    console.warn('[OfflineQueue] Network error, will retry:', item.url, error);
                    item.retryCount++;
                    if (item.retryCount >= 3) {
                        this.queue = this.queue.filter(q => q.id !== item.id);
                    }
                }
            }

            await this.persist();
        } finally {
            this.processing = false;
        }
    }

    private async persist(): Promise<void> {
        try {
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('[OfflineQueue] Failed to persist:', error);
        }
    }

    async clear(): Promise<void> {
        this.queue = [];
        await AsyncStorage.removeItem(QUEUE_KEY);
    }

    getQueueSize(): number {
        return this.queue.length;
    }
}

export const offlineQueue = new OfflineQueue();
