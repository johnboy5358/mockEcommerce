// Import onchange by sindresorhus VISIT: https://github.com/sindresorhus/on-change
; (function (onchange) {

  // Helper functions
  // A curried map function.
  // map : fn -> [a, ...] -> [b, ...]
  const map = fn => coll => Array.prototype.map.call(coll, fn)
  
  // Reference to the DOM main-content.
  const mainContent = document.getElementById('main-content')
  
  // Fetching bike data from this servers assets
  const bikeData = fetch('assets/data/bikeData.json')
  const bikeJsonProm = bikeData
    .then(response => response.json())
    .catch((response) => {
      console.log("Opps! something went wrong!", response)
      return {bikeData: []}
    })

  // Use articleTemplate
  // mappedAreticle : [{}, ...] -> [String, ...]
  const mappedArticle = map(articleTemplate)
  
  // put bike data in the DOM.
  bikeJsonProm.then(json => {
    mainContent.innerHTML = (json.bikeData.length === 0)
      ? `<h1 class="alert">Opps, something went wrong!<span> could not get bike data.</span></h1>`
      : mappedArticle(json.bikeData).join('')
  })

  /*
    * MAIN CONTENT
    * 
  */
 
  const domMainContent = document.getElementById('main-content')
  domMainContent.style.display = 'grid'
  
  /*
    * SHOPPING BASKET
    * Stuff to do with the shopping basket
  */
  
  const domBasket = document.getElementById('basket')
  const domBasketItems = document.getElementById('basket-items')
  const domBasketTotal = document.getElementById('basket-total')
  const domBasketContent = document.getElementById('basket-content')
  
  // basket model
  const basket = {
    total: 0,
    items: []
  }

  // Setup listener for basket clicks. => show what is in the basket.
  domBasket.onclick = e => showBasket(e)

  // Setup listener for click on basket content.
  domBasketContent.addEventListener('click', function(e) {
    // const regexRemove = RegExp('remove#*')
    switch (true) {
      case /continue-shopping/.test(e.target.id):
        console.log("Run a function to return to homepage.")
        domBasketContent.style.display = 'none'
        domMainContent.style.display = 'grid'
        break;
      case (/remove#./.test(e.target.id)):
        console.log("We are looking to remove an item from the basket.")
        const suffix = e.target.id.match(/#.*$/)
        console.log(suffix[0])
        break;
      default:
        console.log("No action for this event!")  
        break;
    }
  })

  // Setup listener for article button clicks.
  mainContent.onclick = e => addToCart(e)
  
  // Initialise dom basket [DOM side effects].
  domBasketItems.innerText = 0
  domBasketTotal.innerText = "0.00"

  
  // Setup basket Proxy
  const proxBasket = onchange(basket, () => {
    updateTotal(basket)
  })

  // Basket onchange handler [DOM side effects].
  function updateTotal(basket) {
    basket['total'] = Math.round((basket.items.reduce((p,c) => p + c.price[0], 0)) *100) / 100
    domBasketTotal.innerText = proxBasket.total
    domBasketItems.innerText = proxBasket.items.length
  }

  // Add an item to shopping basket. Filter through json data using button id.
  // get matched item and push it to the proxy basket.
  function addToCart(e) {
    bikeJsonProm.then((data) => {
      const buttonId = e.target.id
      proxBasket['items'].push(data.bikeData.filter(bike => bike.id === buttonId)[0])
    })
  }
  /*
    * end shopping basket stuff.
  */

  
  /*
    * VIEW FUNCTIONS *
  */
  function articleTemplate(bDat) {
    return (`
    <article class="bike-summary">
      <img src="${bDat.imgsrc}" alt="bike image">
      <div class="bike-details">
        <p class="price">
          £${(bDat.price.length === 1) ? String(bDat.price[0]) : String(bDat.price[0]) + ' - ' + bDat.price[bDat.price.length-1]}
          <button id="${bDat.id}" class="add-to-cart">Add to cart</button>
        </p>
        <h3>${bDat.hdg}</h3>
        <p class="in-brief">
          ${bDat.brieftxt}
          <a class="more"> more</a>
        </p>
      </div>
    </article>
    `)
  }

  function showBasket(e) {
    if (e.target.parentElement.id === 'basket') {
      domMainContent.style.display = 'none'
      domBasketContent.style.display = 'grid'
      domBasketContent.innerHTML = 
      `
        <h2>You have ${basket.items.length} items in your basket</h2>
        <table>
          <tbody>
            ${basket.items.map((v, i) => {
              return (`
                <tr>
                  <td><img src=${v.imgsrc} /></td>
                  <td>${v.hdg}</td>
                  <td>${v.price.length > 1 ? (`£${v.price[0]} - £${v.price[v.price.length-1]}`) : (`£${v.price[0]}`)}</td>
                  <td><button id="remove#${v.id}" class="remove">Remove</button></td>
                </tr>
              `)}).join('')}
          </tbody>
        </table>

        <div>
          <button id="continue-shopping">Continue shopping</button>
          <button id="checkout">Check out</button>
        </div>
      `
    }
  }
  
}(onchange))