export interface ResponseWithServer<T> {
    success: boolean
    message: string
    data?: T
}