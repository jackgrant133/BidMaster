import React from 'react'

import { Model, Item, Bid } from '../model'

 
// This component receives the 'model' and the 'andRefreshDisplay' function as props.
function ToAuctionItems({model, andRefreshDisplay} : {model: Model, andRefreshDisplay: () => void}) {
    // CONTROLLER
    // Store a local copy of the model's 'itemsToAuction' in this component's state.
    const [itemsToAuction, changeItemsAvailable] = React.useState(model.itemsToAuction)
    // Store a local copy of the model's 'currentAuctionItem' in this component's state.
    const [currentItem, changeCurrentItem] = React.useState(model.currentAuctionItem)
    // Store a local copy of the model's 'soldItems' in this component's state.
    const [soldItems, changeSoldItems] = React.useState(model.soldItems)


    function addItem() {
        // Find the input DOM elements by their ID.
        const inputName = document.getElementById("new-item-name") as HTMLInputElement
        const itemName = inputName.value
        const inputVal = document.getElementById("new-item-bid") as HTMLInputElement
        const itemVal = inputVal.value
        const inputDesc = document.getElementById("new-item-desc") as HTMLInputElement
        const itemDesc = inputDesc.value
        // Create a new Item object using the values from the inputs.
        const newItem = new Item(Date.now(), itemName, parseInt(itemVal), itemDesc)

        // FIRST make sure that we add to the model
        // Call the model's method to add the item.
        model.addItemToAuction(newItem)

        // Update the local 'itemsToAuction' state with the (now updated) list from the model.
        changeItemsAvailable([...model.itemsToAuction])

        // in case any parent React code needs to know about this change, call the passed-in function
        console.log(itemsToAuction) // Log the local 'itemsToAuction' state *before* refresh.
        andRefreshDisplay() // Call the parent's refresh function.
        console.log(itemsToAuction) // Log the local 'itemsToAuction' state *after* refresh call.

        // Manually clear the input fields.
        inputName.value = ""
        inputVal.value = ""
        inputDesc.value = ""
    }
     function changeAuctionItem() {
        // Find the "item-lookup-name" input DOM element.
        const inputNameEl = document.getElementById("item-lookup-name") as HTMLInputElement
        const itemName = inputNameEl.value

        // Call the model's method to set the auction item.
        model.auctionItem(itemName)
        // Update the local 'itemsToAuction' state with the (now updated) list from the model.
        changeItemsAvailable([...model.itemsToAuction])

        // Get the new current item from the model.
        const newCurrentItem = model.getCurrentItem()

        // TO FORCE the redraw LOCALLY, you have to change state USING THE setState function
        // ... before an array means to grab all the existing items in the array
        // Update the local 'currentItem' state.
        changeCurrentItem(newCurrentItem) 
        inputNameEl.value = "" // Manually clear the input.

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay() // Call the parent's refresh function.
    }

    function updateItemBids(){
      // Find the bid-related input DOM elements.
      const inputBidderNameEl = document.getElementById("item-bidder-name") as HTMLInputElement
      const inputBidderName = inputBidderNameEl.value
      
      const inputBidPriceEl = document.getElementById("item-bid-price") as HTMLInputElement
      const inputBidPrice = inputBidPriceEl.value

      // Validate that the inputs are not empty and the price is a number.
      if(inputBidderName && inputBidPrice && !isNaN(parseInt(inputBidPrice))){
        // Create a new Bid object.
        const newBid = new Bid(inputBidderName, parseInt(inputBidPrice))

        // Call the model's method to record the bid, passing the local 'currentItem' state.
        model.recordBid(currentItem, newBid)

        // Update the local 'currentItem' state (this re-triggers a render).
        changeCurrentItem(currentItem)

        andRefreshDisplay() // Call the parent's refresh function.

        // Manually clear the input fields.
        inputBidderNameEl.value = ""
        inputBidPriceEl.value = ""
      }
      else{
        console.error("Invalid bid input")
      }
    }

    function sellItem(){
      // Call the model's method to sell the item, passing the local 'currentItem' state.
      model.sellItem(currentItem)

      // Get the new current item (which should be an empty item).
      const newCurrentItem = model.getCurrentItem()
      // Update the local 'currentItem' state.
      changeCurrentItem(newCurrentItem)
      // Update the local 'soldItems' state with the (now updated) list from the model.
      changeSoldItems([...model.soldItems])

      // Call the parent's refresh function.
      andRefreshDisplay()
    }


    return (
        <div>
          <div>
            {/* Display the 'totalFundsRaised' property directly from the 'model' prop. */}
            <p>Total Funds Raised: ${model.totalFundsRaised}</p>
          </div>
          <br></br>

          <h1>Items To Auction</h1>
          <h2>Add Items</h2>
          {/* Input fields for adding a new item. */}
          <b>Name: </b><input data-testid="new-item-name" id="new-item-name" placeholder="Item name"></input>
          <p></p>
          <b>Initial Bid: </b><input data-testid="new-item-initial-bid" id="new-item-bid" placeholder="Item bid"></input>
          <p></p>
          <b>Description: </b><input data-testid="new-item-desc" id = "new-item-desc" placeholder="Item description"></input>
          {/* Button that triggers the 'addItem' controller function. */}
          <button onClick={() => {addItem()}}>Add Item</button>
          
          {/* List to display items to auction. */}
          <ul>
            {/* Map over the *local* 'itemsToAuction' state variable. */}
            {itemsToAuction.map((item: Item) => (
            <li key={model.getItemId(item)}>{model.getItemName(item)} : {model.getItemDescription(item)}, ${model.getItemInitialBid(item)}</li>
              ))}
          </ul>
          
          <div>
            <br></br>
            <h1>Current Auction Item</h1>
            <h2>Change Auction Item</h2>
            {/* Input field to look up an item name for auction. */}
            <b>Name: </b><input data-testid="auction-item-name" id="item-lookup-name" placeholder="Item lookup name"></input>
            {/* Button that triggers the 'changeAuctionItem' controller function. */}
            <button onClick={() => {changeAuctionItem()}}>Auction Item</button>
            
            {/* Conditionally render this block based on the *local* 'currentItem' state. */}
            {currentItem.id != 0 ? (
            <div>
              <h3>Currently Auctioning:</h3>
              {/* Display details from the *local* 'currentItem' state. */}
              <p>{currentItem.name}: {currentItem.description}, ${currentItem.initialBid}</p>
                <h3>Record a Bid</h3>
                <p></p>
                {/* Input fields for recording a new bid. */}
                <b>Bidder Name: </b><input data-testid="test-bidder-name" id="item-bidder-name" placeholder="Bidder name"></input>

                <p></p> 
                <b>Bid Price: </b><input data-testid="test-bid-price" id = "item-bid-price" placeholder="Bid price"></input>
                {/* Button that triggers the 'updateItemBids' controller function. */}
                <button onClick={() => {updateItemBids()}}>Record Bid</button>
                <h3>Item Bids:</h3>
                {/* List to display bids for the current item. */}
                <ul>
                  {/* Map over the bids array from the *local* 'currentItem' state. */}
                  {currentItem.bids && currentItem.bids.map((bid: Bid, index: number)=>(
                    <li key={`${model.getBidderName(bid)}-${index}`}>
                      {model.getBidderName(bid)} : ${model.getBidPrice(bid)}
                    </li>
                  ))}
                </ul>
                <p></p>
                {/* Button that triggers the 'sellItem' controller function. */}
                <button onClick={() => {
                  sellItem()
                  }}>Sell Item?</button>
            </div>
          ) :
            // Show this message if no item is currently being auctioned.
            <p>No item is currently up for auction.</p>
          }
        </div>

        <div>
          <br></br>
          <h1>Sold Items</h1>
          {/* List to display sold items. */}
          <ul>
            {/* Check the length of the *local* 'soldItems' state. */}
            {soldItems.length > 0 ? (
              // Map over the *local* 'soldItems' state variable.
              soldItems.map((item: Item) => (
                <li key={model.getItemId(item)}>
                  {model.getItemName(item)}: {model.getItemDescription(item)}, Sold for: ${model.getBidPrice(model.getItemWinningBid(item))} to {model.getBidderName(model.getItemWinningBid(item))}
                </li>
              ))
            ) : (
              // Show this message if no items have been sold.
              <p>No items have been sold yet</p>
            )}
          </ul>
        </div>
        </div>
        
    )
}

// Export the 'ToAuctionItems' component for use in other files.
export { ToAuctionItems }