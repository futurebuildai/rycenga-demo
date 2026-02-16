/**
 * PvBase - Base class for all tenant Lit components
 * Extends LitElement with shared styles for Shadow DOM consistency
 */

import { LitElement } from 'lit';
import { coreStyles } from '../styles/shared.js';

export class PvBase extends LitElement {
    static styles = coreStyles;
}
