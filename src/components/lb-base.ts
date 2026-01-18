/**
 * LbBase - Base class for all Lumber Boss Lit components
 * Extends LitElement with shared styles for Shadow DOM consistency
 */

import { LitElement } from 'lit';
import { sharedStyles } from '../styles/shared.js';

export class LbBase extends LitElement {
    static styles = sharedStyles;
}
