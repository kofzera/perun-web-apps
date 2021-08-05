/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 0.0.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export type MailType = 'APP_CREATED_USER' | 'APP_CREATED_VO_ADMIN' | 'MAIL_VALIDATION' | 'APP_APPROVED_USER' | 'APP_REJECTED_USER' | 'APP_ERROR_VO_ADMIN' | 'USER_INVITE';

export const MailType = {
    APPCREATEDUSER: 'APP_CREATED_USER' as MailType,
    APPCREATEDVOADMIN: 'APP_CREATED_VO_ADMIN' as MailType,
    MAILVALIDATION: 'MAIL_VALIDATION' as MailType,
    APPAPPROVEDUSER: 'APP_APPROVED_USER' as MailType,
    APPREJECTEDUSER: 'APP_REJECTED_USER' as MailType,
    APPERRORVOADMIN: 'APP_ERROR_VO_ADMIN' as MailType,
    USERINVITE: 'USER_INVITE' as MailType
};

