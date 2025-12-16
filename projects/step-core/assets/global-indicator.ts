(function () {
  const STYLE = `
    <style>

      step-global-indicator ~ * {
        display: none !important;
      }

      .global-indicator-container div.text {
        font-family: Roboto;
      }

      .global-indicator-container__timeout-message {
        margin-top: 2em;
        max-width: 400px;
      }

      .global-indicator-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 1rem;
          height: 90vh;
      }

      .global-indicator-container__message {
          max-width: 50%;
          text-align: justify;
      }

      .spinner_zWVm {
          animation: spinner_5QiW 1.2s linear infinite, spinner_PnZo 1.2s linear infinite
      }

      .spinner_gfyD {
          animation: spinner_5QiW 1.2s linear infinite, spinner_4j7o 1.2s linear infinite;
          animation-delay: .1s
      }

      .spinner_T5JJ {
          animation: spinner_5QiW 1.2s linear infinite, spinner_fLK4 1.2s linear infinite;
          animation-delay: .1s
      }

      .spinner_E3Wz {
          animation: spinner_5QiW 1.2s linear infinite, spinner_tDji 1.2s linear infinite;
          animation-delay: .2s
      }

      .spinner_g2vs {
          animation: spinner_5QiW 1.2s linear infinite, spinner_CMiT 1.2s linear infinite;
          animation-delay: .2s
      }

      .spinner_ctYB {
          animation: spinner_5QiW 1.2s linear infinite, spinner_cHKR 1.2s linear infinite;
          animation-delay: .2s
      }

      .spinner_BDNj {
          animation: spinner_5QiW 1.2s linear infinite, spinner_Re6e 1.2s linear infinite;
          animation-delay: .3s
      }

      .spinner_rCw3 {
          animation: spinner_5QiW 1.2s linear infinite, spinner_EJmJ 1.2s linear infinite;
          animation-delay: .3s
      }

      .spinner_Rszm {
          animation: spinner_5QiW 1.2s linear infinite, spinner_YJOP 1.2s linear infinite;
          animation-delay: .4s
      }

      @keyframes spinner_5QiW {
          0%, 50% {
              width: 7.33px;
              height: 7.33px
          }
          25% {
              width: 1.33px;
              height: 1.33px
          }
      }

      @keyframes spinner_PnZo {
          0%, 50% {
              x: 1px;
              y: 1px
          }
          25% {
              x: 4px;
              y: 4px
          }
      }

      @keyframes spinner_4j7o {
          0%, 50% {
              x: 8.33px;
              y: 1px
          }
          25% {
              x: 11.33px;
              y: 4px
          }
      }

      @keyframes spinner_fLK4 {
          0%, 50% {
              x: 1px;
              y: 8.33px
          }
          25% {
              x: 4px;
              y: 11.33px
          }
      }

      @keyframes spinner_tDji {
          0%, 50% {
              x: 15.66px;
              y: 1px
          }
          25% {
              x: 18.66px;
              y: 4px
          }
      }

      @keyframes spinner_CMiT {
          0%, 50% {
              x: 8.33px;
              y: 8.33px
          }
          25% {
              x: 11.33px;
              y: 11.33px
          }
      }

      @keyframes spinner_cHKR {
          0%, 50% {
              x: 1px;
              y: 15.66px
          }
          25% {
              x: 4px;
              y: 18.66px
          }
      }

      @keyframes spinner_Re6e {
          0%, 50% {
              x: 15.66px;
              y: 8.33px
          }
          25% {
              x: 18.66px;
              y: 11.33px
          }
      }

      @keyframes spinner_EJmJ {
          0%, 50% {
              x: 8.33px;
              y: 15.66px
          }
          25% {
              x: 11.33px;
              y: 18.66px
          }
      }

      @keyframes spinner_YJOP {
          0%, 50% {
              x: 15.66px;
              y: 15.66px
          }
          25% {
              x: 18.66px;
              y: 18.66px
          }
      }
   </style>
  `;

  const getHtml = (initialMessage: string) => `
<section class="global-indicator-container">
  ${STYLE}
  <svg width="100" height="100" viewBox="0 0 24 24" fill="#0082cb" stroke="#fff" xmlns="http://www.w3.org/2000/svg">
    <rect class="spinner_zWVm" x="1" y="1" width="7.33" height="7.33"/>
    <rect class="spinner_gfyD" x="8.33" y="1" width="7.33" height="7.33"/>
    <rect class="spinner_T5JJ" x="1" y="8.33" width="7.33" height="7.33"/>
    <rect class="spinner_E3Wz" x="15.66" y="1" width="7.33" height="7.33"/>
    <rect class="spinner_g2vs" x="8.33" y="8.33" width="7.33" height="7.33"/>
    <rect class="spinner_ctYB" x="1" y="15.66" width="7.33" height="7.33"/>
    <rect class="spinner_BDNj" x="15.66" y="8.33" width="7.33" height="7.33"/>
    <rect class="spinner_rCw3" x="8.33" y="15.66" width="7.33" height="7.33"/>
    <rect class="spinner_Rszm" x="15.66" y="15.66" width="7.33" height="7.33"/>
  </svg>
  <div class="text global-indicator-container__message">${initialMessage}</div>
  <div class="text global-indicator-container__timeout-message"></div>
</section>
  `;

  const DEFAULT_TIMEOUT = 30 * 1000;
  const DEFAULT_FALLBACK_MESSAGE =
    `The application is taking longer to load then expected. ` +
    `If you're on a slow connection, you may just need to wait a little longer. Otherwise, try reloading the page ` +
    `(press F5 or the reload button)`;

  class GlobalIndicatorElement extends HTMLElement {
    static get observedAttributes() {
      return ['message', 'fallback-message', 'timeout'];
    }

    private timerId?: number;
    private timeout = DEFAULT_TIMEOUT;
    private fallbackMessage = DEFAULT_FALLBACK_MESSAGE;

    connectedCallback() {
      const initialMessage = this.getAttribute('message') ?? '';
      this.innerHTML = getHtml(initialMessage);
    }

    attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
      if (newValue === oldValue) {
        return;
      }
      switch (name) {
        case 'timeout':
          const timeout = parseInt(newValue as string);
          console.log('timeout', timeout);
          this.timeout = isNaN(timeout) ? DEFAULT_TIMEOUT : timeout;
          if (this.timerId !== undefined) {
            this.showFallbackMessage();
          }
          break;
        case 'fallback-message':
          this.fallbackMessage = (newValue as string) ?? DEFAULT_FALLBACK_MESSAGE;
          if (this.timerId !== undefined) {
            this.showFallbackMessage();
          }
          break;
        case 'message':
          this.showMessage(newValue as string);
          break;
      }
    }

    private showMessage(message: string): void {
      this.printMessageInDivContainer('.global-indicator-container__message', message);
      this.showFallbackMessage();
    }

    private showFallbackMessage(): void {
      if (this.timerId !== undefined) {
        clearTimeout(this.timerId);
      }
      this.timerId = undefined;
      this.printMessageInDivContainer('.global-indicator-container__timeout-message', '');
      this.timerId = setTimeout(() => {
        this.printMessageInDivContainer('.global-indicator-container__timeout-message', this.fallbackMessage);
        this.timerId = undefined;
      }, this.timeout) as unknown as number;
    }

    private printMessageInDivContainer(selector: string, message: string): void {
      const container = this.querySelector<HTMLDivElement>(selector);
      console.log(selector, container);
      if (!container) {
        return;
      }
      container.innerHTML = message;
    }
  }
  customElements.define('step-global-indicator', GlobalIndicatorElement);

  class GlobalIndicatorImpl {
    removeIndicator(): void {
      this.indicatorElement?.remove();
    }

    showMessage(message: string): void {
      this.indicatorElement?.setAttribute?.('message', message);
    }

    setFallbackMessage(fallbackMessage: string): void {
      this.indicatorElement?.setAttribute?.('timeout-message', fallbackMessage);
    }

    setFallbackMessageTimeout(timeout: number): void {
      this.indicatorElement?.setAttribute?.('timeout', timeout.toString());
    }

    private get indicatorElement(): HTMLElement | null {
      return document.querySelector('step-global-indicator');
    }
  }

  (window as any).globalIndicator = new GlobalIndicatorImpl();
})();
