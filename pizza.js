document.addEventListener("alpine:init", () => {
    
    Alpine.data('pizzaCartWithAPIWidget', () => {
        return{
            cartTitle: 'Your Cart',
            pizzas: [],
            userName: '',
            cartId: 'NO CART CODE TO SHOW',
            cartPizzas: [],
            cartTotal: 0.00,
            message: '',
            paymentAmount: 0,
            featuredPizzas: [],
            historyCartsIds: [],
            pastOrderedPizzas: [],
            displayHistory: false,
            cartDisplay: false,

            login() {
                if(this.userName.length > 2) {
                    this.createCart();
                }
                else {
                    alert('Username is too short');
                }
                
            },

            logout() {
                if(confirm('Do you want to logout?')) {
                    this.userName = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['userName'] = '';
                }
            },

            createCart() {
                if(!this.userName) {
                    this.cartId = 'Enter a Username to generate a cart';
                    return
                }
                
                const cartId = localStorage['cartId'];

                if(cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.userName}`;
                    return axios.get(createCartURL).then(result => {
                        this.cartId = result.data.cart_code;
                        localStorage['cartId'] = this.cartId;
                    })
                }
            },

            getCart() {
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartUrl);
            },

            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code" : this.cartId,
                    amount
                });
            },

            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code" : this.cartId,
                    "pizza_id" : pizzaId
                })
            },

            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                });
            },

            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code" : this.cartId,
                    "pizza_id" : pizzaId
                })
            },

            init(){

                const storedUsername = localStorage['userName'];
                if (storedUsername){
                    this.userName = storedUsername;
                }

                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                    this.pizzas = result.data.pizzas;
                    }).then(() => {
                        return this.getFeaturedPizzas();
                    })
                
                if(!this.cartId) {
                    this.createCart()
                        .then(() => {
                            this.showCartData();
                        })        
                }
            },

            getFeaturedPizzas() {
                return axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas/featured?username=TshepoMagagula')
                    .then((result) => {
                        this.featuredPizzas = result.data.pizzas;
                        console.log(this.featuredPizzas);
                    });
            },

            setFeaturedPizzas() {
                return axios
                    .post('https://pizza-api.projectcodex.net/api/pizzas/featured', 
                    {
                        "username" : "TshepoMagagula",
                        "pizza_id" : pizzaId
                    })
                    .then(() => {
                        this.getFeaturedPizzas();
                    })
            },

            addPizzaToCart(pizzaId) {
                this
                .addPizza(pizzaId)
                .then(() => {
                    this.showCartData();
                })
            },

            payForCart () {
                this.pay(this.paymentAmount)
                .then((result) => {
                    if(result.data.status == 'failure') {
                        this.message = result.data.message;
                        setTimeout(() => this.message = '', 4000);
                    } 
                    else if(result.data.status == 'success' && this.paymentAmount > this.cartTotal) {
                        this.message = `Payment received. Your change is R${(this.paymentAmount - this.cartTotal).toFixed(2)}`;

                        setTimeout(() => {
                            this.message='';
                            this.cartPizzas=[];
                            this.cartTotal=0.00;
                            this.cartId='';
                            this.paymentAmount=0;
                            localStorage['cartId']='';
                            this.createCart()
                        }, 4000)
                    } 
                    else {
                        this.message = 'Payment received';

                        setTimeout(() => {
                            this.message='';
                            this.cartPizzas=[];
                            this.cartTotal=0.00;
                            this.cartId='';
                            this.paymentAmount=0;
                            localStorage['cartId']='';
                            this.createCart()
                        }, 4000)
                    }
                })
            },

            removePizzaFromCart(pizzaId) {
                this
                .removePizza(pizzaId)
                .then(() => {
                    this.showCartData();
                })
            },

            orderHistory() {

                const orderHistoryUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.userName}`
                axios.get(orderHistoryUrl).then(
                  result => {
          
                    this.historyCartsIds = result.data.filter(cart => cart.status === 'paid');
                    this.activateDisplayHistory();
                  })
              },

            historyPizzas() {
                this.orderHistory() ;
                this.orderHistory() ;
            },

            getPastOrders(CartCode) {
          
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${CartCode}/get`;
                return axios.get(getCartUrl)
                  .then(result => {
          
                    this.pastOrderedPizzas.push({ 'pizzas': result.data.pizzas, 'total': result.data.total, 'cartId': result.data.id });
                
                  })
            },

              activateDisplayHistory() {
                this.displayHistory = true;
                this.cartDisplayed=true;//hide cart button
              },
        }
    })
})