const emailTemplates = {
  email_templates: [
    {
      name: 'Activate donor',
      type: 'Admin',
      subject:
        "Thank You, ${FirstName}! You're Now an Active Donor for ${ClientName}",
      content:
        "<p>Dear ${FirstName} ${LastName},</p><p>We're thrilled to welcome you as an active donor for ${ClientName}. Your generous contribution will make a meaningful difference. If you have any questions or need assistance, please don't hesitate to reach out to us at ${PhoneNumber}. Your password for accessing your donor account is ${Password}.</p><p>Thank you for your support!</p><p>Best regards,&nbsp;<br>Degree37</p>",
      variables:
        '${FirstName},${LastName},${ClientName},${PhoneNumber},${Password}',
    },
    {
      name: 'Add appointment',
      type: 'Admin',
      subject: 'Appointment Added: ${FirstName} ${LastName} - ${ClientName}',
      content:
        '<p>Hello ${FirstName} ${LastName}, an appointment has been scheduled with ${ClientName} on ${appointmentDate} at ${appointmentTime} (${timeZone}). Your details:</p><ul><li>Username: ${UserName}</li><li>Phone Number: ${PhoneNumber}</li><li>Resource: ${ResourceName}</li></ul>',
      variables:
        '${FirstName},${LastName},${ClientName},${appointmentDate},${appointmentTime},${timeZone},${UserName},${PhoneNumber},${ResourceName}',
    },
    {
      name: 'Admin create donor',
      type: 'Admin',
      subject:
        'Donor Account Created Successfully for ${FirstName} ${LastName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are pleased to inform you that an account has been successfully created for you as a donor with ${ClientName}. Your login credentials are as follows:</p><ul><li>Username: ${UserName}</li><li>Temporary Password: ${OTP}</li></ul><p>Please log in at your earliest convenience using the provided credentials. Your account will expire on ${ExpiryDate}. Should you have any questions or require assistance, feel free to contact us.</p><p>Best regards,&nbsp;<br>Degree37</p>',
      variables:
        '${FirstName},${LastName},${OTP},${ClientName},${PhoneNumber},${UserName},${Email},${RequestedDateTime},${ExpiryDate}',
    },
    {
      name: 'Cancel appointment',
      type: 'Admin',
      subject: 'Appointment Cancelled for ${ClientName} - ${appointmentDate}',
      content:
        '<p>Dear ${ClientName},</p><p>We regret to inform you that your appointment scheduled with ${ResourceName} on ${appointmentDate} at ${appointmentTime} has been cancelled. We apologize for any inconvenience this may cause.</p><p>Best regards,<br>${UserName}</p>',
      variables:
        '${ClientName},${UserName},${appointmentDate},${appointmentTime},${ResourceName}',
    },
    {
      name: 'Create new admin user',
      type: 'Admin',
      subject: 'New Admin User Created for ${ClientName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are pleased to inform you that a new admin user has been created for ${ClientName}. Below are the login details:</p><p>Username: ${UserName}&nbsp;<br>Email: ${Email}&nbsp;<br>Phone Number: ${PhoneNumber}</p><p>Please use the following password to log in: ${Password}</p><p>If you have any questions or need further assistance, feel free to reach out.</p><p>Best regards,<br>Degree37</p>',
      variables:
        '${FirstName},${LastName},${ClientName},${UserName},${PhoneNumber},${Email},${Password}',
    },
    {
      name: 'Create new client',
      type: 'Admin',
      subject: 'New Client Created: ${FirstName} ${LastName}',
      content:
        '<p>Dear Team,</p><p>We are pleased to inform you that a new client, ${ClientName}, has been successfully added to our system. Please welcome them warmly to our community.</p><p>Username for the client: ${UserName}</p><p>Best regards,<br>Degree37</p>',
      variables: '${FirstName},${LastName},${ClientName},${UserName}',
    },
    {
      name: 'Create new donor',
      type: 'Admin',
      subject:
        'Welcome ${FirstName} ${LastName} as a New Donor for ${ClientName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are thrilled to welcome you as a new donor for ${ClientName}. Thank you for your generosity and support. Your contribution means a lot to us and will make a significant difference in our mission.</p><p>If you have any questions or need assistance, feel free to contact us at ${PhoneNumber}.</p><p>Warm regards,<br>Degree37</p>',
      variables:
        '${FirstName},${LastName},${ClientName},${PhoneNumber},${ClientName}',
    },
    {
      name: 'Modify appointment',
      type: 'Admin',
      subject: 'Regarding Modification of Your Appointment',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We regret to inform you that there has been a modification to your appointment with ${ClientName} scheduled for ${appointmentDate} at ${appointmentTime} (${timeZone}).&nbsp;<br>Your understanding is greatly appreciated.</p><p>Kind regards,<br>${UserName}</p>',
      variables:
        '${FirstName},${LastName},${ClientName},${appointmentDate},${appointmentTime},${timeZone},${UserName},${PhoneNumber},${ResourceName}',
    },
    {
      name: 'Reset password for admin user',
      type: 'Admin',
      subject: 'Password Reset Request for ${UserName}',
      content:
        '<p>Dear ${ClientName},</p><p>A password reset request was made for the admin user ${UserName} on your account. Please use the following information for verification:</p><ul><li>Requested Date &amp; Time: ${RequestedDateTime}</li><li>Expiry Date: ${ExpiryDate}</li><li>Secure Email Address: ${secureEmail}</li><li>One-Time Passcode (OTP): ${OTP}</li></ul><p>If you did not initiate this request or need further assistance, please contact us immediately at ${PhoneNumber}.</p><p>Best regards,<br>Degree37</p>',
      variables:
        '${UserName},${ClientName},${PhoneNumber},${RequestedDateTime},${ExpiryDate},${secureEmail},${OTP}',
    },
    {
      name: 'Reset password for donor',
      type: 'Admin',
      subject: 'Password Reset Request for Donor Account',
      content:
        "<p>Dear ${UserName},</p><p>You've recently requested to reset your password for your donor account with ${ClientName}. Your request was received on ${RequestedDateTime}. Please follow the link provided in the secure email sent to ${secureEmail} to proceed with the password reset. This link will expire on ${ExpiryDate}.<br>If you encounter any issues, feel free to contact us at ${PhoneNumber}.</p><p>Thank you,<br>Degree37</p>",
      variables:
        '${UserName},${RequestedDateTime},${ExpiryDate},${secureEmail},${OTP},${ClientName},${PhoneNumber}',
    },
    {
      name: 'Activate donor',
      type: 'Donor',
      subject:
        "Thank You, ${FirstName}! You're Now an Active Donor for ${ClientName}",
      content:
        "<p>Dear ${FirstName} ${LastName},</p><p>We're thrilled to welcome you as an active donor for ${ClientName}. Your generous contribution will make a meaningful difference. If you have any questions or need assistance, please don't hesitate to reach out to us at ${PhoneNumber}. Your password for accessing your donor account is ${Password}.</p><p>Thank you for your support!</p><p>Best regards,&nbsp;<br>Degree37</p>",
      variables:
        '${FirstName},${LastName},${ClientName},${PhoneNumber},${Password}',
    },
    {
      name: 'Add appointment',
      type: 'Donor',
      subject: 'Appointment Added: ${FirstName} ${LastName} - ${ClientName}',
      content:
        '<p>Hello ${FirstName} ${LastName}, an appointment has been scheduled with ${ClientName} on ${appointmentDate} at ${appointmentTime} (${timeZone}). Your details:</p><ul><li>Username: ${UserName}</li><li>Phone Number: ${PhoneNumber}</li><li>Resource: ${ResourceName}</li></ul>',
      variables:
        '${FirstName},${LastName},${ClientName},${appointmentDate},${appointmentTime},${timeZone},${UserName},${PhoneNumber},${ResourceName}',
    },
    {
      name: 'Admin create donor',
      type: 'Donor',
      subject:
        'Donor Account Created Successfully for ${FirstName} ${LastName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are pleased to inform you that an account has been successfully created for you as a donor with ${ClientName}. Your login credentials are as follows:</p><ul><li>Username: ${UserName}</li><li>Temporary Password: ${OTP}</li></ul><p>Please log in at your earliest convenience using the provided credentials. Your account will expire on ${ExpiryDate}. Should you have any questions or require assistance, feel free to contact us.</p><p>Best regards,&nbsp;<br>Degree37</p>',
      variables:
        '${FirstName},${LastName},${OTP},${ClientName},${PhoneNumber},${UserName},${Email},${RequestedDateTime},${ExpiryDate}',
    },
    {
      name: 'Cancel appointment',
      type: 'Donor',
      subject: 'Appointment Cancelled for ${ClientName} - ${appointmentDate}',
      content:
        '<p>Dear ${ClientName},</p><p>We regret to inform you that your appointment scheduled with ${ResourceName} on ${appointmentDate} at ${appointmentTime} has been cancelled. We apologize for any inconvenience this may cause.</p><p>Best regards,<br>${UserName}</p>',
      variables:
        '${ClientName},${UserName},${appointmentDate},${appointmentTime},${ResourceName}',
    },
    {
      name: 'Create new admin user',
      type: 'Donor',
      subject: 'New Admin User Created for ${ClientName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are pleased to inform you that a new admin user has been created for ${ClientName}. Below are the login details:</p><p>Username: ${UserName}&nbsp;<br>Email: ${Email}&nbsp;<br>Phone Number: ${PhoneNumber}</p><p>Please use the following password to log in: ${Password}</p><p>If you have any questions or need further assistance, feel free to reach out.</p><p>Best regards,<br>Degree37</p>',
      variables:
        '${FirstName},${LastName},${ClientName},${UserName},${PhoneNumber},${Email},${Password}',
    },
    {
      name: 'Create new client',
      type: 'Donor',
      subject: 'New Client Created: ${FirstName} ${LastName}',
      content:
        '<p>Dear Team,</p><p>We are pleased to inform you that a new client, ${ClientName}, has been successfully added to our system. Please welcome them warmly to our community.</p><p>Username for the client: ${UserName}</p><p>Best regards,<br>Degree37</p>',
      variables: '${FirstName},${LastName},${ClientName},${UserName}',
    },
    {
      name: 'Create new donor',
      type: 'Donor',
      subject:
        'Welcome ${FirstName} ${LastName} as a New Donor for ${ClientName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are thrilled to welcome you as a new donor for ${ClientName}. Thank you for your generosity and support. Your contribution means a lot to us and will make a significant difference in our mission.</p><p>If you have any questions or need assistance, feel free to contact us at ${PhoneNumber}.</p><p>Warm regards,<br>Degree37</p>',
      variables:
        '${FirstName},${LastName},${ClientName},${PhoneNumber},${ClientName}',
    },
    {
      name: 'Modify appointment',
      type: 'Donor',
      subject: 'Regarding Modification of Your Appointment',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We regret to inform you that there has been a modification to your appointment with ${ClientName} scheduled for ${appointmentDate} at ${appointmentTime} (${timeZone}).&nbsp;<br>Your understanding is greatly appreciated.</p><p>Kind regards,<br>${UserName}</p>',
      variables:
        '${FirstName},${LastName},${ClientName},${appointmentDate},${appointmentTime},${timeZone},${UserName},${PhoneNumber},${ResourceName}',
    },
    {
      name: 'Reset password for admin user',
      type: 'Donor',
      subject: 'Password Reset Request for ${UserName}',
      content:
        '<p>Dear ${ClientName},</p><p>A password reset request was made for the admin user ${UserName} on your account. Please use the following information for verification:</p><ul><li>Requested Date &amp; Time: ${RequestedDateTime}</li><li>Expiry Date: ${ExpiryDate}</li><li>Secure Email Address: ${secureEmail}</li><li>One-Time Passcode (OTP): ${OTP}</li></ul><p>If you did not initiate this request or need further assistance, please contact us immediately at ${PhoneNumber}.</p><p>Best regards,<br>Degree37</p>',
      variables:
        '${UserName},${ClientName},${PhoneNumber},${RequestedDateTime},${ExpiryDate},${secureEmail},${OTP}',
    },
    {
      name: 'Reset password for donor',
      type: 'Donor',
      subject: 'Password Reset Request for Donor Account',
      content:
        "<p>Dear ${UserName},</p><p>You've recently requested to reset your password for your donor account with ${ClientName}. Your request was received on ${RequestedDateTime}. Please follow the link provided in the secure email sent to ${secureEmail} to proceed with the password reset. This link will expire on ${ExpiryDate}.<br>If you encounter any issues, feel free to contact us at ${PhoneNumber}.</p><p>Thank you,<br>Degree37</p>",
      variables:
        '${UserName},${RequestedDateTime},${ExpiryDate},${secureEmail},${OTP},${ClientName},${PhoneNumber}',
    },
    {
      name: 'Activate donor',
      type: 'Staff',
      subject:
        "Thank You, ${FirstName}! You're Now an Active Donor for ${ClientName}",
      variables:
        '${FirstName},${LastName},${ClientName},${PhoneNumber},${Password}',
      content:
        "<p>Dear ${FirstName} ${LastName},</p><p>We're thrilled to welcome you as an active donor for ${ClientName}. Your generous contribution will make a meaningful difference. If you have any questions or need assistance, please don't hesitate to reach out to us at ${PhoneNumber}. Your password for accessing your donor account is ${Password}.</p><p>Thank you for your support!</p><p>Best regards,&nbsp;<br>Degree37</p>",
    },
    {
      name: 'Add appointment',
      type: 'Staff',
      subject: 'Appointment Added: ${FirstName} ${LastName} - ${ClientName}',
      variables:
        '${FirstName},${LastName},${ClientName},${appointmentDate},${appointmentTime},${timeZone},${UserName},${PhoneNumber},${ResourceName}',
      content:
        '<p>Hello ${FirstName} ${LastName}, an appointment has been scheduled with ${ClientName} on ${appointmentDate} at ${appointmentTime} (${timeZone}). Your details:</p><ul><li>Username: ${UserName}</li><li>Phone Number: ${PhoneNumber}</li><li>Resource: ${ResourceName}</li></ul>',
    },
    {
      name: 'Admin create donor',
      type: 'Staff',
      subject:
        'Donor Account Created Successfully for ${FirstName} ${LastName}',
      variables:
        '${FirstName},${LastName},${OTP},${ClientName},${PhoneNumber},${UserName},${Email},${RequestedDateTime},${ExpiryDate}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are pleased to inform you that an account has been successfully created for you as a donor with ${ClientName}. Your login credentials are as follows:</p><ul><li>Username: ${UserName}</li><li>Temporary Password: ${OTP}</li></ul><p>Please log in at your earliest convenience using the provided credentials. Your account will expire on ${ExpiryDate}. Should you have any questions or require assistance, feel free to contact us.</p><p>Best regards,&nbsp;<br>Degree37</p>',
    },
    {
      name: 'Cancel appointment',
      type: 'Staff',
      subject: 'Appointment Cancelled for ${ClientName} - ${appointmentDate}',
      variables:
        '${ClientName},${UserName},${appointmentDate},${appointmentTime},${ResourceName}',
      content:
        '<p>Dear ${ClientName},</p><p>We regret to inform you that your appointment scheduled with ${ResourceName} on ${appointmentDate} at ${appointmentTime} has been cancelled. We apologize for any inconvenience this may cause.</p><p>Best regards,<br>${UserName}</p>',
    },
    {
      name: 'Create new admin user',
      type: 'Staff',
      subject: 'New Admin User Created for ${ClientName}',
      variables:
        '${FirstName},${LastName},${ClientName},${UserName},${PhoneNumber},${Email},${Password}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are pleased to inform you that a new admin user has been created for ${ClientName}. Below are the login details:</p><p>Username: ${UserName}&nbsp;<br>Email: ${Email}&nbsp;<br>Phone Number: ${PhoneNumber}</p><p>Please use the following password to log in: ${Password}</p><p>If you have any questions or need further assistance, feel free to reach out.</p><p>Best regards,<br>Degree37</p>',
    },
    {
      name: 'Create new client',
      type: 'Staff',
      subject: 'New Client Created: ${FirstName} ${LastName}',
      variables: '${FirstName},${LastName},${ClientName},${UserName}',
      content:
        '<p>Dear Team,</p><p>We are pleased to inform you that a new client, ${ClientName}, has been successfully added to our system. Please welcome them warmly to our community.</p><p>Username for the client: ${UserName}</p><p>Best regards,<br>Degree37</p>',
    },
    {
      name: 'Create new donor',
      type: 'Staff',
      subject:
        'Welcome ${FirstName} ${LastName} as a New Donor for ${ClientName}',
      variables:
        '${FirstName},${LastName},${ClientName},${PhoneNumber},${ClientName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We are thrilled to welcome you as a new donor for ${ClientName}. Thank you for your generosity and support. Your contribution means a lot to us and will make a significant difference in our mission.</p><p>If you have any questions or need assistance, feel free to contact us at ${PhoneNumber}.</p><p>Warm regards,<br>Degree37</p>',
    },
    {
      name: 'Modify appointment',
      type: 'Staff',
      subject: 'Regarding Modification of Your Appointment',
      variables:
        '${FirstName},${LastName},${ClientName},${appointmentDate},${appointmentTime},${timeZone},${UserName},${PhoneNumber},${ResourceName}',
      content:
        '<p>Dear ${FirstName} ${LastName},</p><p>We regret to inform you that there has been a modification to your appointment with ${ClientName} scheduled for ${appointmentDate} at ${appointmentTime} (${timeZone}).&nbsp;<br>Your understanding is greatly appreciated.</p><p>Kind regards,<br>${UserName}</p>',
    },
    {
      name: 'Reset password for admin user',
      type: 'Staff',
      subject: 'Password Reset Request for ${UserName}',
      variables:
        '${UserName},${ClientName},${PhoneNumber},${RequestedDateTime},${ExpiryDate},${secureEmail},${OTP}',
      content:
        '<p>Dear ${ClientName},</p><p>A password reset request was made for the admin user ${UserName} on your account. Please use the following information for verification:</p><ul><li>Requested Date &amp; Time: ${RequestedDateTime}</li><li>Expiry Date: ${ExpiryDate}</li><li>Secure Email Address: ${secureEmail}</li><li>One-Time Passcode (OTP): ${OTP}</li></ul><p>If you did not initiate this request or need further assistance, please contact us immediately at ${PhoneNumber}.</p><p>Best regards,<br>Degree37</p>',
    },
    {
      name: 'Reset password for donor',
      type: 'Staff',
      subject: 'Password Reset Request for Donor Account',
      variables:
        '${UserName},${RequestedDateTime},${ExpiryDate},${secureEmail},${OTP},${ClientName},${PhoneNumber}',
      content:
        "<p>Dear ${UserName},</p><p>You've recently requested to reset your password for your donor account with ${ClientName}. Your request was received on ${RequestedDateTime}. Please follow the link provided in the secure email sent to ${secureEmail} to proceed with the password reset. This link will expire on ${ExpiryDate}.<br>If you encounter any issues, feel free to contact us at ${PhoneNumber}.</p><p>Thank you,<br>Degree37</p>",
    },
  ],
};

export default emailTemplates;
