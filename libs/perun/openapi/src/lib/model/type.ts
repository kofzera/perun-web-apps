/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 3.16.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * type of application form items
 */
export type Type = 'HTML_COMMENT' | 'SUBMIT_BUTTON' | 'AUTO_SUBMIT_BUTTON' | 'FROM_FEDERATION_SHOW' | 'FROM_FEDERATION_HIDDEN' | 'PASSWORD' | 'VALIDATED_EMAIL' | 'TEXTFIELD' | 'TEXTAREA' | 'CHECKBOX' | 'RADIO' | 'SELECTIONBOX' | 'COMBOBOX' | 'USERNAME' | 'HEADING' | 'TIMEZONE';

export const Type = {
    HTMLCOMMENT: 'HTML_COMMENT' as Type,
    SUBMITBUTTON: 'SUBMIT_BUTTON' as Type,
    AUTOSUBMITBUTTON: 'AUTO_SUBMIT_BUTTON' as Type,
    FROMFEDERATIONSHOW: 'FROM_FEDERATION_SHOW' as Type,
    FROMFEDERATIONHIDDEN: 'FROM_FEDERATION_HIDDEN' as Type,
    PASSWORD: 'PASSWORD' as Type,
    VALIDATEDEMAIL: 'VALIDATED_EMAIL' as Type,
    TEXTFIELD: 'TEXTFIELD' as Type,
    TEXTAREA: 'TEXTAREA' as Type,
    CHECKBOX: 'CHECKBOX' as Type,
    RADIO: 'RADIO' as Type,
    SELECTIONBOX: 'SELECTIONBOX' as Type,
    COMBOBOX: 'COMBOBOX' as Type,
    USERNAME: 'USERNAME' as Type,
    HEADING: 'HEADING' as Type,
    TIMEZONE: 'TIMEZONE' as Type
};

