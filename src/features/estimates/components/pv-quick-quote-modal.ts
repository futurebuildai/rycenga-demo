import { html, css, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { PvBase } from '../../../components/pv-base.js';
import { PvToast } from '../../../components/atoms/pv-toast.js';
import { DataService } from '../../../services/data.service.js';

interface StructuredLine {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

@customElement('pv-quick-quote-modal')
export class PvQuickQuoteModal extends PvBase {
  static styles = [
    ...PvBase.styles,
    css`
      .modal-content {
        max-width: 650px;
        width: 100%;
        min-height: 450px;
        display: flex;
        flex-direction: column;
      }

      .modal-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: var(--space-xl);
      }

      /* Step 1: Choice */
      .choice-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-lg);
        margin-top: var(--space-lg);
      }

      .choice-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-base);
        text-align: center;
        background: var(--color-bg);
      }

      .choice-card:hover {
        border-color: var(--color-primary);
        background: var(--color-bg-alt);
        transform: translateY(-2px);
      }

      .choice-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--space-md);
        color: var(--color-primary);
      }

      .choice-title {
        font-weight: 700;
        font-size: var(--text-base);
        margin-bottom: var(--space-xs);
        color: var(--color-text);
      }

      .choice-desc {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        line-height: 1.4;
      }

      /* Step 2: Input - Common */
      .input-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .instruction-text {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-md);
      }

      /* Manual Entry */
      textarea {
        width: 100%;
        min-height: 200px;
        padding: var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-family: inherit;
        font-size: var(--text-sm);
        resize: vertical;
      }

      /* File Upload */
      .upload-zone {
        border: 2px dashed var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-3xl) var(--space-xl);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        cursor: pointer;
        transition: all var(--transition-base);
        background: var(--color-bg-alt);
      }

      .upload-zone:hover, .upload-zone.dragging {
        border-color: var(--color-primary);
        background: var(--color-primary-light-10);
      }

      .upload-icon {
        width: 40px;
        height: 40px;
        color: var(--color-text-muted);
      }

      .upload-text {
        font-weight: 500;
        color: var(--color-text);
      }

      .upload-hint {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      /* Voice Entry */
      .voice-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xl);
        padding: var(--space-xl);
      }

      .mic-button {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(222, 69, 20, 0.3);
        transition: all var(--transition-base);
        position: relative;
      }

      .mic-button.recording {
        background: #ef4444;
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }

      .transcript-view {
        width: 100%;
        min-height: 100px;
        padding: var(--space-md);
        background: var(--color-bg-alt);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-style: italic;
        color: var(--color-text);
        text-align: center;
      }

      /* Step 3: AI Processing */
      .processing-view {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-lg);
        padding: var(--space-3xl);
      }

      .ai-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--color-bg-alt);
        border-top: 4px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Step 4: Confirmation Table */
      .confirmation-view {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .structured-table {
        width: 100%;
        border-collapse: collapse;
      }

      .structured-table th {
        text-align: left;
        padding: var(--space-sm);
        border-bottom: 2px solid var(--color-border);
        font-size: var(--text-xs);
        text-transform: uppercase;
        color: var(--color-text-muted);
      }

      .structured-table td {
        padding: var(--space-sm);
        border-bottom: 1px solid var(--color-border);
        vertical-align: middle;
      }

      .qty-input {
        width: 60px;
        padding: 4px 8px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        text-align: center;
      }

      .sku-cell {
        font-family: monospace;
        font-weight: 600;
        color: var(--color-text);
      }

      .name-cell {
        font-size: var(--text-sm);
      }

      /* Footer */
      .modal-footer {
        padding: var(--space-lg) var(--space-xl);
        border-top: 1px solid var(--color-border);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-md);
      }

      .btn-back {
        background: transparent;
        border: 1px solid var(--color-border);
      }

      .btn-back:hover {
        background: var(--color-bg-alt);
      }
    `,
  ];

  @property({ type: Boolean }) open = false;
  @property({ type: Number }) accountId = 1;

  @state() private step: 'choice' | 'input' | 'processing' | 'confirmation' | 'success' = 'choice';
  @state() private inputType: 'upload' | 'manual' | 'voice' = 'manual';
  @state() private rawText = '';
  @state() private transcript = 'Click microphone-above to start recording your list...';
  @state() private isRecording = false;
  @state() private structuredLines: StructuredLine[] = [];
  @state() private dragging = false;

  @query('#fileInput') private fileInput?: HTMLInputElement;

  private recognition: any = null;

  connectedCallback() {
    super.connectedCallback();
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        this.rawText = finalTranscript || interimTranscript;
        this.transcript = this.rawText || 'Listening...';
      };

      this.recognition.onerror = () => {
        this.isRecording = false;
        PvToast.show('Speech recognition error', 'error');
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    }
  }

  private handleClose() {
    this.open = false;
    this.reset();
    this.dispatchEvent(new CustomEvent('close'));
  }

  private reset() {
    this.step = 'choice';
    this.rawText = '';
    this.transcript = 'Click microphone to start recording your list...';
    this.isRecording = false;
    this.structuredLines = [];
    if (this.recognition) this.recognition.stop();
  }

  private startQuickQuote(type: 'upload' | 'manual' | 'voice') {
    this.inputType = type;
    this.step = 'input';
  }

  private handleBack() {
    if (this.step === 'input') this.step = 'choice';
    else if (this.step === 'confirmation') this.step = 'input';
  }

  private async processInput() {
    if (!this.rawText && this.inputType !== 'upload') {
      PvToast.show('Please enter your requirements', 'warning');
      return;
    }

    this.step = 'processing';

    // Simulate AI processing and submission delay
    await new Promise(r => setTimeout(r, 4000));
    this.step = 'success';

    // Notify parent to maybe refresh dashboard
    this.dispatchEvent(new CustomEvent('submitted'));
  }

  private toggleRecording() {
    if (this.isRecording) {
      this.recognition?.stop();
      this.isRecording = false;
    } else {
      if (!this.recognition) {
        // Fallback simulation for unsupported browsers/demo
        this.simulateRecording();
        return;
      }
      this.recognition.start();
      this.isRecording = true;
    }
  }

  private simulateRecording() {
    this.isRecording = true;
    this.transcript = 'Listening (Simulation)...';
    setTimeout(() => {
      this.rawText = '10 2x4x8 studs, 1 box of 16d nails, 3 sheets of 3/4 plywood';
      this.transcript = this.rawText;
      this.isRecording = false;
    }, 3000);
  }

  private handleFileUpload(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.rawText = `File uploaded: ${files[0].name}`;
      this.processInput();
    }
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    this.dragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.rawText = `File uploaded: ${files[0].name}`;
      this.processInput();
    }
  }

  // Removed submitQuote() since we skip confirmation and go to success mode now

  private renderChoice() {
    return html`
      <div class="choice-view">
        <h2 class="modal-title">How would you like to start?</h2>
        <p class="instruction-text">Choose the most convenient way to provide your material list.</p>
        
        <div class="choice-grid">
          <div class="choice-card" @click=${() => this.startQuickQuote('upload')}>
            <div class="choice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <span class="choice-title">Upload List</span>
            <span class="choice-desc">PDF, Spreadsheet, or Photo of a list</span>
          </div>

          <div class="choice-card" @click=${() => this.startQuickQuote('manual')}>
            <div class="choice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <span class="choice-title">Manual Entry</span>
            <span class="choice-desc">Type or paste your requirements</span>
          </div>

          <div class="choice-card" @click=${() => this.startQuickQuote('voice')}>
            <div class="choice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            <span class="choice-title">Voice to Text</span>
            <span class="choice-desc">Say your list out loud</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderInput() {
    return html`
      <div class="input-view">
        <h2 class="modal-title">
          ${this.inputType === 'upload' ? 'Upload Material List' :
        this.inputType === 'manual' ? 'Enter Material List' : 'Voice to Text'}
        </h2>
        
        <div class="input-container">
          ${this.inputType === 'upload' ? html`
            <div 
              class="upload-zone ${this.dragging ? 'dragging' : ''}"
              @dragover=${(e: DragEvent) => { e.preventDefault(); this.dragging = true; }}
              @dragleave=${() => this.dragging = false}
              @drop=${this.handleDrop}
              @click=${() => this.fileInput?.click()}
            >
              <input type="file" id="fileInput" hidden @change=${this.handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg">
              <div class="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <span class="upload-text">Drop files here or click to browse</span>
              <span class="upload-hint">Supports PDF, XLS, PNG, JPG</span>
            </div>
          ` : this.inputType === 'manual' ? html`
            <p class="instruction-text">Type or paste your requirements below. Be as specific as possible.</p>
            <textarea 
              placeholder="Example:\n10 2x4x8 studs\n5lb box of 16d nails\n3 sheets of 3/4 plywood"
              .value=${this.rawText}
              @input=${(e: any) => this.rawText = e.target.value}
            ></textarea>
          ` : html`
            <div class="voice-container">
              <p class="instruction-text">Click the microphone and speak your requirements.</p>
              <button class="mic-button ${this.isRecording ? 'recording' : ''}" @click=${this.toggleRecording}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 32px">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                </svg>
              </button>
              <div class="transcript-view">${this.transcript}</div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  private renderProcessing() {
    return html`
      <div class="processing-view">
        <div class="ai-spinner"></div>
        <h2 class="modal-title">AI is structuring your list...</h2>
        <div class="instruction-text" style="text-align: center; max-width: 400px;">
          Our AI model is currently:
          <ul style="text-align: left; margin-top: var(--space-md); font-size: var(--text-xs); color: var(--color-text);">
            <li>Identifying products from your input</li>
            <li>Matching items to our real-time SKU catalog</li>
            <li>Preparing line items for ERP synchronization</li>
          </ul>
        </div>
      </div>
    `;
  }

  private renderSuccess() {
    return html`
      <div class="processing-view" style="text-align: center;">
        <div style="color: var(--status-success-text); margin-bottom: var(--space-md);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 64px; height: 64px;">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </div>
        <h2 class="modal-title">Processing Complete</h2>
        <p class="instruction-text" style="font-size: var(--text-base); color: var(--color-text);">
          Your quote request has been matched to our ERP catalog and sent directly to the dealer. 
        </p>
        <p class="instruction-text">
          Our team will review the matched SKUs and notify you once your estimate is ready for approval.
        </p>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    return html`
      <div class="modal-overlay" @click=${(e: any) => e.target.classList.contains('modal-overlay') && this.handleClose()}>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Start a New Quote</h2>
            <button class="close-btn" @click=${this.handleClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            ${this.step === 'choice' ? this.renderChoice() :
        this.step === 'input' ? this.renderInput() :
          this.step === 'processing' ? this.renderProcessing() :
            this.renderSuccess()}
          </div>

          <div class="modal-footer">
            ${(this.step !== 'choice' && this.step !== 'success') ? html`
              <button class="btn btn-back" @click=${this.handleBack} ?disabled=${this.step === 'processing'}>Back</button>
            ` : ''}
            
            ${this.step === 'input' ? html`
              <button class="btn btn-cta" @click=${this.processInput}>Process List</button>
            ` : this.step === 'success' ? html`
              <button class="btn btn-cta" @click=${this.handleClose}>Done</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-quick-quote-modal': PvQuickQuoteModal;
  }
}
