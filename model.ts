import { init } from "next/dist/compiled/webpack/webpack"

export class Model {
    // STATE PROPERTIES
    itemsToAuction: Item[]     // List of items available to be auctioned
    currentAuctionItem: Item // The single item currently up for bids
    soldItems: Item[]          // List of items that have been sold
    totalInitialBids: number   // Sum of all initial bids (used for calculating profit)
    totalSoldCost: number      // Sum of all winning bids
    totalFundsRaised: number   // The difference: totalSoldCost - totalInitialBids

    // The Constructor initializes the model's state
    constructor() {
        this.itemsToAuction = []
        // Initialize with a "dummy" item to avoid null checks
        this.currentAuctionItem = new Item(0, "", 0, "") 
        this.soldItems = []
        this.totalInitialBids = 0
        this.totalSoldCost = 0
        this.totalFundsRaised = 0
    }

    // --- Item Class Functions (Getters/Setters) ---
    // These just access properties of the Item class.
    getItemId(item: Item){
        return item.id
    }
    setItemId(id:number, item: Item){
        item.id = id
    }
    getItemName(item : Item){
        return item.name
    }
    setItemName(name: string, item: Item){
        item.name = name
    }
    getItemInitialBid(item: Item){
        return item.initialBid
    }
    setItemInitialBid(initialBid : number, item : Item){
        item.initialBid = initialBid
    }
    getItemBids(item: Item){
        return item.bids
    }
    getItemWinningBid(item: Item){
        return item.winningBid
    }
    setItemWinningBid(bid: Bid, item: Item){
        item.winningBid = bid
    }
    getItemDescription(item: Item){
        return item.description
    }

    // --- CONTROLLER LOGIC (Methods that change state) ---

    /** Adds a new item to the auction list. */
    addItemToAuction(item: Item) {
        // Basic input validation
        if(this.getItemId(this.currentAuctionItem) != 0 || this.soldItems.length >= 1){
            console.error("Auction Has Started")
        }
        else if(this.getItemName(item) != "" && this.getItemDescription(item) != "" && this.getItemInitialBid(item) != 0){
            this.itemsToAuction.push(item) // Mutate state: Add item
            this.totalInitialBids += this.getItemInitialBid(item) // Update total
            this.updateTotalFunds() // Recalculate
        }
        else{
            console.error("Enter Valid Inputs")
        } 
    }

    /** Moves an item from 'itemsToAuction' to 'currentAuctionItem'. */
    auctionItem(itemName: string){
        let itemToAuction = new Item(0, "", 0, "")
        // Find the item in the list by name
        for(const item of this.itemsToAuction){
            if(this.getItemName(item) == itemName){
                itemToAuction = item
            }
        }
        // Check: Is there already an item being auctioned? (id == 0 means "no item")
        // And, did we find the item in the list?
        if(this.getItemName(this.currentAuctionItem) == "" && this.itemsToAuction.includes(itemToAuction)){
            this.currentAuctionItem = itemToAuction // Mutate state: Set current item
            // Mutate state: Remove item from the available list
            const indexToRemove = this.itemsToAuction.indexOf(this.currentAuctionItem)
            this.itemsToAuction.splice(indexToRemove, 1)
        }
        else{
            console.error("Enter Valid Item")
        }
        
    }

    /** Sells the current item to the highest bidder. */
    sellItem(item: Item){
        // Check: Is this the current item? Does it have at least one bid (besides the initial one)?
        if(item == this.currentAuctionItem && this.getItemBids(item).length > 1){
            let highestBid : Bid = new Bid("", 0) // Start with a dummy low bid
            // Find the highest bid
            for(let i : number = 0; i < this.getItemBids(item).length; i++){
                let bidValue : number = this.getBidPrice(this.getItemBids(item)[i])
                if(bidValue > this.getBidPrice(highestBid)){
                    highestBid = this.getItemBids(item)[i]
                }
            }
            this.setItemWinningBid(highestBid, item) // Set the winner
            this.soldItems.push(item) // Mutate state: Move to soldItems
            this.currentAuctionItem = new Item(0, "", 0, "") // Mutate state: Reset current item
            this.totalSoldCost += this.getBidPrice(highestBid) // Update total
            this.updateTotalFunds() // Recalculate
        }
        else{
            console.error("Item doesn't meet sell criteria")
        }
    }
    
    /** Gets the current item (used by boundary). */
    getCurrentItem(){
        return this.currentAuctionItem
    }

    // --- Bid Class Functions (Getters/Setters) ---
    getBidPrice(bid: Bid){
        return bid.bidPrice
    }
    setBidPrice(price: number, bid :Bid){
        bid.bidPrice = price
    }
    getBidderName(bid: Bid){
        return bid.bidderName
    }
    setBidderName(name : string, bid : Bid){
        bid.bidderName = name 
    }

    /** Records a new bid for the current item. */
    recordBid(item: Item, bid: Bid){
        // Validation: Is this the current item? Is it not sold? Is the bid higher than the last bid?
        // Note: [0] is the highest bid because the list is sorted.
        if(item == this.currentAuctionItem && !this.soldItems.includes(item) && this.getBidPrice(bid) > this.getBidPrice(this.getItemBids(item)[0]) && this.getBidPrice(bid) >= this.getItemInitialBid(item)){
            item.bids.push(bid) // Mutate state: Add bid to item
        }
        else{
            console.error("Enter Valid Bid")
        }
        // Re-sort the bids list, highest first.
        item.bids.sort((a, b) => b.bidPrice - a.bidPrice)
    }

    // --- Misc Functions ---
    /** Recalculates the total funds. */
    updateTotalFunds(){
        this.totalFundsRaised = this.totalSoldCost - this.totalInitialBids
    }
}

// --- ENTITY CLASSES ---

/** Represents a single item for auction. */
export class Item {
    name : string
    id : number
    initialBid : number
    description: string
    bids : Bid[]       // List of bids placed on this item
    winningBid : Bid  // The bid that won

    constructor(id:number, name: string, initialBid:number, description:string) {
        this.name = name;
        this.id = id;
        this.initialBid = initialBid;
        this.description = description;
        // IMPORTANT: The bids array starts with the "Initial Bid" as its first entry.
        this.bids = [new Bid("Initial Bid", initialBid)];
        this.winningBid = new Bid("Initial Bid", initialBid)
    }
}

/** Represents a single bid. */
export class Bid{
    bidderName : string
    bidPrice : number

    constructor(bidderName:string, bidPrice:number){
        this.bidderName = bidderName;
        this.bidPrice = bidPrice;
    }
}