/**
 * This mixin makes it possible to get the custom claims for the user.
 * This mixin must be used on a page that has a 'firebase-auth' element.
 * @polymerMixin
 * @mixinFunction
 */
export const FireflySecurityMixin = superclass =>
  class extends superclass {
    static get properties() {
      return {
        /**
         * The firebase user object.
         */

        firebaseUser: {
          type: Object,
          value: null
        },

        /** An object containing the user's custom claims. */
        claims: {
          type: Object,
          value: null,
          notify: true
        }
      };
    }

    /**
     * This method initialises the claims object.
     * @param {Event} e the event object
     */

    __initClaims(e) {
      let user = e.detail.value;
      //console.log(user);
      if (user) {
        user.getIdTokenResult(true).then(tokens => {
          let userClaims = tokens.claims;
          this.set("claims", userClaims);
          this.__isProtected();
        });
      }
    }

    /** This method checks whether signed in user has admin priviledges or not.
     *  If not the system will re-route to the home page if the user tries to access
     *  any protected routes
     */
    __isProtected() {
      const url = location.href;
      const regex = new RegExp("(/settings$|/settings-)");
      const isProtected = regex.test(url);
      if (isProtected && !this.claims.isAdmin) {
        window.location.href = "/";
      }
    }

    /**
     * Called every time the element is inserted into the DOM. Useful for
     * running setup code, such as fetching resources or rendering.
     * Generally, you should try to delay work until this time.
     */
    connectedCallback() {
      super.connectedCallback();
      const auth = this.shadowRoot.querySelector("firebase-auth");
      auth.addEventListener("user-changed", e => this.__initClaims(e));
    }

    /**
     * Called every time the element is removed from the DOM. Useful for
     * running clean up code (removing event listeners, etc.).
     */
    disconnectedCallback() {
      super.disconnectedCallback();
      const auth = this.shadowRoot.querySelector("firebase-auth");
      auth.removeEventListener("user-changed", e => this.__initClaims(e));
    }
  };
