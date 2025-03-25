(function () {
  const STYLE = `
    <style>
      .global-indicator-container {
          display: flex;
          align-items: center;
          justify-items: center;
          flex-direction: column;
          gap: 1rem;
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
  <div class="global-indicator-container__message">${initialMessage}</div>
</section>
  `;

  class GlobalIndicator extends HTMLElement {
    connectedCallback() {
      const initialMessage = this.getAttribute('message') ?? '';
      this.innerHTML = getHtml(initialMessage);
    }

    attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
      if (name !== 'message') {
        return;
      }
      const messageDiv = this.querySelector<HTMLDivElement>('.global-indicator-container__message');
      if (!messageDiv) {
        return;
      }
      messageDiv.innerHTML = newValue as string;
    }

    static get observedAttributes() {
      return ['message'];
    }
  }
  customElements.define('step-global-indicator', GlobalIndicator);
})();
