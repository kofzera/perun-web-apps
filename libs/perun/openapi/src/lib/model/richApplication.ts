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
import { Group } from './group';
import { User } from './user';
import { Vo } from './vo';
import { ApplicationFormItemData } from './applicationFormItemData';
import { AppState } from './appState';
import { AppType } from './appType';
import { Application } from './application';

export interface RichApplication {
  formData: Array<ApplicationFormItemData>;
}