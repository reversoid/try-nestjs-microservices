export interface DomainEvent {
    topic: string;
    data: unknown;
}