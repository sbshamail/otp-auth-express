export const message = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',

  //========= WARNING ======
  ACTIVATION_MESSAGE: 'Connect With admin for Activation of Account',

  //========= Success ==========
  USER_LOGIN_SUCCESS: 'Success! You are logged in.',
  USER_REGISTER_SUCCESS: 'User Register Successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  NEW_PASSWORD_SET_SUCCESS: 'New password successfully changed.',
  FORGOT_EMAIL_SENT_SUCCESS: 'Forget password email sent.',
  PROFILE_UPDATE_SUCCESS: 'Updated Successfully',

  UPDATED_SUCCESS: 'Record updated successfully',
  INSERT_SUCCESS: 'Insert data successfully',
  DELETE_SUCCESS: 'Delete data successully',
  UNDO_SUCCESS: 'Data Restore Successfully',

  //====== Error ======

  EMAIL_DUPLICATE: 'Email Already use. kindly try with some other email',
  STATUS_BLOCK: 'your account status is block kindly contact with admin',
  CONNECTIVITY_ERROR:
    'Some error occur while connecting the server kindly contact with admin',
  EMAIL_PASSWORD_ERROR: 'Email/Password incorrect',
  PASSWORD_RESET_ERROR: 'Unable to change your password. Try Again',
  OLD_PASSWORD_ERROR: 'Incorrect old password',
  FORGOT_PASSWORD_EMAIL_ERROR: 'Unable to send forget password email. Please try again',
  NO_SUCH_EMAIL: 'Email not found',
  REQUEST_EXPIRED: 'Link for password reset has expired',
  GET_ERROR:
    'Something wrong, refresh the page and remove browser cache or contact Admin',
  BAD_REQUEST: 'BAD REQUEST, Not Found'
};
// Define a type alias for the static methods of the `Operation` class
export type MessageType = typeof message;
