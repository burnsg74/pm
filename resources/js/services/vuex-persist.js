import VuexPersistence from 'vuex-persist'

let vuexPersist = null;

try {
    /** @see https://github.com/championswimmer/vuex-persist#constructor-parameters-- */
    vuexPersist = new VuexPersistence({

        storage: localStorage,
/*
        reducer: (state) => { // reduce state to only values to be persisted
            return { cart: state.cart, visitor: state.customer };
        },

        filter: (mutation) => { // limit mutations that trigger persistence
            return mutation.type === 'UPDATE_PRODUCT_STEPS';
        },
*/
    });
} catch(e) {
    console.warn('LocalStorage is unavailable, data will not be persisted.');
}

export default vuexPersist;
