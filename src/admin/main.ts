/**
 * Velocity Admin - Entry Point
 * Initializes the Lit-based Admin Portal
 */

// Import global theme CSS
import '../styles/theme.css';
import { ThemeService } from '../services/theme.service.js';

// Import root component
import './pv-admin-app.js';

ThemeService.init();
