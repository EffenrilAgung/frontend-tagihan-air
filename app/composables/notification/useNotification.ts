import { toast } from 'vue-sonner'

/**
 * Reusable notification composable using vue-sonner.
 * Provides consistent toast notifications across the application.
 */
export function useNotification() {
    /**
     * Show a success toast notification.
     * @param message - The success message to display
     * @param description - Optional description for additional context
     */
    const notifySuccess = (message: string, description?: string) => {
        toast.success(message, {
            description,
            duration: 4000,
        })
    }

    /**
     * Show an error toast notification.
     * @param message - The error message to display
     * @param description - Optional description for additional context
     */
    const notifyError = (message: string, description?: string) => {
        toast.error(message, {
            description,
            duration: 5000,
        })
    }

    /**
     * Show a warning toast notification.
     * @param message - The warning message to display
     * @param description - Optional description for additional context
     */
    const notifyWarning = (message: string, description?: string) => {
        toast.warning(message, {
            description,
            duration: 4000,
        })
    }

    /**
     * Show an info toast notification.
     * @param message - The info message to display
     * @param description - Optional description for additional context
     */
    const notifyInfo = (message: string, description?: string) => {
        toast.info(message, {
            description,
            duration: 4000,
        })
    }

    /**
     * Handle API validation errors (422) by displaying them as toast notifications.
     * Shows general message + each field-specific validation error.
     *
     * @param error - The error object thrown from useApi (with status, message, errors fields)
     * @param fallbackMessage - Fallback message if no error message is available
     */
    const handleValidationError = (
        error: any,
        fallbackMessage: string = 'Terjadi kesalahan saat menyimpan data'
    ) => {
        const message = error?.message || fallbackMessage
        const errors = error?.errors as Record<string, string[]> | null

        if (errors && Object.keys(errors).length > 0) {
            // Collect all field error messages
            const fieldErrors: string[] = []
            for (const [, messages] of Object.entries(errors)) {
                if (Array.isArray(messages)) {
                    fieldErrors.push(...messages)
                }
            }

            if (fieldErrors.length > 0) {
                toast.error(message, {
                    description: fieldErrors.join('\n'),
                    duration: 6000,
                })
                return
            }
        }

        toast.error(message, {
            duration: 5000,
        })
    }

    /**
     * Handle general API errors by displaying as toast notifications.
     * Parses different error shapes and shows appropriate messages.
     *
     * @param error - The error object caught from API calls
     * @param fallbackMessage - Fallback message if error can't be parsed
     */
    const handleApiError = (
        error: any,
        fallbackMessage: string = 'Terjadi kesalahan pada server'
    ) => {
        // Check for 422 validation errors
        if (error?.status === 422) {
            handleValidationError(error, fallbackMessage)
            return
        }

        // Network or other errors
        const message = error instanceof Error
            ? error.message
            : error?.message || fallbackMessage

        toast.error(message, {
            duration: 5000,
        })
    }

    return {
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
        handleValidationError,
        handleApiError,
        toast, // expose raw toast for advanced usage
    }
}
