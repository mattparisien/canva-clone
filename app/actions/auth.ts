import { SignupFormSchema, FormState } from '@/app/lib/definitions'
import { authAPI } from '@/app/lib/api'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signup(state: FormState, formData: FormData) {
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Destructure the validated fields
    const { name, email, password } = validatedFields.data

    try {
        // Call the API to register the user
        const { user, token } = await authAPI.register(name, email, password)

            // Store the authentication token in an HTTP-only cookie
            ; (await
                // Store the authentication token in an HTTP-only cookie
                cookies()).set({
                    name: 'auth-token',
                    value: token,
                    httpOnly: true,
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 // 7 days
                })

        // Return success state
        return {
            message: 'Account created successfully!'
        }
    } catch (error) {
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                return {
                    errors: {
                        email: ['This email is already registered. Please use another email or sign in.']
                    }
                }
            }

            // Return generic error message
            return {
                message: error.message || 'Failed to create account. Please try again.'
            }
        }

        // Fallback error message
        return {
            message: 'An unexpected error occurred. Please try again.'
        }
    }
}

export async function redirectToDashboard() {
    redirect('/dashboard')
}