enum ErrorMessage {
    INVALID_REQUEST = 'Invalid request',
    INVALID_CREDENTIAL = 'Invalid credential',
    INVALID_ACCESS_TOKEN = 'Invalid access token',
    INVALID_REFRESH_TOKEN = 'Invalid refresh token',
    INVALID_EMAIL = 'Invalid email',
    INVALID_PASSWORD = 'Invalid password',
    INVALID_USERNAME = 'Invalid username',
    INVALID_NAME = 'Invalid name',
    INVALID_PHONE = 'Invalid phone',
    INVALID_ROLE = 'Invalid role',
    USER_NOT_FOUND = 'User not found',
    INCORRECT_USERNAME = 'Incorrect Username',
    INCORRECT_PASSWORD = 'Incorrect Password',
    USERNAME_NOT_AVAILABLE = 'Try another username',
    EMAIL_NOT_AVAILABLE = 'Try another email',
    UNKNOWN_ERROR_TRY_AGAIN = 'Unknown error occured. Please try again.',
    REPOSITORY_ERROR_INVALID_ID = 'Invalid id',
    YOU_ARE_NOT_ALLOWED = 'You are not allowed',
}

enum ErrorCode {
    PG_DUPLICATE_VALUE = 23505,
}

export { ErrorMessage, ErrorCode }
