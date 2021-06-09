/* Autor: Victor Corbet */

import { PageMixin } from '../page.mixin';
import { css, customElement, html, internalProperty, LitElement, property, query, queryAsync, unsafeCSS} from 'lit-element';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./password.component.scss');

// Quelle:
// Bei der Umsetzung habe ich mich am YouTube Tutorial: https://www.youtube.com/watch?v=7-1VZ2wF8pw orientiert.

@customElement('app-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PasswordComponent extends PageMixin(LitElement) { 
    static styles = [
        css`
          ${unsafeCSS(sharedCSS)}
        `,
        css`
          ${unsafeCSS(componentCSS)}
        `
      ];

      @query('#pwt-strength')
      strengMeter!: HTMLDivElement;

      @query('#problems')
      reasonsContainer!: HTMLDivElement;
      
      @query('#pwt-input')
      passwordInput!: HTMLInputElement;

      @internalProperty()
      isFirstPasswordInput : boolean = true

      render() {
        return html`
        <div id="pwt-container">
          <h3>Sicheres Password</h3>
          <div id="pwt-strength" class="pwt-strength"></div>
          <input type="text" id="pwt-input" class="pwt-input" aria-labelledby="password" @focus="${this.removeContentFromPasswordInput}" value=">> hier Password eingeben <<"> 
          <div id="problems" class="problems"></div>
        </div>
          `;
      }

      removeContentFromPasswordInput () {
        if(this.isFirstPasswordInput) {
          this.isFirstPasswordInput = false;
          this.passwordInput.value = ""
        };
      }

      async firstUpdated() {
        this.passwordInput.addEventListener("input" , () => {
          this.recalculatePasswordStrength();
        })
      } 

      recalculatePasswordStrength () {
        const problems = this.calculatePasswordStrength(this.passwordInput.value)
        let strength : number = 100;
        this.reasonsContainer.innerHTML = ''
    
        problems.forEach(problem => {
            if(problem == null) return
            strength -= problem.punishment
            const messageElement = document.createElement("div");
            messageElement.innerText = problem.message;
            this.reasonsContainer.appendChild(messageElement)
        })
        this.strengMeter.style.setProperty('--passwordStrength' , String(strength) );
         if(strength < 40) {
           this.strengMeter.style.setProperty('--passwordStrength_color' ,  'red');
          }
         else if(strength >= 40 && strength < 70) {
           this.strengMeter.style.setProperty('--passwordStrength_color' ,  'yellow')
          }
         else {
          this.strengMeter.style.setProperty('--passwordStrength_color' ,  'green');
         }
      }

      calculatePasswordStrength(password : string) {
        const problems = []
        problems.push(this.lenghtProblem(password))
        problems.push(this.lowercaseProblem(password))
        problems.push(this.uppercaseProblem(password))
        problems.push(this.numberProblem(password))
        problems.push(this.specialCharactersProblem(password))
        problems.push(this.reapeatCharactersProblem(password))
        return problems
      }

      genericProblemFinder(password : string, regex : RegExp, type : string ){
        const matches = password.match(regex) || []
        if(matches.length == 0) {
            return {
                message: `-> Password hat keine ${type}`,
                punishment: 15
            }
        }
        if(matches.length == 1) {
            return {
                message: `-> Password hat nur ein ${type}`,
                punishment: 10
            }
        }
      }

      lowercaseProblem(password : string) {
        return this.genericProblemFinder(password, /[a-z]/g , 'Kleinbuchstaben')
      }
      uppercaseProblem(password : string) {
        return this.genericProblemFinder(password, /[A-Z]/g , 'Großbuchstaben')
      }
      numberProblem(password : string) {
        return this.genericProblemFinder(password, /[0-9]/g , 'Zahlen')
      }
      specialCharactersProblem(password : string) {
        return this.genericProblemFinder(password , /[^0-9a-zA-Z\s]/g , 'Sonderzeichen (!$%&*...)')
      }
      reapeatCharactersProblem(password : string) {
        const matches = password.match(/(.)\1/g) || []
        if( matches.length > 0) {
            return {
                message: '-> Bitte keine selben Zeichen nebeneinander',
                punishment: matches.length * 10
            }
        }
      }
      lenghtProblem(password : string) {
        const length = password.length
        if ( length <= 5) {
            return {
                message: '-> Password zu kurz',
                punishment: 40
            }
        }
        if ( length < 10) {
            return {
                message: '-> Password könnte länger sein',
                punishment: 25
            }
        }
      }
}